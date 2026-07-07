import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getBooks, importBookFromAladin, searchExternalBooks } from '../api/books';
import { favoriteAnnotation, getAnnotationFeed, searchAnnotations, unfavoriteAnnotation } from '../api/annotations';
import { getPageData } from '../api/client';
import BookShelfFrame from '../components/BookShelfFrame';
import SiteHeader from '../components/SiteHeader';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/error';

const searchCategories = [
  { label: '통합검색', value: 'all' },
  { label: '책', value: 'book' },
  { label: '주석', value: 'annotation' },
  { label: '저자', value: 'author' },
];

const visibilityLabels = {
  public: '공개',
  friends: '친구 공개',
  private: '비공개',
  group: '그룹',
};

const POPULAR_BOOKS_PER_WINDOW = 7;

function LogoMark() {
  return (
    <img className="w-[132px] shrink-0 object-contain sm:w-[160px] lg:w-[190px]" src="/logo.png" alt="문장서재" />
  );
}

function normalizeBook(book) {
  return {
    id: book.bookId ?? book.id,
    title: book.title ?? '제목 없음',
    author: book.author ?? '작가 미상',
    genre: book.genreName ?? book.genreCode ?? book.genre ?? '일반',
    coverImageUrl: book.coverImageUrl,
    annotationCount: book.annotationCount ?? 0,
    isFavorited: Boolean(book.isFavorited),
  };
}

function ScrollingBookTitle({ title }) {
  const shouldScroll = (title || '').length > 24;

  if (!shouldScroll) {
    return <p className="truncate text-xs font-bold text-text">{title}</p>;
  }

  return (
    <p className="scrolling-title scrolling-title--animate text-xs font-bold text-text" title={title}>
      <span className="scrolling-title__track">
        <span>{title}</span>
        <span aria-hidden="true">{title}</span>
      </span>
    </p>
  );
}

function normalizeAnnotation(annotation) {
  return {
    id: annotation.annotationId ?? annotation.id,
    bookId: annotation.book?.bookId ?? annotation.bookId,
    bookTitle: annotation.book?.title ?? annotation.bookTitle ?? '책 정보 없음',
    page: annotation.page ?? annotation.pageNumber ?? '-',
    passage: annotation.passage ?? annotation.quote ?? '',
    review: annotation.review ?? annotation.content ?? '',
    authorId: annotation.author?.id ?? annotation.authorId,
    author: annotation.author?.nickname ?? annotation.authorName ?? '익명',
    visibility: visibilityLabels[annotation.visibility] ?? annotation.visibility ?? '공개',
    likeCount: annotation.likeCount ?? 0,
    commentCount: annotation.commentCount ?? 0,
    isFavorited: Boolean(annotation.isFavorited),
    isSpoiler: Boolean(annotation.isSpoiler),
    createdAt: annotation.createdAt,
    time: formatRelativeTime(annotation.createdAt),
  };
}

function formatRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMinutes = Math.max(Math.floor((Date.now() - date.getTime()) / 60000), 0);
  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  return `${Math.floor(diffHours / 24)}일 전`;
}

function SearchHeader({ category, keyword, onCategoryChange, onKeywordChange, onSubmit }) {
  return (
    <header className="site-header">
      <div className="container grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
        <Link to="/" className="brand justify-self-start">
          <LogoMark />
        </Link>

        <form
          className="flex min-h-11 w-full max-w-[620px] items-center overflow-hidden rounded-full border border-line bg-white shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
          onSubmit={onSubmit}
        >
          <select
            className="h-11 w-[116px] shrink-0 border-0 bg-transparent px-4 text-sm font-bold text-text outline-none"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
            aria-label="검색 카테고리"
          >
            {searchCategories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <span className="h-5 w-px shrink-0 bg-line" aria-hidden="true" />
          <input
            className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm text-text outline-none placeholder:text-text-subtle"
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="검색어를 입력하세요"
          />
          <button className="flex h-11 w-12 shrink-0 items-center justify-center text-xl font-bold text-primary" type="submit" aria-label="검색">
            ⌕
          </button>
        </form>

        <nav className="hidden justify-self-end md:flex md:items-center md:gap-5" aria-label="주요 메뉴">
          <Link className="nav__link" to="/">홈</Link>
          <Link className="nav__link nav__link--active" to="/search">둘러보기</Link>
          <Link className="nav__link" to="/mypage">내 서재</Link>
        </nav>
      </div>
    </header>
  );
}

function BookmarkButton({ isActive, isPending, onClick, label = '북마크' }) {
  return (
    <button
      type="button"
      className={`flex h-9 w-9 items-center justify-center rounded-full shadow-soft transition ${
        isActive ? 'bg-primary text-white' : 'bg-white text-text-muted hover:text-primary'
      }`}
      onClick={onClick}
      disabled={isPending}
      aria-label={isActive ? `${label} 해제` : label}
      aria-pressed={isActive}
      title={isActive ? `${label} 해제` : label}
    >
      {isActive ? '★' : '☆'}
    </button>
  );
}

function BookResultCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-shelf-card group">
      <BookShelfFrame coverImageUrl={book.coverImageUrl} title={book.title}>
        <h3 className="line-clamp-2 text-sm font-extrabold leading-[1.45] text-text">{book.title}</h3>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-text-muted">
          <p className="min-w-0 truncate">{book.author}</p>
          <span className="shrink-0 whitespace-nowrap">노트 {book.annotationCount}</span>
        </div>
      </BookShelfFrame>
    </Link>
  );
}

function AnnotationResultCard({ annotation, isMine, onRequireAuth }) {
  const [isRevealed, setIsRevealed] = useState(!annotation.isSpoiler || isMine);
  const [isFavorited, setIsFavorited] = useState(annotation.isFavorited);
  const [isPending, setIsPending] = useState(false);
  const shouldHideContent = annotation.isSpoiler && !isMine && !isRevealed;

  const handleFavorite = async (event) => {
    event.preventDefault();
    if (!onRequireAuth()) return; 
    if (isPending) return;

    const nextFavorited = !isFavorited;
    setIsPending(true);
    setIsFavorited(nextFavorited);

    try {
      if (nextFavorited) {
        await favoriteAnnotation(annotation.id);
      } else {
        await unfavoriteAnnotation(annotation.id);
      }
    } catch {
      setIsFavorited(!nextFavorited);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Link to={`/annotations/${annotation.id}`} className="card card--padded block transition hover:-translate-y-1 hover:shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag">p.{annotation.page}</span>
        <span className="tag tag--blue">{annotation.visibility}</span>
        {annotation.isSpoiler && <span className="tag tag--danger">스포일러</span>}
        <span className="text-sm font-semibold text-text-muted">「{annotation.bookTitle}」</span>
      </div>

      {shouldHideContent ? (
        <div className="mt-4 rounded-sm border border-line bg-surfaceMuted p-5 text-center">
          <p className="text-sm font-bold text-text-muted">스포일러가 포함된 구절 노트입니다.</p>
          <button
            className="button button--secondary button--sm mt-4"
            type="button"
            onClick={(event) => {
              event.preventDefault();
              setIsRevealed(true);
            }}
          >
            보기
          </button>
        </div>
      ) : (
        <>
          <blockquote className="mt-4 border-l-4 border-primary-soft pl-4 text-xl font-semibold leading-[1.65] text-text">
            “{annotation.passage}”
          </blockquote>
          <p className="mt-3 leading-[1.7] text-text-muted">{annotation.review}</p>
          <footer className="mt-5 flex items-center justify-between text-sm text-text-muted">
            {annotation.authorId ? (
              <Link to={`/users/${annotation.authorId}`} className="font-semibold transition hover:text-primary">
                {annotation.author}
              </Link>
            ) : (
              <span>{annotation.author}</span>
            )}
            <span>♡ {annotation.likeCount} · 댓글 {annotation.commentCount}</span>
          </footer>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className={`button button--sm ${isFavorited ? 'button--primary' : 'button--secondary'}`}
              onClick={handleFavorite}
              disabled={isPending}
              aria-pressed={isFavorited}
            >
              {isFavorited ? '★ 저장됨' : '☆ 저장'}
            </button>
          </div>
        </>
      )}
    </Link>
  );
}

function AddBookCard({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="book-shelf-card group w-[165px] text-left">
      <div className="flex h-[232px] w-[165px] flex-col items-center justify-center gap-3 rounded-sm border-2 border-dashed border-line bg-transparent p-4 text-center transition group-hover:border-primary group-hover:bg-primary-soft/40">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-2xl font-bold text-primary">+</span>
        <div>
          <p className="text-sm font-bold text-text">찾는 책이 없나요?</p>
          <p className="mt-1 text-xs text-text-muted">책 추가하기</p>
        </div>
      </div>
    </button>
  );
}

function EmptyState({ children }) {
  return (
    <div className="py-12 text-center">
      <p className="text-sm font-semibold text-text-muted">{children}</p>
    </div>
  );
}

function PopularBookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="book-shelf-card group">
      <BookShelfFrame coverImageUrl={book.coverImageUrl} title={book.title}>
        <h3 className="line-clamp-2 text-sm font-extrabold leading-[1.45] text-text">{book.title}</h3>
        <div className="mt-1.5 flex items-center justify-between gap-2 text-xs font-semibold text-text-muted">
          <p className="min-w-0 truncate">{book.author}</p>
          <span className="shrink-0 whitespace-nowrap">노트 {book.annotationCount}</span>
        </div>
      </BookShelfFrame>
    </Link>
  );
}

function BrowseAnnotationCard({ annotation, onRequireAuth }) {
  const [isFavorited, setIsFavorited] = useState(annotation.isFavorited);
  const [isPending, setIsPending] = useState(false);

  const handleFavorite = async (event) => {
    event.preventDefault();
    if (!onRequireAuth()) return;
    if (isPending) return;

    const nextFavorited = !isFavorited;
    setIsPending(true);
    setIsFavorited(nextFavorited);

    try {
      if (nextFavorited) {
        await favoriteAnnotation(annotation.id);
      } else {
        await unfavoriteAnnotation(annotation.id);
      }
    } catch {
      setIsFavorited(!nextFavorited);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Link to={`/annotations/${annotation.id}`} className="card card--padded block transition hover:-translate-y-1 hover:shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tag">p.{annotation.page}</span>
        <span className="tag tag--blue">{annotation.visibility}</span>
        <span className="text-sm font-semibold text-text-muted">『{annotation.bookTitle}』</span>
        <span className="ml-auto text-sm text-text-subtle">{annotation.time}</span>
      </div>
      <blockquote className="mt-4 border-l-4 border-primary-soft pl-4 text-xl font-semibold leading-[1.65] text-text">
        “{annotation.passage}”
      </blockquote>
      <p className="mt-3 line-clamp-2 leading-[1.7] text-text-muted">{annotation.review}</p>
      <footer className="mt-5 flex items-center justify-between text-sm text-text-muted">
        {annotation.authorId ? (
          <Link to={`/users/${annotation.authorId}`} className="font-semibold transition hover:text-primary">
            {annotation.author}
          </Link>
        ) : (
          <span>{annotation.author}</span>
        )}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span>♡ {annotation.likeCount} · 댓글 {annotation.commentCount}</span>
          <button
            type="button"
            className={`button button--sm ${isFavorited ? 'button--primary' : 'button--secondary'}`}
            onClick={handleFavorite}
            disabled={isPending}
            aria-pressed={isFavorited}
          >
            {isFavorited ? '★ 저장됨' : '☆ 저장'}
          </button>
        </div>
      </footer>
    </Link>
  );
}

export default function SearchPage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || 'all';
  const keywordParam = searchParams.get('q') || searchParams.get('keyword') || searchParams.get('search') || '';
  const [category, setCategory] = useState(categoryParam);
  const [keyword, setKeyword] = useState(keywordParam);
  const [books, setBooks] = useState([]);
  const [annotations, setAnnotations] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [browseAnnotations, setBrowseAnnotations] = useState([]);
  const [bookWindow, setBookWindow] = useState(0);
  const [annotationFilter, setAnnotationFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isBrowseLoading, setIsBrowseLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [browseErrorMessage, setBrowseErrorMessage] = useState('');

  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [addBookKeyword, setAddBookKeyword] = useState('');
  const [addBookResults, setAddBookResults] = useState([]);
  const [isSearchingAddBooks, setIsSearchingAddBooks] = useState(false);
  const [addBookError, setAddBookError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const requireAuth = () => {
    if (!isAuthenticated) {
      showToast('로그인이 필요한 기능입니다.', 'error');
      return false;
    }
    return true;
  };

  const activeCategory = useMemo(
    () => (searchCategories.some((item) => item.value === categoryParam) ? categoryParam : 'all'),
    [categoryParam],
  );
  const isBrowseMode = !keywordParam.trim();
  const visiblePopularBooks = popularBooks.slice(
    bookWindow * POPULAR_BOOKS_PER_WINDOW,
    bookWindow * POPULAR_BOOKS_PER_WINDOW + POPULAR_BOOKS_PER_WINDOW,
  );

  useEffect(() => {
    setCategory(activeCategory);
    setKeyword(keywordParam);
  }, [activeCategory, keywordParam]);

  useEffect(() => {
    if (!isAuthenticated && annotationFilter === 'friends') {
      setAnnotationFilter('all');
    }
  }, [annotationFilter, isAuthenticated]);

  useEffect(() => {
    let ignore = false;

    async function loadResults() {
      if (isBrowseMode) {
        setIsLoading(false);
        setBooks([]);
        setAnnotations([]);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const shouldLoadBooks = activeCategory === 'all' || activeCategory === 'book' || activeCategory === 'author';
        const shouldLoadAnnotations = activeCategory === 'all' || activeCategory === 'annotation';
        const bookSearchField = activeCategory === 'author' ? 'author' : activeCategory === 'book' ? 'title' : undefined;
        const [bookResponse, annotationResponse] = await Promise.all([
          shouldLoadBooks ? getBooks({ keyword: keywordParam || undefined, field: bookSearchField, page: 1, size: activeCategory === 'all' ? 8 : 20 }) : null,
          shouldLoadAnnotations ? searchAnnotations({ keyword: keywordParam || undefined, page: 1, size: activeCategory === 'all' ? 8 : 20 }) : null,
        ]);

        if (!ignore) {
          setBooks(bookResponse ? getPageData(bookResponse).data.map(normalizeBook) : []);
          setAnnotations(annotationResponse ? getPageData(annotationResponse).data.map(normalizeAnnotation) : []);
        }
      } catch (error) {
        if (!ignore) {
          setBooks([]);
          setAnnotations([]);
          setErrorMessage(error.message || '검색 결과를 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadResults();

    return () => {
      ignore = true;
    };
  }, [activeCategory, keywordParam, isBrowseMode]);

  useEffect(() => {
    let ignore = false;

    async function loadBrowse() {
      if (!isBrowseMode) return;

      setIsBrowseLoading(true);
      setBrowseErrorMessage('');

      try {
        const [bookResponse, annotationResponse] = await Promise.all([
          getBooks({ sort: 'recentAnnotations', recentHours: 24, page: 1, size: 20 }),
          getAnnotationFeed({
            recentHours: 72,
            scope: isAuthenticated && annotationFilter === 'friends' ? 'friends' : undefined,
            sort: isAuthenticated && annotationFilter === 'friends' ? 'recent,desc' : 'likes,desc',
            page: 1,
            size: 20,
          }),
        ]);

        if (!ignore) {
          setPopularBooks(getPageData(bookResponse).data.map(normalizeBook));
          setBrowseAnnotations(getPageData(annotationResponse).data.map(normalizeAnnotation));
        }
      } catch (error) {
        if (!ignore) {
          setPopularBooks([]);
          setBrowseAnnotations([]);
          setBrowseErrorMessage(error.message || '둘러보기 데이터를 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) setIsBrowseLoading(false);
      }
    }

    loadBrowse();

    return () => {
      ignore = true;
    };
  }, [annotationFilter, isAuthenticated, isBrowseMode]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ category });
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) params.set('q', trimmedKeyword);
    setSearchParams(params);
  };

  const openAddBookModal = () => {
    setAddBookKeyword(keywordParam);
    setAddBookResults([]);
    setAddBookError('');
    setShowAddBookModal(true);
  };

  const handleSearchAddBooks = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!addBookKeyword.trim()) return;

    setIsSearchingAddBooks(true);
    setAddBookError('');
    try {
      const keywordToSearch = addBookKeyword.trim();
      const [localRes, externalRes] = await Promise.all([
        getBooks({ keyword: keywordToSearch }),
        searchExternalBooks({ keyword: keywordToSearch, size: 10 }).catch(() => ({ data: [] })),
      ]);
      const localBooks = localRes.data || [];
      const localIsbns = new Set(localBooks.map((book) => book.isbn).filter(Boolean));
      const externalBooks = (externalRes.data || [])
        .filter((book) => book.isbn && !localIsbns.has(book.isbn))
        .map((book) => ({ ...book, isExternal: true }));
      setAddBookResults([...localBooks, ...externalBooks]);
    } catch (error) {
      setAddBookError(getErrorMessage(error));
    } finally {
      setIsSearchingAddBooks(false);
    }
  };

  const handleImportBook = async (book) => {
    try {
      const targetBook = book.isExternal ? await importBookFromAladin(book.isbn) : book;
      setShowAddBookModal(false);
      navigate(`/books/${targetBook.bookId}`);
    } catch (error) {
      setAddBookError(getErrorMessage(error));
    }
  };

  const categoryLabel = searchCategories.find((item) => item.value === activeCategory)?.label ?? '통합검색';

  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />

      <main className="page">
        <div className="container grid gap-8">
          <section>
            <h1 className="page-title mt-2">
              {isBrowseMode ? '둘러보기' : `“${keywordParam}” 검색 결과`}
            </h1>
          </section>

          {isBrowseMode && (
            <>
              {browseErrorMessage && <EmptyState>{browseErrorMessage}</EmptyState>}

              {!browseErrorMessage && (
                <>
                  <section className="grid gap-4">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="section-title">인기 책</h2>
                      {popularBooks.length > POPULAR_BOOKS_PER_WINDOW && (
                        <button
                          className="button button--secondary browse-book-next-button"
                          type="button"
                          onClick={() => {
                            const totalWindows = Math.max(Math.ceil(popularBooks.length / POPULAR_BOOKS_PER_WINDOW), 1);
                            setBookWindow((value) => (value + 1) % totalWindows);
                          }}
                          aria-label="다음 인기 책"
                        >
                          →
                        </button>
                      )}
                    </div>

                    {isBrowseLoading ? (
                      <div className="book-shelf-list justify-between">
                        {Array.from({ length: POPULAR_BOOKS_PER_WINDOW }).map((_, index) => (
                          <article key={index} className="book-shelf-card grid h-full w-full justify-self-center gap-3 animate-pulse">
                            <div className="book-shelf-cover">
                              <div className="aspect-[3/4] h-full rounded-sm bg-surfaceMuted" />
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : visiblePopularBooks.length === 0 ? (
                      <EmptyState>인기 책이 없습니다.</EmptyState>
                    ) : (
                      <div className="book-shelf-list justify-between">
                        {visiblePopularBooks.map((book) => (
                          <PopularBookCard key={book.id} book={book} />
                        ))}
                        {visiblePopularBooks.length < POPULAR_BOOKS_PER_WINDOW &&
                          Array.from({ length: POPULAR_BOOKS_PER_WINDOW - visiblePopularBooks.length }).map((_, index) => (
                            <div key={`pad-${index}`} className="w-[165px] shrink-0" aria-hidden="true" />
                          ))
                        }
                      </div>
                    )}
                  </section>

                  <section className="grid gap-4 border-t border-line pt-7">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <h2 className="section-title">인기 구절노트</h2>
                      {isAuthenticated && (
                        <div className="flex flex-wrap gap-2">
                            <button
                              className={`button button--sm ${annotationFilter === 'all' ? 'button--primary' : 'button--secondary'}`}
                              type="button"
                              onClick={() => setAnnotationFilter('all')}
                            >
                              전체
                            </button>
                            <button
                              className={`button button--sm ${annotationFilter === 'friends' ? 'button--primary' : 'button--secondary'}`}
                              type="button"
                              onClick={() => setAnnotationFilter('friends')}
                            >
                              친구
                            </button>
                        </div>
                      )}
                    </div>

                    {isBrowseLoading ? (
                      <div className="grid gap-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <article key={index} className="card card--padded h-40 animate-pulse" />
                        ))}
                      </div>
                    ) : browseAnnotations.length === 0 ? (
                      <EmptyState>조건에 맞는 구절노트가 없습니다.</EmptyState>
                    ) : (
                      <div className="grid gap-4">
                        {browseAnnotations.map((annotation) => (
                          <BrowseAnnotationCard key={annotation.id} annotation={annotation} onRequireAuth={requireAuth} />
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}
            </>
          )}

          {!isBrowseMode && errorMessage && <EmptyState>{errorMessage}</EmptyState>}

          {!isBrowseMode && !errorMessage && isLoading && <EmptyState>검색 결과를 불러오는 중입니다</EmptyState>}

          {!isBrowseMode && !errorMessage && !isLoading && (activeCategory === 'all' || activeCategory === 'book' || activeCategory === 'author') && (
            <section className="grid gap-4">
              <h2 className="section-title">책 결과</h2>
              {books.length === 0 && (
                <p className="text-sm font-semibold text-text-muted">일치하는 책을 찾지 못했습니다</p>
              )}
              <div className="book-shelf-list">
                {books.map((book) => (
                  <BookResultCard key={book.id} book={book} />
                ))}
                <AddBookCard onClick={openAddBookModal} />
              </div>
            </section>
          )}

          {!isBrowseMode && !errorMessage && !isLoading && (activeCategory === 'all' || activeCategory === 'annotation') && (
            <section className="grid gap-4">
              <h2 className="section-title">주석 결과</h2>
              {annotations.length === 0 ? (
                <EmptyState>일치하는 주석을 찾지 못했습니다</EmptyState>
              ) : (
                <div className="grid gap-4">
                  {annotations.map((annotation) => (
                    <AnnotationResultCard
                      key={annotation.id}
                      annotation={annotation}
                      isMine={user?.id === annotation.authorId}
                      onRequireAuth={requireAuth}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {showAddBookModal && (
        <div className="modal-overlay">
          <section className="modal card card--padded">
            <h2 className="section-title mb-4">책 추가하기</h2>
            <form onSubmit={handleSearchAddBooks} className="flex gap-2">
              <input
                className="input !h-9 flex-1"
                type="text"
                placeholder="책 제목 또는 저자"
                value={addBookKeyword}
                onChange={(event) => setAddBookKeyword(event.target.value)}
                autoFocus
              />
              <button type="submit" className="button button--primary button--sm" disabled={isSearchingAddBooks}>
                {isSearchingAddBooks ? '검색...' : '검색'}
              </button>
            </form>
            {addBookError && <p className="mt-2 text-xs text-danger">{addBookError}</p>}
            {addBookResults.length > 0 && (
              <ul className="mt-4 grid max-h-[240px] gap-2 overflow-y-auto border-t border-line pt-4">
                {addBookResults.map((book) => (
                  <li key={book.bookId || book.isbn} className="flex min-w-0 items-center justify-between gap-3 rounded bg-pageSoft p-2">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {book.coverImageUrl ? (
                        <img className="h-12 w-9 shrink-0 rounded-sm object-cover shadow-soft" src={book.coverImageUrl} alt={book.title} />
                      ) : (
                        <div className="h-12 w-9 shrink-0 rounded-sm bg-primary-soft" />
                      )}
                      <div className="min-w-0 flex-1">
                        <ScrollingBookTitle title={book.title} />
                        <p className="truncate text-[11px] text-text-muted">{book.author}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleImportBook(book)}
                      className="button button--primary button--sm !min-h-7 !px-2.5 text-xs shrink-0"
                    >
                      {book.isExternal ? '추가' : '보기'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowAddBookModal(false)} className="button button--secondary">
                닫기
              </button>
            </div>
          </section>
        </div>
      )}

      {toastMessage && (
        <div className={`fixed bottom-6 left-6 right-6 z-50 max-w-[calc(100vw-3rem)] sm:left-auto sm:max-w-sm rounded-sm px-4 py-3 text-sm font-semibold shadow-card transition-all duration-300 ${
          toastType === 'error' ? 'bg-danger-soft text-danger' : 'bg-white text-primary border border-line'
        }`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
