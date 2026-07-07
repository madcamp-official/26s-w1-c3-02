import json
from pathlib import Path

PW = 'pbkdf2_sha256$1200000$hm8GLPflDTxt91b6M57LOU$yCMpLUSp3I80MZGD1nF0urSCFepYCWmNVnsvNgUnmLM='
OUT = []


def add(model, pk, **fields):
    OUT.append({'model': model, 'pk': pk, 'fields': fields})


users = [
    (1, '테스트유저', 'a@b.com', '책 속의 문장을 나누고 서로의 생각을 연결하는 독자입니다.', '2026-07-03T12:00:00Z'),
    (2, 'seo_reader', 'seo@example.com', '', '2026-07-03T12:30:00Z'),
    (3, 'book_mate', 'mate@example.com', '', '2026-07-03T13:00:00Z'),
    (4, 'note_keeper', 'note@example.com', '', '2026-07-03T13:30:00Z'),
    (5, 'quiet_reader', 'quiet@example.com', '', '2026-07-03T14:00:00Z'),
    (6, 'easy0131', 'easy@example.com', '', '2026-07-03T15:00:00Z'),
    (7, '지나가는독서가', 'passerby@example.com', '', '2026-07-03T15:30:00Z'),
    (8, '정의구현빌런', 'justice@example.com', '', '2026-07-03T16:00:00Z'),
    (9, '헤세마니아', 'hesse@example.com', '', '2026-07-03T16:30:00Z'),
    (10, '책벌레', 'bookworm@example.com', '', '2026-07-03T17:00:00Z'),
    (11, '소설좋아', 'novel@example.com', '', '2026-07-03T17:30:00Z'),
    (12, '개발하는독자', 'devreader@example.com', '', '2026-07-03T18:00:00Z'),
    (13, 'easy00', 'easy_o@kaist.ac.kr', '', '2026-07-07T06:00:00Z'),
]

for pk, nickname, email, bio, joined in users:
    add(
        'accounts.user',
        pk,
        password=PW,
        last_login=None,
        is_superuser=False,
        is_staff=False,
        is_active=True,
        date_joined=joined,
        email=email,
        nickname=nickname,
        bio=bio,
        avatar_url='',
        avatar_icon='',
    )


# Aladin Open API ItemLookUp results, normalized with books.aladin.normalize_aladin_item.
books = [
    (
        1,
        '데미안',
        '헤르만 헤세 (지은이), 전영애 (옮긴이)',
        '2000-12-20',
        '9788937460449',
        '국내도서>소설/시/희곡>독일소설',
        'https://image.aladin.co.kr/product/26/0/cover200/s452139198_1.jpg',
    ),
    (
        2,
        '참을 수 없는 존재의 가벼움',
        '밀란 쿤데라 (지은이), 이재룡 (옮긴이)',
        '2009-12-24',
        '9788937462344',
        '국내도서>소설/시/희곡>세계의 소설>동유럽소설',
        'https://image.aladin.co.kr/product/610/30/cover200/s772137205_1.jpg',
    ),
    (
        3,
        '1984',
        '조지 오웰 (지은이), 정회성 (옮긴이)',
        '2003-06-16',
        '9788937460777',
        '국내도서>소설/시/희곡>영미소설',
        'https://image.aladin.co.kr/product/41/89/cover200/s122531356_2.jpg',
    ),
    (
        4,
        '사피엔스',
        '유발 하라리 (지은이), 조현욱 (옮긴이), 이태수 (감수)',
        '2023-04-01',
        '9788934972464',
        '국내도서>인문학>인류학/고고학>인류학',
        'https://image.aladin.co.kr/product/31424/4/cover200/k482832219_1.jpg',
    ),
    (
        5,
        '소년이 온다',
        '한강 (지은이)',
        '2014-05-19',
        '9788936434120',
        '국내도서>소설/시/희곡>한국소설>2000년대 이후 한국소설',
        'https://image.aladin.co.kr/product/4086/97/cover200/8936434128_2.jpg',
    ),
    (
        6,
        '인간 실격',
        '다자이 오사무 (지은이), 김춘미 (옮긴이)',
        '2004-05-15',
        '9788937461033',
        '국내도서>소설/시/희곡>일본소설>1950년대 이전 일본소설',
        'https://image.aladin.co.kr/product/49/16/cover200/893746103x_3.jpg',
    ),
    (
        7,
        '설국',
        '가와바타 야스나리 (지은이), 유숙자 (옮긴이)',
        '2002-01-28',
        '9788937460616',
        '국내도서>소설/시/희곡>일본소설>1950년대 이후 일본소설',
        'https://image.aladin.co.kr/product/32/87/cover200/s092934786_1.jpg',
    ),
    (
        8,
        '백의 그림자',
        '황정은 (지은이)',
        '2010-06-25',
        '9788937483059',
        '국내도서>소설/시/희곡>한국소설>2000년대 이후 한국소설',
        'https://image.aladin.co.kr/product/729/55/cover200/893748305x_1.jpg',
    ),
    (
        9,
        '우리가 빛의 속도로 갈 수 없다면',
        '김초엽 (지은이)',
        '2019-06-24',
        '9791190090018',
        '국내도서>소설/시/희곡>과학소설(SF)>한국 과학소설',
        'https://image.aladin.co.kr/product/19359/16/cover200/s722039767_1.jpg',
    ),
]

for pk, title, author, publish_date, isbn, genre_code, cover_image_url in books:
    add(
        'books.book',
        pk,
        title=title,
        author=author,
        publish_date=publish_date,
        isbn=isbn,
        genre_code=genre_code,
        cover_image_url=cover_image_url,
        created_at='2026-07-03T00:00:00Z',
    )


friends = [
    (1, 2, 1, 'PENDING', '2026-07-03T14:00:00Z'),
    (2, 1, 4, 'PENDING', '2026-07-03T14:30:00Z'),
    (3, 1, 3, 'ACCEPTED', '2026-07-03T13:10:00Z'),
    (4, 5, 1, 'ACCEPTED', '2026-07-03T13:20:00Z'),
    (5, 10, 1, 'PENDING', '2026-07-03T15:00:00Z'),
    (6, 11, 1, 'PENDING', '2026-07-03T16:30:00Z'),
    (7, 1, 12, 'PENDING', '2026-07-03T17:00:00Z'),
    (8, 1, 6, 'ACCEPTED', '2026-07-03T18:00:00Z'),
    (9, 1, 7, 'ACCEPTED', '2026-07-03T18:30:00Z'),
]

for pk, requester, addressee, status, created_at in friends:
    add('accounts.friend', pk, requester=requester, addressee=addressee, status=status, created_at=created_at)


groups = [
    (1, '데미안 읽기 모임', 1, [1, 2, 3, 9], [1], '2026-07-03T15:10:00Z'),
    (2, '인문 과학 노트', 3, [1, 3, 5], [4, 9], '2026-07-03T15:40:00Z'),
    (3, '한국소설 같이 읽기', 9, [9, 1, 5, 7, 11], [5, 8], '2026-07-01T14:00:00Z'),
    (4, 'madCamp 개발자 독서회', 1, [1, 6, 12], [3, 9], '2026-07-03T11:00:00Z'),
]

member_pk = 0
group_book_pk = 0
for pk, group_name, owner, members, group_books, created_at in groups:
    add('groups.group', pk, group_name=group_name, owner=owner, created_at=created_at)
    for user in members:
        member_pk += 1
        add('groups.groupmember', member_pk, group=pk, user=user, status='ACCEPTED', joined_at=created_at)
    for book in group_books:
        group_book_pk += 1
        add('groups.groupbook', group_book_pk, group=pk, book=book)


annotations = [
    (
        1,
        1,
        1,
        None,
        'QUESTION',
        '새는 알에서 나오려고 투쟁한다. 알은 세계다.',
        '성장이 부드러운 확장이 아니라 기존 세계를 깨는 일이라는 점이 선명하게 느껴진다.',
        48,
        'public',
        False,
        '2026-07-07T00:10:00Z',
    ),
    (
        2,
        1,
        2,
        1,
        'DISCUSSION',
        '태어나려는 자는 하나의 세계를 깨뜨려야 한다.',
        '데미안 모임에서 가장 먼저 이야기하고 싶은 문장. 변화가 왜 늘 두려움과 같이 오는지 묻고 싶다.',
        49,
        'group',
        False,
        '2026-07-07T00:40:00Z',
    ),
    (
        3,
        2,
        1,
        None,
        'REVIEW',
        '한 번뿐인 것은 전혀 없었던 것과 같다.',
        '가벼움이라는 말이 오히려 삶의 무게를 더 또렷하게 만든다.',
        11,
        'public',
        False,
        '2026-07-07T01:10:00Z',
    ),
    (
        4,
        3,
        8,
        4,
        'QUESTION',
        '전쟁은 평화, 자유는 예속, 무지는 힘.',
        '슬로건이 현실을 덮어버릴 때 사람들은 어떤 방식으로 저항할 수 있을까?',
        34,
        'group',
        False,
        '2026-07-07T01:40:00Z',
    ),
    (
        5,
        4,
        3,
        2,
        'NORMAL',
        '우리가 밀을 길들인 것이 아니라 밀이 우리를 길들였다.',
        '농업혁명을 다르게 바라보게 만드는 문장. 읽을수록 주체가 뒤집힌다.',
        96,
        'group',
        False,
        '2026-07-07T02:10:00Z',
    ),
    (
        6,
        5,
        11,
        3,
        'REVIEW',
        '당신이 죽은 뒤 장례식을 치르지 못해, 내 삶이 장례식이 되었습니다.',
        '상실이 한 사람의 일상을 어떻게 바꾸는지 보여주는 문장이라 오래 남는다.',
        102,
        'group',
        True,
        '2026-07-07T02:40:00Z',
    ),
    (
        7,
        6,
        5,
        None,
        'DISCUSSION',
        '부끄럼 많은 생애를 보냈습니다.',
        '첫 문장부터 고백과 변명이 동시에 들린다. 독자가 어느 거리에서 읽어야 할지 고민하게 된다.',
        7,
        'friends',
        False,
        '2026-07-07T03:10:00Z',
    ),
    (
        8,
        7,
        7,
        None,
        'NORMAL',
        '국경의 긴 터널을 빠져나오자, 눈의 고장이었다.',
        '장면이 열리는 속도가 압도적이다. 풍경이 곧 감정의 입구가 된다.',
        9,
        'public',
        False,
        '2026-07-07T03:40:00Z',
    ),
    (
        9,
        8,
        1,
        3,
        'QUESTION',
        '그림자가 일어선다는 것은 무엇을 두고 하는 말일까.',
        '현실적인 배경 안에 낯선 감각이 섞이는 지점이 좋아서 같이 해석해보고 싶다.',
        42,
        'group',
        False,
        '2026-07-07T04:10:00Z',
    ),
    (
        10,
        9,
        12,
        4,
        'REVIEW',
        '우리가 빛의 속도로 갈 수조차 없다면, 같은 우주라는 말을 어떻게 믿을 수 있을까.',
        'SF적 상상력이 관계의 거리와 기다림을 말하는 방식이 인상적이다.',
        156,
        'group',
        False,
        '2026-07-07T04:40:00Z',
    ),
    (
        11,
        9,
        1,
        None,
        'DISCUSSION',
        '나는 내가 이해하지 못하는 세계에도 누군가의 자리가 있다는 것을 배웠다.',
        '정확한 인용이라기보다 읽고 난 뒤 남은 감각에 가까운 메모. 다양성을 다루는 방식이 따뜻했다.',
        83,
        'public',
        False,
        '2026-07-07T05:10:00Z',
    ),
    (
        12,
        4,
        1,
        None,
        'QUESTION',
        '인간은 이야기로 협력하는 동물이라는 설명은 어디까지 유효할까?',
        '공동체와 서비스 설계를 같이 생각하게 만드는 대목이라 따로 적어두었다.',
        171,
        'private',
        False,
        '2026-07-07T05:40:00Z',
    ),
    (
        13,
        9,
        13,
        None,
        'REVIEW',
        '우리는 그곳에 갈 수 없지만, 서로를 향한 문장은 계속 도착한다.',
        '빛의 속도보다 느린 관계를 다루는 방식이 좋아서 다시 표시해 두었다.',
        37,
        'public',
        False,
        '2026-07-07T06:10:00Z',
    ),
    (
        14,
        9,
        13,
        None,
        'QUESTION',
        '멀리 있는 사람을 이해한다는 건 거리 자체를 받아들이는 일일까.',
        '같은 책에 두 번째로 남기는 메모. SF 장르가 주석 수만큼 집계되는지 보기 좋다.',
        88,
        'public',
        False,
        '2026-07-07T06:20:00Z',
    ),
    (
        15,
        9,
        13,
        None,
        'DISCUSSION',
        '불가능한 이동보다 오래 기다리는 마음이 더 선명하게 남는다.',
        '세 번째 SF 메모. 취향 분석에서 과학소설 쪽이 크게 잡히는지 확인한다.',
        132,
        'public',
        False,
        '2026-07-07T06:30:00Z',
    ),
    (
        16,
        4,
        13,
        None,
        'NORMAL',
        '상상 속 질서는 많은 사람을 실제로 움직이게 만든다.',
        '사피엔스의 핵심 문제의식이 서비스와 커뮤니티 설계에도 닿아 있다.',
        44,
        'public',
        False,
        '2026-07-07T06:40:00Z',
    ),
    (
        17,
        4,
        13,
        None,
        'QUESTION',
        '우리가 믿는 이야기는 언제 협력이 되고 언제 폭력이 될까.',
        '같은 인문학 책에 두 번째 주석. 같은 책 중복 카운트 확인용이다.',
        213,
        'public',
        False,
        '2026-07-07T06:50:00Z',
    ),
    (
        18,
        3,
        13,
        None,
        'DISCUSSION',
        '기록을 고치는 사람은 결국 기억을 고치는 사람이다.',
        '1984를 읽을 때마다 데이터와 권력의 관계를 다시 생각하게 된다.',
        76,
        'public',
        False,
        '2026-07-07T07:00:00Z',
    ),
    (
        19,
        1,
        13,
        None,
        'REVIEW',
        '새는 알에서 나오려고 투쟁한다.',
        '짧은 문장인데 계속 시작점으로 돌아오게 만든다.',
        48,
        'public',
        False,
        '2026-07-07T07:10:00Z',
    ),
    (
        20,
        5,
        13,
        None,
        'NORMAL',
        '살아남은 사람의 시간은 종종 멈춘 곳에서 다시 시작된다.',
        '소년이 온다의 문장들은 읽는 속도를 일부러 늦추게 한다.',
        119,
        'public',
        False,
        '2026-07-07T07:20:00Z',
    ),
]

for pk, book, user, group, typ, passage, review, page, visibility, is_spoiler, created_at in annotations:
    add(
        'annotations.annotation',
        pk,
        user=user,
        book=book,
        group=group,
        type=typ,
        passage=passage,
        review=review,
        page=page,
        visibility=visibility,
        is_spoiler=is_spoiler,
        created_at=created_at,
    )


comments = [
    (1, 1, 2, 'REVIEW', '이 문장 때문에 데미안을 다시 읽고 싶어졌어요.', '2026-07-04T10:00:00Z'),
    (2, 1, 9, 'DISCUSSION', '세계를 깬다는 표현이 지금 읽어도 강하네요.', '2026-07-04T10:30:00Z'),
    (3, 3, 5, 'NORMAL', '가벼움과 책임이 같이 떠오르는 부분이었어요.', '2026-07-04T11:00:00Z'),
    (4, 5, 1, 'QUESTION', '농업혁명 파트를 읽고 나면 진짜 관점이 바뀌는 것 같아요.', '2026-07-04T11:30:00Z'),
    (5, 10, 6, 'REVIEW', '이 책은 과학보다 마음의 거리 이야기처럼 읽혔어요.', '2026-07-04T12:00:00Z'),
]

for pk, annotation, user, typ, content, created_at in comments:
    add(
        'annotations.comment',
        pk,
        annotation=annotation,
        user=user,
        type=typ,
        content=content,
        created_at=created_at,
    )


for pk, book in enumerate([1, 3, 5, 9], 1):
    add('books.bookfavorite', pk, user=1, book=book, created_at='2026-07-04T13:00:00Z')

for pk, annotation in enumerate([1, 3, 10], 1):
    add('annotations.annotationfavorite', pk, user=1, annotation=annotation, created_at='2026-07-04T13:10:00Z')


likes = {
    ('annotation', 1): [2, 3, 4, 6, 9],
    ('annotation', 2): [1, 3, 5, 9],
    ('annotation', 3): [2, 5, 7],
    ('annotation', 4): [1, 6, 8, 12],
    ('annotation', 5): [1, 2, 5],
    ('annotation', 6): [1, 5, 7, 11],
    ('annotation', 7): [1, 3],
    ('annotation', 8): [1, 4, 5, 10],
    ('annotation', 9): [5, 7, 11],
    ('annotation', 10): [1, 3, 6, 9],
    ('annotation', 11): [2, 6, 12],
    ('comment', 1): [1, 3, 4],
    ('comment', 2): [2, 5],
    ('comment', 3): [1, 7],
    ('comment', 5): [1, 12],
}

like_pk = 0
for (target_type, target_id), users_for_like in likes.items():
    for user in users_for_like:
        like_pk += 1
        add(
            'annotations.like',
            like_pk,
            user=user,
            target_type=target_type,
            target_id=target_id,
            created_at='2026-07-04T14:00:00Z',
        )


fixture_path = Path(__file__).with_name('seed.json')
fixture_path.write_text(json.dumps(OUT, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'{len(OUT)} objects written to {fixture_path}')
