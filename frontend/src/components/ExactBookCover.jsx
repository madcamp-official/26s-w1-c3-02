export default function ExactBookCover({
  coverImageUrl,
  title,
  maxWidth = 115,
  maxHeight = 154,
  fallbackClassName = '',
  imageClassName = '',
}) {
  if (coverImageUrl) {
    return (
      <span className="inline-flex items-end align-top" style={{ height: `${maxHeight}px` }}>
        <img
          className={`block h-auto w-auto rounded-xs object-contain object-bottom shadow-soft ${imageClassName}`}
          style={{ maxWidth: `${maxWidth}px`, maxHeight: `${maxHeight}px` }}
          src={coverImageUrl}
          alt={title}
        />
      </span>
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-xs bg-primary-soft p-2 text-center text-xs font-bold text-text-subtle shadow-soft ${fallbackClassName}`}
      style={{ width: `${maxWidth}px`, height: `${maxHeight}px` }}
    >
      No Cover
    </div>
  );
}
