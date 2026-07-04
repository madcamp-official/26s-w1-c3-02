import jsonServer from 'json-server';

const server = jsonServer.create();
const router = jsonServer.router({});
const middlewares = jsonServer.defaults();
const PORT = Number(process.env.MOCK_PORT || 4000);

server.use(middlewares);
server.use(jsonServer.bodyParser);

let nextUserId = 13;
let nextBookId = 11;
let nextAnnotationId = 12;
let nextCommentId = 4;
let nextGroupId = 3;
let nextLikeId = 1;

const currentUserId = 1;

const users = [
  {
    id: 1,
    nickname: '테스트유저',
    email: 'a@b.com',
    password: 'pw1234!!',
    bio: '책 속의 문장이 나를 바꾸고, 나의 문장이 누군가에게 닿기를.',
    avatarUrl: '',
    avatarIcon: '',
    createdAt: '2026-07-03T12:00:00Z',
  },
  { id: 2, nickname: 'seo_reader', email: 'seo@example.com', password: 'pw1234!!', createdAt: '2026-07-03T12:30:00Z' },
  { id: 3, nickname: 'book_mate', email: 'mate@example.com', password: 'pw1234!!', createdAt: '2026-07-03T13:00:00Z' },
  { id: 4, nickname: 'note_keeper', email: 'note@example.com', password: 'pw1234!!', createdAt: '2026-07-03T13:30:00Z' },
  { id: 5, nickname: 'quiet_reader', email: 'quiet@example.com', password: 'pw1234!!', createdAt: '2026-07-03T14:00:00Z' },
  { id: 6, nickname: 'easy0131', email: 'easy@example.com', password: 'pw1234!!', createdAt: '2026-07-03T15:00:00Z' },
  { id: 7, nickname: '지나가던독서가', email: 'passerby@example.com', password: 'pw1234!!', createdAt: '2026-07-03T15:30:00Z' },
  { id: 8, nickname: '정의구현빌런', email: 'justice@example.com', password: 'pw1234!!', createdAt: '2026-07-03T16:00:00Z' },
  { id: 9, nickname: '헤세매니아', email: 'hesse@example.com', password: 'pw1234!!', createdAt: '2026-07-03T16:30:00Z' },
  { id: 10, nickname: '책벌레A', email: 'bookworm@example.com', password: 'pw1234!!', createdAt: '2026-07-03T17:00:00Z' },
  { id: 11, nickname: '소설조아', email: 'novel@example.com', password: 'pw1234!!', createdAt: '2026-07-03T17:30:00Z' },
  { id: 12, nickname: '개발하는독자', email: 'devreader@example.com', password: 'pw1234!!', createdAt: '2026-07-03T18:00:00Z' },
];

const books = [
  {
    bookId: 1,
    title: 'The Little Prince',
    author: 'Antoine de Saint-Exupery',
    publishDate: '1943-04-06',
    isbn: '9780156012195',
    genreCode: 'NOVEL',
    coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=420&q=80',
  },
  {
    bookId: 2,
    title: 'Demian',
    author: 'Hermann Hesse',
    publishDate: '1919-01-01',
    isbn: '9780143106784',
    genreCode: 'NOVEL',
    coverImageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=420&q=80',
  },
  {
    bookId: 3,
    title: 'The Stranger',
    author: 'Albert Camus',
    publishDate: '1942-01-01',
    isbn: '9780679720201',
    genreCode: 'NOVEL',
    coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=420&q=80',
  },
  {
    bookId: 4,
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    publishDate: '2011-01-01',
    isbn: '9780062316097',
    genreCode: 'HUMANITIES',
    coverImageUrl: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=420&q=80',
  },
  {
    bookId: 5,
    title: 'Cosmos',
    author: 'Carl Sagan',
    publishDate: '1980-01-01',
    isbn: '9780345539434',
    genreCode: 'SCIENCE',
    coverImageUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=420&q=80',
  },
  {
    bookId: 6,
    title: '데미안',
    author: '헤르만 헤세',
    publishDate: '1919-01-01',
    isbn: '9788937460449',
    genreCode: 'NOVEL',
    coverImageUrl: '',
  },
  {
    bookId: 7,
    title: '호밀밭의 파수꾼',
    author: 'J.D. 샐린저',
    publishDate: '1951-07-16',
    isbn: '9788937460470',
    genreCode: 'NOVEL',
    coverImageUrl: '',
  },
  {
    bookId: 8,
    title: '정의란 무엇인가',
    author: '마이클 샌델',
    publishDate: '2010-05-26',
    isbn: '9788934939603',
    genreCode: 'HUMANITY',
    coverImageUrl: '',
  },
  {
    bookId: 9,
    title: '군주론',
    author: '니콜로 마키아벨리',
    publishDate: '1532-01-01',
    isbn: '9788937460777',
    genreCode: 'HUMANITY',
    coverImageUrl: '',
  },
  {
    bookId: 10,
    title: '1984',
    author: '조지 오웰',
    publishDate: '1949-06-08',
    isbn: '9788937460778',
    genreCode: 'NOVEL',
    coverImageUrl: '',
  },
];

const favoriteBookIds = new Set([1, 3, 5]);
const favoriteAnnotationIds = new Set([2, 4]);
const likedTargets = new Set(['annotation:1', 'annotation:2', 'comment:1']);

const annotations = [
  makeAnnotation(1, 1, 1, 'QUESTION', 'What makes a person responsible for what they tame?', 'This line feels simple, but it asks for a complete ethic of care.', 33, 'public', false, 18, 2),
  makeAnnotation(2, 2, 2, 'REVIEW', 'The bird fights its way out of the egg.', 'A sharp image for growing up: the world has to crack before it becomes larger.', 48, 'public', false, 31, 1),
  makeAnnotation(3, 3, 1, 'DISCUSSION', 'Mother died today. Or maybe yesterday; I cannot be sure.', 'The emotional distance is uncomfortable, which is exactly why it works.', 9, 'friends', false, 12, 0),
  makeAnnotation(4, 4, 3, 'NORMAL', 'History began when humans invented gods, and will end when humans become gods.', 'Useful sentence for talking about technology and hubris.', 412, 'public', true, 21, 0),
  makeAnnotation(5, 5, 1, 'REVIEW', 'Somewhere, something incredible is waiting to be known.', 'A good reminder that curiosity is not decoration. It is propulsion.', 72, 'private', false, 8, 0),
  makeAnnotation(6, 2, 1, 'NORMAL', 'I wanted only to try to live in accord with the promptings which came from my true self.', 'A personal compass sentence.', 12, 'group', false, 4, 0, 1),
  makeAnnotation(7, 1, 3, 'DISCUSSION', 'It is only with the heart that one can see rightly.', 'The most quoted line still deserves a real conversation.', 64, 'public', false, 44, 0),
  makeAnnotation(8, 6, 1, 'REVIEW', '새는 알에서 나오려고 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 깨뜨려야 한다.', '안주해 있던 현실의 알을 깨부수고 자기 자신이라는 세계로 나아가는 고통스러운 성장의 과정을 묘사한 인생 명구절입니다.', 48, 'public', false, 15, 4, 9),
  makeAnnotation(9, 7, 1, 'DISCUSSION', '내가 하고 싶은 건 오직 호밀밭의 파수꾼이 되는 거야.', '순수함을 간직한 채 위선적인 어른들의 세계에서 탈출하고 싶어하는 홀든의 진심어린 독백이 인상적입니다.', 211, 'public', true, 8, 1, 9),
  makeAnnotation(10, 8, 1, 'QUESTION', '정의로운 사회는 단순히 효용을 극대화하거나 선택의 자유를 존중하는 것만으로는 완성되지 않는다.', '공리주의와 자유지상주의 각각의 한계가 뭘까요? 다른 분들 생각이 궁금합니다.', 35, 'public', false, 5, 6, 10),
  makeAnnotation(11, 6, 9, 'DISCUSSION', '나는 내 안에서 솟아나오려는 것, 바로 그것을 살아보려 했다.', '이 그룹에서 가장 많이 인용된 문장입니다.', 12, 'group', false, 6, 2, 9),
];

const comments = [
  { commentId: 1, annotationId: 1, author: publicUser(2), type: 'REVIEW', content: 'I read this as care becoming a promise.', likeCount: 3, isLiked: true, createdAt: '2026-07-03T15:00:00Z' },
  { commentId: 2, annotationId: 1, author: publicUser(3), type: 'QUESTION', content: 'The page number helped me find it immediately. Does this connect to the ending too?', likeCount: 1, isLiked: false, createdAt: '2026-07-03T15:30:00Z' },
  { commentId: 3, annotationId: 2, author: publicUser(1), type: 'DISCUSSION', content: 'This passage always feels like a door opening.', likeCount: 2, isLiked: false, createdAt: '2026-07-03T16:00:00Z' },
];

const friendRequests = [
  { requesterId: 2, addresseeId: 1, status: 'PENDING', createdAt: '2026-07-03T14:00:00Z' },
  { requesterId: 1, addresseeId: 4, status: 'PENDING', createdAt: '2026-07-03T14:30:00Z' },
  { requesterId: 1, addresseeId: 3, status: 'ACCEPTED', createdAt: '2026-07-03T13:10:00Z' },
  { requesterId: 5, addresseeId: 1, status: 'ACCEPTED', createdAt: '2026-07-03T13:20:00Z' },
  { requesterId: 10, addresseeId: 1, status: 'PENDING', createdAt: '2026-07-03T15:00:00Z' },
  { requesterId: 11, addresseeId: 1, status: 'PENDING', createdAt: '2026-07-03T16:30:00Z' },
  { requesterId: 1, addresseeId: 12, status: 'PENDING', createdAt: '2026-07-03T17:00:00Z' },
  { requesterId: 1, addresseeId: 6, status: 'ACCEPTED', createdAt: '2026-07-03T18:00:00Z' },
  { requesterId: 1, addresseeId: 7, status: 'ACCEPTED', createdAt: '2026-07-03T18:30:00Z' },
];

const groups = [
  {
    groupId: 1,
    groupName: 'Demian Reading Room',
    owner: publicUser(1),
    memberIds: [1, 2, 3],
    bookIds: [2],
    createdAt: '2026-07-03T15:10:00Z',
  },
  {
    groupId: 2,
    groupName: 'Science Notes',
    owner: publicUser(3),
    memberIds: [1, 3, 5],
    bookIds: [4, 5],
    createdAt: '2026-07-03T15:40:00Z',
  },
  {
    groupId: 9,
    groupName: '데미안 같이 읽기 소모임',
    owner: publicUser(9),
    memberIds: [9, 1, 5, 7],
    bookIds: [6, 7],
    lastActivityAt: '2026-07-03T08:00:00Z',
    createdAt: '2026-07-01T14:00:00Z',
  },
  {
    groupId: 10,
    groupName: 'madCamp 웹 개발 스터디',
    owner: publicUser(1),
    memberIds: [1, 6],
    bookIds: [8],
    lastActivityAt: '2026-07-01T15:00:00Z',
    createdAt: '2026-07-03T11:00:00Z',
  },
];

function makeAnnotation(annotationId, bookId, authorId, type, passage, review, page, visibility, isSpoiler, likeCount, commentCount, groupId = null) {
  return {
    annotationId,
    book: bookSummary(bookId),
    author: publicUser(authorId),
    type,
    passage,
    review,
    page,
    visibility,
    isSpoiler,
    groupId,
    likeCount,
    commentCount,
    isLiked: likedTargets.has(`annotation:${annotationId}`),
    isFavorited: favoriteAnnotationIds.has(annotationId),
    createdAt: new Date(Date.UTC(2026, 6, 3, 11 + annotationId, 0, 0)).toISOString(),
  };
}

function now() {
  return new Date().toISOString();
}

function publicUser(id) {
  const user = users.find((item) => item.id === Number(id));
  return user ? { id: user.id, nickname: user.nickname } : { id: Number(id), nickname: 'unknown' };
}

function fullUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function bookSummary(bookId) {
  const book = books.find((item) => item.bookId === Number(bookId));
  return book
    ? {
        bookId: book.bookId,
        title: book.title,
        author: book.author,
        genreCode: book.genreCode,
        coverImageUrl: book.coverImageUrl,
      }
    : null;
}

function groupSummary(group) {
  return {
    groupId: group.groupId,
    groupName: group.groupName,
    owner: group.owner,
    memberIds: group.memberIds,
    bookIds: group.bookIds,
    memberCount: group.memberIds.length,
    bookCount: group.bookIds.length,
    coverImageUrl: bookSummary(group.bookIds[0])?.coverImageUrl || '',
    lastActivityAt: group.lastActivityAt || group.createdAt,
    createdAt: group.createdAt,
  };
}

function withBookStats(book) {
  return {
    ...book,
    annotationCount: annotations.filter((item) => item.book?.bookId === book.bookId).length,
    isFavorited: favoriteBookIds.has(book.bookId),
  };
}

function pageResponse(items, query = {}) {
  const page = Math.max(Number(query.page || 1), 1);
  const size = Math.max(Number(query.size || items.length || 20), 1);
  const start = (page - 1) * size;

  return {
    data: items.slice(start, start + size),
    pagination: {
      page,
      size,
      totalElements: items.length,
      totalPages: Math.max(Math.ceil(items.length / size), 1),
    },
  };
}

function apiError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

function sortAnnotations(items, sort) {
  const sorted = [...items];

  if (sort === 'popular' || sort === 'likes,desc') {
    return sorted.sort((a, b) => b.likeCount - a.likeCount);
  }

  if (sort === 'pageNumber') {
    return sorted.sort((a, b) => a.page - b.page);
  }

  return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// 1. Auth mock API
server.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user =
    users.find((item) => item.email === email && item.password === password) ||
    users.find((item) => item.id === currentUserId);

  console.log(`[Mock API] Login request received for email: ${email}`);

  return res.json({
    accessToken: `mock-jwt-token-${user.id}`,
    user: {
      ...fullUser(user),
      email: email || user.email,
    },
  });
});

server.post('/api/auth/register', (req, res) => {
  const { nickname, email, password } = req.body;

  console.log(`[Mock API] Register request: ${nickname} (${email})`);

  if (!nickname || !email || !password) {
    return apiError(res, 400, 'VALIDATION_ERROR', 'nickname, email and password are required.');
  }

  if (users.some((item) => item.email === email || item.nickname === nickname)) {
    return apiError(res, 409, 'DUPLICATE', 'Email or nickname already exists.');
  }

  const user = { id: nextUserId++, nickname, email, password, createdAt: now() };
  users.push(user);

  return res.status(201).json(fullUser(user));
});

server.post('/api/auth/logout', (req, res) => {
  console.log('[Mock API] Logout request');
  return res.sendStatus(204);
});

// 2. User and MyPage mock API
server.get('/api/users/me', (req, res) => {
  return res.json(fullUser(users.find((item) => item.id === currentUserId)));
});

server.patch('/api/users/me', (req, res) => {
  const me = users.find((item) => item.id === currentUserId);
  const { nickname, password, bio, avatarUrl, avatarIcon } = req.body;

  console.log(`[Mock API] User update: nickname=${nickname}`);

  if (nickname && users.some((item) => item.id !== currentUserId && item.nickname === nickname)) {
    return apiError(res, 409, 'DUPLICATE', 'Nickname already exists.');
  }

  me.nickname = nickname || me.nickname;
  me.password = password || me.password;
  me.bio = bio ?? me.bio;
  me.avatarUrl = avatarUrl ?? me.avatarUrl;
  me.avatarIcon = avatarIcon ?? me.avatarIcon;

  return res.json(fullUser(me));
});

server.get('/api/users', (req, res) => {
  const keyword = String(req.query.nickname || '').toLowerCase();

  console.log(`[Mock API] Search user by nickname: ${keyword}`);

  return res.json({
    data: users
      .filter((item) => item.id !== currentUserId)
      .filter((item) => !keyword || item.nickname.toLowerCase().includes(keyword))
      .map((item) => publicUser(item.id)),
  });
});

server.get('/api/users/me/annotations', (req, res) => {
  const myAnnotations = annotations.filter((item) => item.author.id === currentUserId);
  return res.json(pageResponse(myAnnotations, req.query));
});

server.get('/api/users/me/favorite-books', (req, res) => {
  const favoriteBooks = books.filter((book) => favoriteBookIds.has(book.bookId)).map(withBookStats);
  return res.json(pageResponse(favoriteBooks, req.query));
});

server.get('/api/users/me/favorite-annotations', (req, res) => {
  const favoriteAnnotations = annotations.filter((item) => favoriteAnnotationIds.has(item.annotationId));
  return res.json(pageResponse(favoriteAnnotations, req.query));
});

server.get('/api/users/me/groups', (req, res) => {
  return res.json(groups.filter((group) => group.memberIds.includes(currentUserId)).map(groupSummary));
});

server.get('/api/users/me/friends', (req, res) => {
  const data = friendRequests
    .filter((item) => item.status === 'ACCEPTED')
    .filter((item) => item.requesterId === currentUserId || item.addresseeId === currentUserId)
    .map((item) => publicUser(item.requesterId === currentUserId ? item.addresseeId : item.requesterId));

  return res.json({ data });
});

server.get('/api/users/me/friend-requests', (req, res) => {
  const direction = req.query.direction || 'received';
  const data = friendRequests
    .filter((item) => item.status === 'PENDING')
    .filter((item) => (direction === 'sent' ? item.requesterId === currentUserId : item.addresseeId === currentUserId))
    .map((item) => {
      const otherId = direction === 'sent' ? item.addresseeId : item.requesterId;
      return {
        userId: otherId,
        nickname: publicUser(otherId).nickname,
        status: item.status,
        createdAt: item.createdAt,
      };
    });

  return res.json({ data });
});

// 3. Book mock API
server.get('/api/books', (req, res) => {
  const keyword = String(req.query.keyword || '').toLowerCase();
  const genreCode = req.query.genreCode;
  const filteredBooks = books
    .filter((book) => !keyword || book.title.toLowerCase().includes(keyword) || book.author.toLowerCase().includes(keyword))
    .filter((book) => !genreCode || book.genreCode === genreCode)
    .map(withBookStats);

  if (req.query.sort === 'popular') {
    filteredBooks.sort((a, b) => b.annotationCount - a.annotationCount);
  }

  return res.json(pageResponse(filteredBooks, req.query));
});

server.get('/api/books/recommendations', (req, res) => {
  const size = Number(req.query.size || 10);
  return res.json(books.slice(0, size).map(withBookStats));
});

server.get('/api/books/:bookId', (req, res) => {
  const book = books.find((item) => item.bookId === Number(req.params.bookId));

  if (!book) {
    return apiError(res, 404, 'NOT_FOUND', 'Book not found.');
  }

  return res.json(withBookStats(book));
});

server.post('/api/books', (req, res) => {
  if (books.some((book) => book.isbn === req.body.isbn)) {
    return apiError(res, 409, 'DUPLICATE', 'Book with same ISBN already exists.');
  }

  const book = { bookId: nextBookId++, ...req.body };
  books.push(book);

  return res.status(201).json(withBookStats(book));
});

server.post('/api/books/:bookId/favorite', (req, res) => {
  favoriteBookIds.add(Number(req.params.bookId));
  return res.status(201).json({});
});

server.delete('/api/books/:bookId/favorite', (req, res) => {
  favoriteBookIds.delete(Number(req.params.bookId));
  return res.sendStatus(204);
});

// 4. Annotation mock API
server.get('/api/annotations/feed', (req, res) => {
  const recentHours = req.query.recentHours ? Number(req.query.recentHours) : null;
  const cutoff = recentHours ? Date.now() - recentHours * 60 * 60 * 1000 : null;
  const friendIds = friendRequests
    .filter((item) => item.status === 'ACCEPTED')
    .filter((item) => item.requesterId === currentUserId || item.addresseeId === currentUserId)
    .map((item) => (item.requesterId === currentUserId ? item.addresseeId : item.requesterId));
  const feed = sortAnnotations(
    annotations
      .filter((item) =>
        req.query.scope === 'friends'
          ? friendIds.includes(item.author.id) && ['public', 'friends'].includes(item.visibility)
          : item.visibility === 'public',
      )
      .filter((item) => !cutoff || new Date(item.createdAt).getTime() >= cutoff),
    req.query.scope === 'friends' ? 'recent,desc' : req.query.sort || 'likes,desc',
  );

  return res.json(pageResponse(feed, req.query));
});

server.get('/api/annotations/search', (req, res) => {
  const keyword = String(req.query.keyword || '').toLowerCase();
  const bookId = req.query.bookId ? Number(req.query.bookId) : null;
  const pageNumber = req.query.pageNumber ? Number(req.query.pageNumber) : null;
  const result = sortAnnotations(
    annotations
      .filter((item) => item.visibility === 'public')
      .filter((item) => !bookId || item.book?.bookId === bookId)
      .filter((item) => !pageNumber || item.page === pageNumber)
      .filter((item) => !keyword || item.passage.toLowerCase().includes(keyword) || item.review.toLowerCase().includes(keyword)),
    req.query.sort,
  );

  return res.json(pageResponse(result, req.query));
});

server.post('/api/annotations', (req, res) => {
  const book = books.find((item) => item.bookId === Number(req.body.bookId));
  const page = Number(req.body.page);
  const visibility = req.body.visibility || 'public';

  if (!req.body.bookId || !req.body.passage || !req.body.review || !req.body.page) {
    return apiError(res, 400, 'VALIDATION_ERROR', 'bookId, page, passage and review are required.');
  }

  if (!['public', 'private', 'friends', 'group'].includes(visibility)) {
    return apiError(res, 400, 'VALIDATION_ERROR', 'visibility must be public, private, friends or group.');
  }

  if (!Number.isFinite(page) || page < 1) {
    return apiError(res, 400, 'VALIDATION_ERROR', 'page must be a positive number.');
  }

  if (!book) {
    return apiError(res, 404, 'NOT_FOUND', 'Book not found.');
  }

  const annotation = makeAnnotation(
    nextAnnotationId++,
    book.bookId,
    currentUserId,
    req.body.type || 'NORMAL',
    req.body.passage,
    req.body.review,
    page,
    visibility,
    Boolean(req.body.isSpoiler),
    0,
    0,
    req.body.groupId ?? null,
  );

  annotations.unshift(annotation);

  return res.status(201).json(annotation);
});

server.get('/api/annotations/:annotationId', (req, res) => {
  const annotation = annotations.find((item) => item.annotationId === Number(req.params.annotationId));

  if (!annotation) {
    return apiError(res, 404, 'NOT_FOUND', 'Annotation not found.');
  }

  return res.json(annotation);
});

server.patch('/api/annotations/:annotationId', (req, res) => {
  const annotation = annotations.find((item) => item.annotationId === Number(req.params.annotationId));

  if (!annotation) {
    return apiError(res, 404, 'NOT_FOUND', 'Annotation not found.');
  }

  if (annotation.author.id !== currentUserId) {
    return apiError(res, 403, 'FORBIDDEN', 'Only the author can update this annotation.');
  }

  const page = req.body.page === undefined ? annotation.page : Number(req.body.page);

  if (!Number.isFinite(page) || page < 1) {
    return apiError(res, 400, 'VALIDATION_ERROR', 'page must be a positive number.');
  }

  Object.assign(annotation, {
    passage: req.body.passage ?? annotation.passage,
    review: req.body.review ?? annotation.review,
    page,
    visibility: req.body.visibility ?? annotation.visibility,
    isSpoiler: req.body.isSpoiler ?? annotation.isSpoiler,
    type: req.body.type ?? annotation.type,
  });

  return res.json(annotation);
});

server.delete('/api/annotations/:annotationId', (req, res) => {
  const index = annotations.findIndex((item) => item.annotationId === Number(req.params.annotationId));

  if (index === -1) {
    return apiError(res, 404, 'NOT_FOUND', 'Annotation not found.');
  }

  if (annotations[index].author.id !== currentUserId) {
    return apiError(res, 403, 'FORBIDDEN', 'Only the author can delete this annotation.');
  }

  for (let i = comments.length - 1; i >= 0; i -= 1) {
    if (comments[i].annotationId === annotations[index].annotationId) comments.splice(i, 1);
  }

  annotations.splice(index, 1);
  return res.sendStatus(204);
});

server.get('/api/books/:bookId/annotations', (req, res) => {
  const bookId = Number(req.params.bookId);
  const bookAnnotations = sortAnnotations(
    annotations.filter((item) => item.book?.bookId === bookId),
    req.query.sort,
  );

  return res.json(pageResponse(bookAnnotations, req.query));
});

server.post('/api/annotations/:annotationId/favorite', (req, res) => {
  const annotationId = Number(req.params.annotationId);
  const annotation = annotations.find((item) => item.annotationId === annotationId);

  if (!annotation) {
    return apiError(res, 404, 'NOT_FOUND', 'Annotation not found.');
  }

  favoriteAnnotationIds.add(annotationId);
  annotation.isFavorited = true;

  return res.status(201).json({});
});

server.delete('/api/annotations/:annotationId/favorite', (req, res) => {
  const annotationId = Number(req.params.annotationId);
  const annotation = annotations.find((item) => item.annotationId === annotationId);

  favoriteAnnotationIds.delete(annotationId);
  if (annotation) annotation.isFavorited = false;

  return res.sendStatus(204);
});

// 5. Comment and like mock API
server.get('/api/annotations/:annotationId/comments', (req, res) => {
  const type = req.query.type;
  const sort = req.query.sort || 'popular';
  const annotationComments = comments
    .filter((item) => item.annotationId === Number(req.params.annotationId))
    .filter((item) => !type || item.type === type);
  const sortedComments = [...annotationComments].sort((a, b) => {
    if (sort === 'recent,desc') return new Date(b.createdAt) - new Date(a.createdAt);
    return b.likeCount - a.likeCount;
  });

  return res.json(pageResponse(sortedComments, req.query));
});

server.post('/api/annotations/:annotationId/comments', (req, res) => {
  const annotation = annotations.find((item) => item.annotationId === Number(req.params.annotationId));
  const type = req.body.commentType || req.body.comment_type || req.body.commentCategory || req.body.category || req.body.type || 'NORMAL';

  if (!annotation) {
    return apiError(res, 404, 'NOT_FOUND', 'Annotation not found.');
  }

  const comment = {
    commentId: nextCommentId++,
    annotationId: annotation.annotationId,
    author: publicUser(currentUserId),
    type,
    commentType: type,
    comment_type: type,
    category: type,
    commentCategory: type,
    content: req.body.content || '',
    likeCount: 0,
    isLiked: false,
    createdAt: now(),
  };

  comments.push(comment);
  annotation.commentCount += 1;

  return res.status(201).json(comment);
});

server.patch('/api/comments/:commentId', (req, res) => {
  const comment = comments.find((item) => item.commentId === Number(req.params.commentId));

  if (!comment) {
    return apiError(res, 404, 'NOT_FOUND', 'Comment not found.');
  }

  comment.content = req.body.content ?? comment.content;

  return res.json(comment);
});

server.delete('/api/comments/:commentId', (req, res) => {
  const index = comments.findIndex((item) => item.commentId === Number(req.params.commentId));

  if (index === -1) {
    return apiError(res, 404, 'NOT_FOUND', 'Comment not found.');
  }

  if (comments[index].author.id !== currentUserId) {
    return apiError(res, 403, 'FORBIDDEN', 'Only the author can delete this comment.');
  }

  const [comment] = comments.splice(index, 1);
  const annotation = annotations.find((item) => item.annotationId === comment.annotationId);
  if (annotation) annotation.commentCount = Math.max(annotation.commentCount - 1, 0);

  return res.sendStatus(204);
});

server.post('/api/likes', (req, res) => {
  const { targetType, targetId } = req.body;
  const key = `${targetType}:${targetId}`;

  if (likedTargets.has(key)) {
    return apiError(res, 409, 'DUPLICATE', 'Already liked.');
  }

  likedTargets.add(key);

  if (targetType === 'annotation') {
    const annotation = annotations.find((item) => item.annotationId === Number(targetId));
    if (annotation) {
      annotation.likeCount += 1;
      annotation.isLiked = true;
    }
  }

  if (targetType === 'comment') {
    const comment = comments.find((item) => item.commentId === Number(targetId));
    if (comment) {
      comment.likeCount += 1;
      comment.isLiked = true;
    }
  }

  return res.status(201).json({
    likeId: nextLikeId++,
    targetType,
    targetId: Number(targetId),
    createdAt: now(),
  });
});

server.delete('/api/likes', (req, res) => {
  const key = `${req.query.targetType}:${req.query.targetId}`;
  likedTargets.delete(key);

  if (req.query.targetType === 'annotation') {
    const annotation = annotations.find((item) => item.annotationId === Number(req.query.targetId));
    if (annotation) {
      annotation.likeCount = Math.max(annotation.likeCount - 1, 0);
      annotation.isLiked = false;
    }
  }

  if (req.query.targetType === 'comment') {
    const comment = comments.find((item) => item.commentId === Number(req.query.targetId));
    if (comment) {
      comment.likeCount = Math.max(comment.likeCount - 1, 0);
      comment.isLiked = false;
    }
  }

  return res.sendStatus(204);
});

// 6. Friend mock API
server.post('/api/friends', (req, res) => {
  const friendId = Number(req.body.friendId);

  console.log(`[Mock API] Friend request sent to: ${friendId}`);

  if (friendId === currentUserId) {
    return apiError(res, 400, 'VALIDATION_ERROR', 'Cannot send a friend request to yourself.');
  }

  if (!users.some((item) => item.id === friendId)) {
    return apiError(res, 404, 'NOT_FOUND', 'User not found.');
  }

  const exists = friendRequests.some((item) =>
    [item.requesterId, item.addresseeId].includes(currentUserId) && [item.requesterId, item.addresseeId].includes(friendId),
  );

  if (exists) {
    return apiError(res, 409, 'DUPLICATE', 'Friend relationship already exists.');
  }

  const request = {
    requesterId: currentUserId,
    addresseeId: friendId,
    status: 'PENDING',
    createdAt: now(),
  };

  friendRequests.push(request);

  return res.status(201).json(request);
});

server.post('/api/friends/:userId/accept', (req, res) => {
  const userId = Number(req.params.userId);
  const relationship = friendRequests.find((item) =>
    item.status === 'PENDING' &&
    item.requesterId === userId &&
    item.addresseeId === currentUserId,
  );

  console.log(`[Mock API] Accept friend request from user: ${userId}`);

  if (!relationship) {
    return apiError(res, 404, 'NOT_FOUND', 'Friend request not found.');
  }

  relationship.status = 'ACCEPTED';

  return res.json({
    userId,
    nickname: publicUser(userId).nickname,
    status: 'ACCEPTED',
  });
});

server.delete('/api/friends/:userId', (req, res) => {
  const userId = Number(req.params.userId);
  const index = friendRequests.findIndex((item) =>
    [item.requesterId, item.addresseeId].includes(currentUserId) && [item.requesterId, item.addresseeId].includes(userId),
  );

  console.log(`[Mock API] Delete/Reject friend relationship with user: ${userId}`);

  if (index !== -1) {
    friendRequests.splice(index, 1);
  }

  return res.sendStatus(204);
});

// 7. Group mock API
server.post('/api/groups', (req, res) => {
  const group = {
    groupId: nextGroupId++,
    groupName: req.body.groupName || 'New Group',
    owner: publicUser(currentUserId),
    memberIds: Array.from(new Set([currentUserId, ...(req.body.memberIds || [])])),
    bookIds: req.body.bookIds || [],
    createdAt: now(),
  };

  groups.push(group);

  return res.status(201).json(groupSummary(group));
});

server.get('/api/groups/:groupId', (req, res) => {
  const group = groups.find((item) => item.groupId === Number(req.params.groupId));

  if (!group) {
    return apiError(res, 404, 'NOT_FOUND', 'Group not found.');
  }

  return res.json({
    groupId: group.groupId,
    groupName: group.groupName,
    owner: group.owner,
    members: group.memberIds.map(publicUser),
    books: group.bookIds.map(bookSummary).filter(Boolean),
    createdAt: group.createdAt,
  });
});

server.patch('/api/groups/:groupId', (req, res) => {
  const group = groups.find((item) => item.groupId === Number(req.params.groupId));

  if (!group) {
    return apiError(res, 404, 'NOT_FOUND', 'Group not found.');
  }

  group.groupName = req.body.groupName || group.groupName;

  return res.json(groupSummary(group));
});

server.delete('/api/groups/:groupId', (req, res) => {
  const index = groups.findIndex((item) => item.groupId === Number(req.params.groupId));

  if (index !== -1) {
    groups.splice(index, 1);
  }

  return res.sendStatus(204);
});

server.get('/api/groups/:groupId/members', (req, res) => {
  const group = groups.find((item) => item.groupId === Number(req.params.groupId));
  return res.json(group ? group.memberIds.map(publicUser) : []);
});

server.post('/api/groups/:groupId/members', (req, res) => {
  const group = groups.find((item) => item.groupId === Number(req.params.groupId));
  const userId = Number(req.body.userId);

  if (!group) {
    return apiError(res, 404, 'NOT_FOUND', 'Group not found.');
  }

  if (group.memberIds.includes(userId)) {
    return apiError(res, 409, 'DUPLICATE', '이미 멤버입니다.');
  }

  if (!users.some((item) => item.id === userId)) {
    return apiError(res, 404, 'NOT_FOUND', 'User not found.');
  }

  group.memberIds.push(userId);
  group.lastActivityAt = now();

  return res.status(201).json({ userId, status: 'JOINED' });
});

server.delete('/api/groups/:groupId/members/:userId', (req, res) => {
  const group = groups.find((item) => item.groupId === Number(req.params.groupId));

  if (group) {
    group.memberIds = group.memberIds.filter((id) => id !== Number(req.params.userId));
    group.lastActivityAt = now();
  }

  return res.sendStatus(204);
});

server.get('/api/groups/:groupId/books', (req, res) => {
  const group = groups.find((item) => item.groupId === Number(req.params.groupId));
  return res.json(group ? group.bookIds.map(bookSummary).filter(Boolean) : []);
});

server.post('/api/groups/:groupId/books', (req, res) => {
  const group = groups.find((item) => item.groupId === Number(req.params.groupId));
  const bookId = Number(req.body.bookId);

  if (!group) {
    return apiError(res, 404, 'NOT_FOUND', 'Group not found.');
  }

  if (group.bookIds.includes(bookId)) {
    return apiError(res, 409, 'DUPLICATE', '이미 추가된 책입니다.');
  }

  if (!books.some((item) => item.bookId === bookId)) {
    return apiError(res, 404, 'NOT_FOUND', 'Book not found.');
  }

  group.bookIds.push(bookId);
  group.lastActivityAt = now();

  return res.status(201).json({ bookId });
});

server.delete('/api/groups/:groupId/books/:bookId', (req, res) => {
  const group = groups.find((item) => item.groupId === Number(req.params.groupId));

  if (group) {
    group.bookIds = group.bookIds.filter((id) => id !== Number(req.params.bookId));
    group.lastActivityAt = now();
  }

  return res.sendStatus(204);
});

server.get('/api/groups/:groupId/annotations', (req, res) => {
  const bookId = req.query.bookId ? Number(req.query.bookId) : null;
  const type = req.query.type;
  const groupAnnotations = annotations
    .filter((item) => item.groupId === Number(req.params.groupId))
    .filter((item) => !bookId || item.book?.bookId === bookId)
    .filter((item) => !type || item.type === type);

  return res.json(pageResponse(sortAnnotations(groupAnnotations, req.query.sort), req.query));
});

server.use('/api', router);

server.listen(PORT, () => {
  console.log('==================================================');
  console.log(`  Mock API Server is running on port ${PORT}`);
  console.log('  Test login: a@b.com / pw1234!!');
  console.log('  [POST] /api/auth/login');
  console.log('  [GET]  /api/users/me/annotations');
  console.log('==================================================');
});
