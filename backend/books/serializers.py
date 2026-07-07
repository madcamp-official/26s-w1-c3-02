from rest_framework import serializers

from .aladin import clean_author
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    bookId = serializers.IntegerField(source='id', read_only=True)
    publishDate = serializers.DateField(source='publish_date', required=False, allow_null=True)
    genreCode = serializers.CharField(source='genre_code', required=False, allow_blank=True)
    coverImageUrl = serializers.CharField(source='cover_image_url', required=False, allow_blank=True)
    annotationCount = serializers.SerializerMethodField()
    isFavorited = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'bookId',
            'title',
            'author',
            'publishDate',
            'isbn',
            'genreCode',
            'coverImageUrl',
            'annotationCount',
            'isFavorited',
        ]

    def get_annotationCount(self, obj):
        return getattr(obj, 'annotation_count', None) or obj.annotations.count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['author'] = clean_author(data.get('author'))
        return data

    def get_isFavorited(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False

        annotated_value = getattr(obj, 'is_favorited', None)
        if annotated_value is not None:
            return bool(annotated_value)

        return obj.favorites.filter(user=request.user).exists()
