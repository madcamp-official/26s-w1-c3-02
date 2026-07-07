import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getBookCategories, getBooks } from '../api/books';
import { favoriteAnnotation, getAnnotationFeed, unfavoriteAnnotation } from '../api/annotations';
import { getPageData } from '../api/client';
import BookShelfFrame from '../components/BookShelfFrame';
import SiteHeader from '../components/SiteHeader';


const genreFilters = [
  { label: '전체', value: '' },
  { label: '소설', value: 'NOVEL' },
  { label: '시/에세이', value: 'ESSAY' },
  { label: '인문', value: 'HUMANITIES' },
  { label: '과학', value: 'SCIENCE' },
  { label: '자기계발', value: 'SELF_HELP' },
];

const searchCategories = [
  { label: '통합검색', value: 'all' },
  { label: '책', value: 'book' },
  { label: '주석', value: 'annotation' },
  { label: '저자', value: 'author' },
];

function normalizeBook(book) {
  const bookId = book.bookId ?? book.id;

  return {
    id: bookId,
    title: book.title ?? '제목 없음',
    author: book.author ?? '작가 미상',
    annotationCount: book.annotationCount ?? 0,
    coverImageUrl: book.coverImageUrl,
    isFavorited: Boolean(book.isFavorited),
  };
}

function normalizeFeedItem(annotation) {
  return {
    id: annotation.annotationId ?? annotation.id,
    authorId: annotation.author?.id ?? annotation.authorId,
    author: annotation.author?.nickname ?? annotation.authorName ?? annotation.author ?? '익명',
    time: formatRelativeTime(annotation.createdAt),
    book: annotation.book?.title ?? annotation.bookTitle ?? '책 정보 없음',
    quote: annotation.passage ?? annotation.quote ?? '',
    review: annotation.review ?? '',
    likes: annotation.likeCount ?? 0,
    comments: annotation.commentCount ?? annotation.comments ?? 0,
    isFavorited: Boolean(annotation.isFavorited),
    avatar: 'bg-primary-soft',
  };
}

function formatRelativeTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (diffMinutes < 60) return `${Math.max(diffMinutes, 1)}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  return `${Math.floor(diffHours / 24)}일 전`;
}

function formatTodayLabel() {
  const parts = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).formatToParts(new Date());

  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  const day = parts.find((part) => part.type === 'day')?.value ?? '';
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? '';

  return `${month} ${day}일 ${weekday}`;
}

function LogoMark() {
  return (
    <img className="w-[132px] shrink-0 object-contain sm:w-[160px] lg:w-[190px]" src="/logo.png" alt="문장서재" />
  );
}

function BookSearchForm({
  value,
  onChange,
  onSubmit,
  className = '',
  showCategory = false,
  category = 'all',
  onCategoryChange,
}) {
  if (showCategory) {
    return (
      <form
        className={`flex min-h-11 w-full items-center overflow-hidden rounded-full border border-line bg-white shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 ${className}`}
        onSubmit={onSubmit}
      >
        <label className="sr-only" htmlFor="header-search-category">
          검색 카테고리
        </label>
        <select
          id="header-search-category"
          className="h-11 w-[116px] shrink-0 border-0 bg-transparent px-4 text-sm font-bold text-text outline-none"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          {searchCategories.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <span className="h-5 w-px shrink-0 bg-line" aria-hidden="true" />
        <label className="flex min-w-0 flex-1 items-center">
          <span className="sr-only">검색어</span>
          <input
            className="h-11 w-full min-w-0 bg-transparent px-4 text-sm text-text outline-none placeholder:text-text-subtle"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="책 제목, 주석, 저자 검색"
          />
        </label>
        <button
          className="flex h-11 w-12 shrink-0 items-center justify-center text-xl font-bold text-primary transition hover:bg-primary-soft"
          type="submit"
          aria-label="검색"
        >
          ⌕
        </button>
      </form>
    );
  }

  return (
    <form className={`flex w-full flex-col gap-2 sm:flex-row ${className}`} onSubmit={onSubmit}>
      <label className="form-field flex-1">
        <span className="sr-only">책 검색</span>
        <input
          className="input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="책 제목 또는 저자"
        />
      </label>
      <button className="button button--primary shrink-0" type="submit">
        검색
      </button>
    </form>
  );
}

function Header({ keyword, onKeywordChange, onSearch, searchCategory, onSearchCategoryChange }) {
  return (
    <header className="site-header">
      <div className="container grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
        <Link to="/" className="brand justify-self-start">
          <LogoMark />
          <span className="brand__subtitle hidden xl:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </Link>

        <div className="w-full min-w-[220px] max-w-[520px] md:w-[min(44vw,520px)] md:max-w-none lg:w-[min(38vw,520px)]">
          <BookSearchForm
            value={keyword}
            onChange={onKeywordChange}
            onSubmit={onSearch}
            showCategory
            category={searchCategory}
            onCategoryChange={onSearchCategoryChange}
          />
        </div>

        <div className="flex justify-self-end">
          <nav className="hidden items-center gap-3 md:flex lg:gap-5 xl:gap-7" aria-label="주요 메뉴">
            <Link className="nav__link nav__link--active shrink-0" to="/">
              홈
            </Link>
            <Link className="nav__link shrink-0" to="/search">
              둘러보기
            </Link>
            <Link className="nav__link shrink-0" to="/mypage">
              내 서재
            </Link>
            <Link className="nav__link shrink-0" to="/groups">
              활동
            </Link>
            <Link className="nav__link shrink-0" to="/login">
              로그인
            </Link>
          </nav>

          <Link className="button button--primary button--sm shrink-0 whitespace-nowrap md:hidden" to="/login">
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}

function HeroScene() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden rounded-r-lg md:block">
      <div className="absolute inset-0 bg-gradient-to-l from-stone-200/70 via-white/35 to-transparent" />
      <div className="absolute bottom-0 right-0 h-28 w-full bg-gradient-to-r from-stone-100 to-stone-300" />
      <div className="absolute bottom-24 right-12 h-4 w-32 rounded-sm bg-slate-800 shadow-card" />
      <div className="absolute bottom-28 right-10 h-4 w-36 rounded-sm bg-stone-100 shadow-card" />
      <div className="absolute bottom-32 right-14 h-4 w-32 rounded-sm bg-slate-700 shadow-card" />
      <div className="absolute bottom-20 right-56 h-12 w-7 rounded-sm bg-primary shadow-card" />
      <div className="absolute bottom-16 right-36 h-1.5 w-44 -rotate-12 rounded-full bg-slate-700" />
      <div className="absolute right-20 top-10 h-32 w-32 rounded-full bg-white/60 blur-2xl" />
    </div>
  );
}

function HomeHero() {
  const todayLabel = formatTodayLabel();

  return (
    <section className="hero-card relative min-h-[260px] p-8 md:p-10">
      <HeroScene />
      <div className="relative z-10 max-w-[620px]">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-2xl font-bold text-text">오늘의 문장</p>
          <p className="text-sm font-semibold text-text-muted">{todayLabel}</p>
        </div>

        <div className="mt-9 flex gap-5">
          <span className="text-5xl font-bold leading-none text-primary-soft">“</span>
          <div>
            <h1 className="text-2xl font-semibold leading-[1.8] text-text md:text-[28px]">
              자기 자신으로 있기 위해서는
              <br />
              끊임없이 자신을 갱신해야 한다.
            </h1>
            <p className="mt-5 text-base font-medium text-text-muted">- 헤르만 헤세, 데미안</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookCoverFallback({ title }) {
  return (
    <div className="book-cover bg-gradient-to-br from-sky-100 via-blue-100 to-slate-200">
      <div className="flex h-full items-end p-2">
        <span className="line-clamp-3 text-[10px] font-bold leading-tight text-text/80">{title}</span>
      </div>
    </div>
  );
}

function BookCard({ book }) {
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

function BookCardSkeleton() {
  return (
    <article className="grid h-full w-full max-w-[165px] justify-self-center gap-3 animate-pulse">
      <div className="book-shelf-cover">
        <div className="aspect-[3/4] h-full rounded-sm bg-surfaceMuted" />
      </div>
      <div className="min-w-0">
        <div className="h-4 w-2/3 rounded bg-surfaceMuted" />
        <div className="mt-2 h-3 w-1/2 rounded bg-surfaceMuted" />
        <div className="mt-2 flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-surfaceMuted" />
          <div className="h-3 w-10 rounded bg-surfaceMuted" />
        </div>
      </div>
    </article>
  );
}

function AnnotationCard({ item }) {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(item.isFavorited);
  const [isPending, setIsPending] = useState(false);

  const goToProfile = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (item.authorId) navigate(`/users/${item.authorId}`);
  };

  const handleFavorite = async (event) => {
    event.preventDefault();
    if (isPending) return;

    const nextFavorited = !isFavorited;
    setIsPending(true);
    setIsFavorited(nextFavorited);

    try {
      if (nextFavorited) {
        await favoriteAnnotation(item.id);
      } else {
        await unfavoriteAnnotation(item.id);
      }
    } catch {
      setIsFavorited(!nextFavorited);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Link to={`/annotations/${item.id}`} className="block h-full">
      <article className="card annotation-card h-full transition hover:-translate-y-1 hover:shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`avatar ${item.avatar}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              {item.authorId ? (
                <button
                  type="button"
                  onClick={goToProfile}
                  className="text-sm font-bold text-text transition hover:text-primary"
                >
                  {item.author}
                </button>
              ) : (
                <strong className="text-sm text-text">{item.author}</strong>
              )}
              <span className="text-sm text-text-muted">{item.time}</span>
            </div>
            <p className="mt-1 truncate text-xs font-semibold text-text-muted">「{item.book}」</p>
          </div>
        </div>
      </header>

      <div>
        <p className="annotation-quote">
          <span className="mr-2 text-3xl font-bold text-primary-soft">“</span>
          {item.quote}
        </p>
      </div>

      <footer className="card-actions">
        <div className="flex items-center gap-5">
          <span>♡ {item.likes}</span>
          <span>댓글 {item.comments}</span>
        </div>
        <button
          type="button"
          className={`button button--sm ${isFavorited ? 'button--primary' : 'button--secondary'}`}
          onClick={handleFavorite}
          disabled={isPending}
          aria-pressed={isFavorited}
        >
          {isFavorited ? '★ 저장됨' : '☆ 저장'}
        </button>
      </footer>
      </article>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white/70">
      <div className="container flex flex-col gap-4 py-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="hidden sm:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [todayFeed, setTodayFeed] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [categoryGroup, setCategoryGroup] = useState('');
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedErrorMessage, setFeedErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadCategoryFilters() {
      try {
        const response = await getBookCategories();
        if (!ignore) setCategoryFilters(response.data || []);
      } catch {
        if (!ignore) setCategoryFilters([]);
      }
    }

    loadCategoryFilters();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadBooks() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getBooks({
          categoryGroup: categoryGroup || undefined,
          sort: 'recentAnnotations',
          recentHours: 24,
          page: 1,
          size: 7,
        });
        const page = getPageData(response);
        if (!ignore) setBooks(page.data.map(normalizeBook));
      } catch (error) {
        if (!ignore) {
          setBooks([]);
          setErrorMessage(error.message || '책 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadBooks();

    return () => {
      ignore = true;
    };
  }, [categoryGroup]);

  useEffect(() => {
    let ignore = false;

    async function loadTodayFeed() {
      setIsFeedLoading(true);
      setFeedErrorMessage('');

      try {
        const response = await getAnnotationFeed({
          recentHours: 24,
          sort: 'likes,desc',
          page: 1,
          size: 3,
        });
        const page = getPageData(response);
        if (!ignore) setTodayFeed(page.data.map(normalizeFeedItem));
      } catch (error) {
        if (!ignore) {
          setTodayFeed([]);
          setFeedErrorMessage(error.message || '오늘의 문장피드를 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) setIsFeedLoading(false);
      }
    }

    loadTodayFeed();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams({ category: searchCategory });
    const trimmedKeyword = keyword.trim();

    if (trimmedKeyword) {
      params.set('q', trimmedKeyword);
    }

    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-page">
      <SiteHeader active="home" />

      <main className="page">
        <div className="container grid gap-8">
          <HomeHero />

          <section className="grid gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="section-title">인기 책</h2>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className={`button button--sm ${categoryGroup ? 'button--secondary' : 'button--primary'}`}
                type="button"
                onClick={() => setCategoryGroup('')}
              >
                전체
              </button>
              {categoryFilters.map((filter) => (
                <button
                  key={filter.value}
                  className={`button button--sm ${categoryGroup === filter.value ? 'button--primary' : 'button--secondary'}`}
                  type="button"
                  onClick={() => setCategoryGroup((value) => (value === filter.value ? '' : filter.value))}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {errorMessage && (
              <div className="py-8 text-center">
                <p className="text-sm font-semibold text-text-muted">{errorMessage}</p>
              </div>
            )}

            {!errorMessage && (
              <div className="book-shelf-list mt-8">
                {isLoading
                  ? Array.from({ length: 7 }).map((_, index) => <BookCardSkeleton key={index} />)
                  : books.slice(0, 7).map((book) => <BookCard key={book.id} book={book} />)}
              </div>
            )}

            {!isLoading && !errorMessage && books.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-text-muted">검색 결과가 없습니다</p>
              </div>
            )}
          </section>

          <section className="grid gap-4 border-t border-line pt-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="section-title mr-2">오늘의 문장피드</h2>
              <Link className="text-sm font-bold text-primary hover:underline" to="/search?category=annotation">
                더보기
              </Link>
            </div>

            {feedErrorMessage && (
              <div className="py-8 text-center">
                <p className="text-sm font-semibold text-text-muted">{feedErrorMessage}</p>
              </div>
            )}

            {!feedErrorMessage && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {isFeedLoading
                  ? Array.from({ length: 3 }).map((_, index) => <article key={index} className="card annotation-card animate-pulse" />)
                  : todayFeed.map((item) => <AnnotationCard key={item.id} item={item} />)}
              </div>
            )}

            {!isFeedLoading && !feedErrorMessage && todayFeed.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-sm font-semibold text-text-muted">최근 24시간 안에 올라온 구절노트가 없습니다.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
