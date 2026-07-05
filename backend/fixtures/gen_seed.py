# mock-server.js의 데모 데이터를 Django fixture(seed.json)로 변환
import json

PW = 'pbkdf2_sha256$1200000$hm8GLPflDTxt91b6M57LOU$yCMpLUSp3I80MZGD1nF0urSCFepYCWmNVnsvNgUnmLM='
out = []

def add(model, pk, **fields):
    out.append({'model': model, 'pk': pk, 'fields': fields})

# ---- users (mock-server.js users[]) ----
users = [
    (1, '테스트유저', 'a@b.com', '책 속의 문장이 나를 바꾸고, 나의 문장이 누군가에게 닿기를.', '2026-07-03T12:00:00Z'),
    (2, 'seo_reader', 'seo@example.com', '', '2026-07-03T12:30:00Z'),
    (3, 'book_mate', 'mate@example.com', '', '2026-07-03T13:00:00Z'),
    (4, 'note_keeper', 'note@example.com', '', '2026-07-03T13:30:00Z'),
    (5, 'quiet_reader', 'quiet@example.com', '', '2026-07-03T14:00:00Z'),
    (6, 'easy0131', 'easy@example.com', '', '2026-07-03T15:00:00Z'),
    (7, '지나가던독서가', 'passerby@example.com', '', '2026-07-03T15:30:00Z'),
    (8, '정의구현빌런', 'justice@example.com', '', '2026-07-03T16:00:00Z'),
    (9, '헤세매니아', 'hesse@example.com', '', '2026-07-03T16:30:00Z'),
    (10, '책벌레A', 'bookworm@example.com', '', '2026-07-03T17:00:00Z'),
    (11, '소설조아', 'novel@example.com', '', '2026-07-03T17:30:00Z'),
    (12, '개발하는독자', 'devreader@example.com', '', '2026-07-03T18:00:00Z'),
]
for pk, nick, email, bio, joined in users:
    add('accounts.user', pk, password=PW, last_login=None, is_superuser=False,
        is_staff=False, is_active=True, date_joined=joined,
        email=email, nickname=nick, bio=bio, avatar_url='', avatar_icon='')

# ---- books ----
books = [
    (1, 'The Little Prince', 'Antoine de Saint-Exupery', '1943-04-06', '9780156012195', 'NOVEL',
     'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=420&q=80'),
    (2, 'Demian', 'Hermann Hesse', '1919-01-01', '9780143106784', 'NOVEL',
     'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=420&q=80'),
    (3, 'The Stranger', 'Albert Camus', '1942-01-01', '9780679720201', 'NOVEL',
     'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=420&q=80'),
    (4, 'Sapiens', 'Yuval Noah Harari', '2011-01-01', '9780062316097', 'HUMANITIES',
     'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=420&q=80'),
    (5, 'Cosmos', 'Carl Sagan', '1980-01-01', '9780345539434', 'SCIENCE',
     'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=420&q=80'),
    (6, '데미안', '헤르만 헤세', '1919-01-01', '9788937460449', 'NOVEL', ''),
    (7, '호밀밭의 파수꾼', 'J.D. 샐린저', '1951-07-16', '9788937460470', 'NOVEL', ''),
    (8, '정의란 무엇인가', '마이클 샌델', '2010-05-26', '9788934939603', 'HUMANITY', ''),
    (9, '군주론', '니콜로 마키아벨리', '1532-01-01', '9788937460777', 'HUMANITY', ''),
    (10, '1984', '조지 오웰', '1949-06-08', '9788937460778', 'NOVEL', ''),
]
for pk, title, author, pub, isbn, genre, cover in books:
    add('books.book', pk, title=title, author=author, publish_date=pub, isbn=isbn,
        genre_code=genre, cover_image_url=cover, created_at='2026-07-03T00:00:00Z')

# ---- friends (mock friendRequests[]) ----
friends = [
    (2, 1, 'PENDING', '2026-07-03T14:00:00Z'),
    (1, 4, 'PENDING', '2026-07-03T14:30:00Z'),
    (1, 3, 'ACCEPTED', '2026-07-03T13:10:00Z'),
    (5, 1, 'ACCEPTED', '2026-07-03T13:20:00Z'),
    (10, 1, 'PENDING', '2026-07-03T15:00:00Z'),
    (11, 1, 'PENDING', '2026-07-03T16:30:00Z'),
    (1, 12, 'PENDING', '2026-07-03T17:00:00Z'),
    (1, 6, 'ACCEPTED', '2026-07-03T18:00:00Z'),
    (1, 7, 'ACCEPTED', '2026-07-03T18:30:00Z'),
]
for i, (req, addr, status, ts) in enumerate(friends, 1):
    add('accounts.friend', i, requester=req, addressee=addr, status=status, created_at=ts)

# ---- groups ----
groups = [
    (1, 'Demian Reading Room', 1, [1, 2, 3], [2], '2026-07-03T15:10:00Z'),
    (2, 'Science Notes', 3, [1, 3, 5], [4, 5], '2026-07-03T15:40:00Z'),
    (9, '데미안 같이 읽기 소모임', 9, [9, 1, 5, 7], [6, 7], '2026-07-01T14:00:00Z'),
    (10, 'madCamp 웹 개발 스터디', 1, [1, 6], [8], '2026-07-03T11:00:00Z'),
]
mpk = bpk = 0
for pk, name, owner, members, gbooks, ts in groups:
    add('groups.group', pk, group_name=name, owner=owner, created_at=ts)
    for u in members:
        mpk += 1
        add('groups.groupmember', mpk, group=pk, user=u, joined_at=ts)
    for b in gbooks:
        bpk += 1
        add('groups.groupbook', bpk, group=pk, book=b)

# ---- annotations (id, book, user, type, passage, review, page, visibility, spoiler, group) ----
annotations = [
    (1, 1, 1, 'QUESTION', 'What makes a person responsible for what they tame?',
     'This line feels simple, but it asks for a complete ethic of care.', 33, 'public', False, None),
    (2, 2, 2, 'REVIEW', 'The bird fights its way out of the egg.',
     'A sharp image for growing up: the world has to crack before it becomes larger.', 48, 'public', False, None),
    (3, 3, 1, 'DISCUSSION', 'Mother died today. Or maybe yesterday; I cannot be sure.',
     'The emotional distance is uncomfortable, which is exactly why it works.', 9, 'friends', False, None),
    (4, 4, 3, 'NORMAL', 'History began when humans invented gods, and will end when humans become gods.',
     'Useful sentence for talking about technology and hubris.', 412, 'public', True, None),
    (5, 5, 1, 'REVIEW', 'Somewhere, something incredible is waiting to be known.',
     'A good reminder that curiosity is not decoration. It is propulsion.', 72, 'private', False, None),
    (6, 2, 1, 'NORMAL', 'I wanted only to try to live in accord with the promptings which came from my true self.',
     'A personal compass sentence.', 12, 'group', False, 1),
    (7, 1, 3, 'DISCUSSION', 'It is only with the heart that one can see rightly.',
     'The most quoted line still deserves a real conversation.', 64, 'public', False, None),
    (8, 6, 1, 'REVIEW', '새는 알에서 나오려고 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다.',
     '안주해 있던 현실의 알을 깨부수고 자기 자신이라는 세계로 나아가는 고통스러운 성장의 과정을 묘사한 인생 명구절입니다.', 48, 'public', False, 9),
    (9, 7, 1, 'DISCUSSION', '내가 하고 싶은 건 오직 호밀밭의 파수꾼이 되는 거야.',
     '순수함을 간직한 채 위선적인 어른들의 세계에서 탈출하고 싶어하는 홀든의 진심어린 독백이 인상적입니다.', 211, 'public', True, 9),
    (10, 8, 1, 'QUESTION', '정의로운 사회는 단순히 효용을 극대화하거나 선택의 자유를 존중하는 것만으로는 완성되지 않는다.',
     '공리주의와 자유지상주의 각각의 한계가 뭘까요? 다른 분들 생각이 궁금합니다.', 35, 'public', False, 10),
    (11, 6, 9, 'DISCUSSION', '나는 내 안에서 솟아나오려는 것, 바로 그것을 살아보려 했다.',
     '이 그룹에서 가장 많이 인용된 문장입니다.', 12, 'group', False, 9),
]
for pk, book, user, typ, passage, review, page, vis, spoiler, group in annotations:
    add('annotations.annotation', pk, user=user, book=book, group=group, type=typ,
        passage=passage, review=review, page=page, visibility=vis, is_spoiler=spoiler,
        created_at=f'2026-07-03T{11 + pk}:00:00Z')

# ---- comments ----
comments = [
    (1, 1, 2, 'REVIEW', 'I read this as care becoming a promise.', '2026-07-03T15:00:00Z'),
    (2, 1, 3, 'QUESTION', 'The page number helped me find it immediately. Does this connect to the ending too?', '2026-07-03T15:30:00Z'),
    (3, 2, 1, 'DISCUSSION', 'This passage always feels like a door opening.', '2026-07-03T16:00:00Z'),
]
for pk, ann, user, typ, content, ts in comments:
    add('annotations.comment', pk, annotation=ann, user=user, type=typ, content=content, created_at=ts)

# ---- favorites (mock: favoriteBookIds {1,3,5}, favoriteAnnotationIds {2,4} — user 1 기준) ----
for i, b in enumerate([1, 3, 5], 1):
    add('books.bookfavorite', i, user=1, book=b, created_at='2026-07-03T18:00:00Z')
for i, a in enumerate([2, 4], 1):
    add('annotations.annotationfavorite', i, user=1, annotation=a, created_at='2026-07-03T18:00:00Z')

# ---- likes (mock likeCount는 수백 건이라 재현 불가 → COUNT 정렬이 유의미하도록 상대적 크기만 유지) ----
likes = {
    ('annotation', 1): [1, 4, 6, 7],
    ('annotation', 2): [1, 3, 5, 6, 9],
    ('annotation', 3): [3, 5],
    ('annotation', 4): [2, 5, 6],
    ('annotation', 5): [3],
    ('annotation', 6): [2],
    ('annotation', 7): [2, 3, 4, 5, 6, 8],
    ('annotation', 8): [2, 3, 5, 7],
    ('annotation', 9): [5, 7],
    ('annotation', 10): [6],
    ('annotation', 11): [1, 5],
    ('comment', 1): [1, 3, 4],
    ('comment', 2): [5],
    ('comment', 3): [2, 4],
}
pk = 0
for (ttype, tid), user_ids in likes.items():
    for u in user_ids:
        pk += 1
        add('annotations.like', pk, user=u, target_type=ttype, target_id=tid,
            created_at='2026-07-04T00:00:00Z')

with open(r'c:\Users\suh10\workspace\madCamp\26s-w1-c3-02\backend\fixtures\seed.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)
print(f'{len(out)} objects written')
