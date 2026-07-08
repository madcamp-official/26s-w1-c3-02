import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { favoriteBook, getBook, unfavoriteBook } from '../api/books';
import { favoriteAnnotation, getBookAnnotations, searchAnnotations, unfavoriteAnnotation } from '../api/annotations';
import { getGroupAnnotations } from '../api/groups';
import { getPageData } from '../api/client';
import { like, unlike } from '../api/likes';
import SiteHeader from '../components/SiteHeader';
import UserAvatar from '../components/common/UserAvatar';
import { BookmarkIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { splitBookCategory } from '../utils/bookCategory';

const sortOptions = [
  { label: '최신순', value: 'recent,desc' },
  { label: '인기순', value: 'likes,desc' },
  { label: '페이지순', value: 'pageNumber' },
];

const annotationTypeOptions = [
  { label: '전체', value: '' },
  { label: '일반', value: 'NORMAL' },
  { label: '감상', value: 'REVIEW' },
  { label: '질문', value: 'QUESTION' },
  { label: '토론', value: 'DISCUSSION' },
];

const annotationTypeLabels = {
  NORMAL: '일반',
  REVIEW: '감상',
  QUESTION: '질문',
  DISCUSSION: '토론',
};

const visibilityLabels = {
  public: '공개',
  friends: '친구',
  private: '비공개',
  group: '그룹',
};

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

function normalizeAnnotation(annotation) {
  return {
    id: annotation.annotationId ?? annotation.id,
    page: annotation.page ?? annotation.pageNumber ?? '-',
    type: annotation.type ?? 'NORMAL',
    typeLabel: annotationTypeLabels[annotation.type] ?? '일반',
    visibility: visibilityLabels[annotation.visibility] ?? annotation.visibility ?? '공개',
    quote: annotation.passage ?? annotation.quote ?? '',
    review: annotation.review ?? annotation.content ?? '',
    authorId: annotation.author?.id ?? annotation.authorId,
    author: annotation.author?.nickname ?? annotation.authorName ?? annotation.author ?? '익명',
    authorAvatarIcon: annotation.author?.avatarIcon ?? '',
    authorAvatarUrl: annotation.author?.avatarUrl ?? '',
    time: formatDate(annotation.createdAt),
    comments: annotation.commentCount ?? annotation.comments ?? 0,
    likeCount: annotation.likeCount ?? 0,
    isLiked: Boolean(annotation.isLiked),
    isFavorited: Boolean(annotation.isFavorited),
    isSpoiler: Boolean(annotation.isSpoiler),
  };
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(date);
}

function LogoMark() {
  return (
    <img className="w-[132px] shrink-0 object-contain sm:w-[160px] lg:w-[190px]" src="/logo-transparent.png" alt="문장서재" />
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="container grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
        <Link to="/" className="brand justify-self-start">
          <LogoMark />
          <span className="brand__subtitle hidden xl:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </Link>

        <div className="hidden justify-self-center md:block md:w-[min(42vw,420px)] lg:w-[min(36vw,460px)]">
          <label className="flex w-full items-center gap-3 rounded-sm border border-line bg-white px-4 py-2.5 text-sm text-text-muted shadow-soft">
            <span aria-hidden="true">⌕</span>
            <input
              className="w-full min-w-0 bg-transparent text-text outline-none placeholder:text-text-subtle"
              placeholder="책 제목, 저자 검색"
              readOnly
            />
          </label>
        </div>

        <nav className="hidden justify-self-end md:flex md:items-center md:gap-3 lg:gap-5 xl:gap-7" aria-label="주요 메뉴">
          <Link className="nav__link shrink-0" to="/">
            홈
          </Link>
          <Link className="nav__link nav__link--active shrink-0" to="/search">
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

        <Link className="button button--primary button--sm justify-self-end md:hidden" to="/login">
          로그인
        </Link>
      </div>
    </header>
  );
}

function BookCover({ book }) {
  if (book?.coverImageUrl) {
    return (
      <img
        className="w-full max-w-[180px] rounded-md shadow-float md:max-w-[220px] h-auto"
        src={book.coverImageUrl}
        alt={`${book.title} 표지`}
      />
    );
  }

  return (
    <div className="relative aspect-[3/4] w-full max-w-[180px] rounded-md bg-gradient-to-br from-teal-200 via-teal-300 to-teal-600 shadow-float md:max-w-[220px]">
      <div className="absolute inset-y-0 left-0 w-5 rounded-l-md bg-teal-900/70" />
      <div className="absolute inset-8 flex flex-col items-center justify-center border border-white/60 text-center text-white">
        <span className="mb-8 h-px w-10 bg-white/70" />
        <strong className="break-words text-3xl font-bold leading-snug md:text-4xl">{book?.title ?? '책'}</strong>
        <span className="mt-8 h-px w-10 bg-white/70" />
        <span className="mt-5 text-base font-semibold">{book?.author ?? '작가 미상'}</span>
      </div>
      <div className="absolute -bottom-2 left-4 right-0 h-3 rounded-b-md bg-black/15 blur-[2px]" />
    </div>
  );
}

function BookHero({ book, isLoading, onToggleFavorite, isFavoritePending }) {
  if (isLoading) {
    return (
      <section className="mx-auto grid w-full max-w-[900px] gap-6 py-10 md:grid-cols-[240px_1fr] md:items-center md:py-16">
        <div className="mx-auto aspect-[3/4] w-full max-w-[180px] animate-pulse rounded-md bg-surfaceMuted md:mx-0 md:max-w-[220px]" />
        <div className="grid gap-4">
          <div className="h-6 w-20 rounded-full bg-surfaceMuted" />
          <div className="h-12 w-2/3 rounded bg-surfaceMuted" />
          <div className="h-5 w-1/3 rounded bg-surfaceMuted" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid w-full max-w-[900px] gap-6 py-10 md:grid-cols-[240px_1fr] md:items-center md:py-16">
      <div className="flex justify-center md:justify-start">
        <BookCover book={book} />
      </div>

      <div className="min-w-0 text-center md:text-left">
        <div className="flex flex-wrap justify-center gap-2 md:justify-start">
          {splitBookCategory(book.genre).map((category) => (
            <span key={category} className="tag tag--blue max-w-full truncate">
              {category}
            </span>
          ))}
        </div>
        <h1 className="mt-5 break-words text-4xl font-extrabold leading-tight text-text md:text-5xl">
          {book.title}
        </h1>
        <p className="mt-5 text-xl font-medium text-text-muted">{book.author} 지음</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 md:justify-start">
          <button
            className={`button button--lg ${book.isFavorited ? 'button--primary' : 'button--secondary'}`}
            type="button"
            onClick={onToggleFavorite}
            disabled={isFavoritePending}
            aria-pressed={book.isFavorited}
          >
            <BookmarkIcon className="h-4 w-4" fill={book.isFavorited ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} />
            {book.isFavorited ? '서재에 담김' : '서재에 담기'}
          </button>
          <span className="text-base font-medium text-text-subtle">구절 노트 {book.annotationCount}개</span>
        </div>
      </div>
    </section>
  );
}

function AnnotationCard({ annotation, isMine, onRequireAuth }) {
  const [isRevealed, setIsRevealed] = useState(!annotation.isSpoiler || isMine);
  const [isLiked, setIsLiked] = useState(annotation.isLiked);
  const [isFavorited, setIsFavorited] = useState(annotation.isFavorited);
  const [likeCount, setLikeCount] = useState(annotation.likeCount);
  const [isLikePending, setIsLikePending] = useState(false);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const shouldHideContent = annotation.isSpoiler && !isMine && !isRevealed;

  const handleLike = async (event) => {
    event.preventDefault();
    if (!onRequireAuth()) return;
    if (isLikePending) return;

    setIsLikePending(true);
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((count) => Math.max(count + (nextLiked ? 1 : -1), 0));

    try {
      if (nextLiked) {
        await like({ targetType: 'annotation', targetId: annotation.id });
      } else {
        await unlike({ targetType: 'annotation', targetId: annotation.id });
      }
    } catch {
      setIsLiked(!nextLiked);
      setLikeCount((count) => Math.max(count + (nextLiked ? -1 : 1), 0));
    } finally {
      setIsLikePending(false);
    }
  };

  const handleFavorite = async (event) => {
    event.preventDefault();
    if (!onRequireAuth()) return;
    if (isFavoritePending) return;

    setIsFavoritePending(true);
    const nextFavorited = !isFavorited;
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
      setIsFavoritePending(false);
    }
  };

  return (
    <Link
      to={`/annotations/${annotation.id}`}
      className="card card--padded block transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="tag">p.{annotation.page}</span>
          <span className="tag tag--cream">{annotation.typeLabel}</span>
          <span className="tag tag--blue">{annotation.visibility}</span>
          {annotation.isSpoiler && <span className="tag tag--danger">스포일러</span>}
        </div>
        <span className="shrink-0 text-sm font-medium text-text-subtle">{annotation.time}</span>
      </div>

      {shouldHideContent ? (
        <div className="mt-5 rounded-sm border border-line bg-surfaceMuted p-5 text-center">
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
          <blockquote className="mt-5 border-l-4 border-primary-soft pl-5 text-2xl font-medium leading-[1.7] text-text">
            “{annotation.quote}”
          </blockquote>
          <p className="mt-4 text-base leading-[1.8] text-text-muted">{annotation.review}</p>
        </>
      )}

      {!shouldHideContent && (
        <footer className="mt-7 flex items-center justify-between gap-4 text-sm text-text-muted">
          {annotation.authorId ? (
            <Link to={`/users/${annotation.authorId}`} className="flex items-center gap-2 transition hover:text-primary">
              <UserAvatar avatarIcon={annotation.authorAvatarIcon} avatarUrl={annotation.authorAvatarUrl} nickname={annotation.author} size="sm" />
              <span className="font-semibold">{annotation.author}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <UserAvatar avatarIcon={annotation.authorAvatarIcon} avatarUrl={annotation.authorAvatarUrl} nickname={annotation.author} size="sm" />
              <span>{annotation.author}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              className={`button button--sm ${isLiked ? 'button--primary' : 'button--secondary'}`}
              type="button"
              disabled={isLikePending}
              onClick={handleLike}
            >
              ▲ 좋아요 {likeCount}
            </button>
            <button
              className={`button button--sm ${isFavorited ? 'button--primary' : 'button--secondary'}`}
              type="button"
              disabled={isFavoritePending}
              onClick={handleFavorite}
              aria-pressed={isFavorited}
            >
              {isFavorited ? '★ 저장됨' : '☆ 저장'}
            </button>
            <span className="button button--secondary button--sm pointer-events-none">
              댓글 {annotation.comments}
            </span>
          </div>
        </footer>
      )}
    </Link>
  );
}

function AnnotationSkeleton() {
  return (
    <article className="card card--padded animate-pulse">
      <div className="flex justify-between">
        <div className="h-6 w-24 rounded-full bg-surfaceMuted" />
        <div className="h-4 w-16 rounded bg-surfaceMuted" />
      </div>
      <div className="mt-5 h-16 rounded bg-surfaceMuted" />
      <div className="mt-4 h-5 w-3/4 rounded bg-surfaceMuted" />
      <div className="mt-7 h-5 w-1/2 rounded bg-surfaceMuted" />
    </article>
  );
}

function SearchAndAction({ bookId, value, onChange, onSearch, onReset }) {
  return (
    <section className="grid gap-4 border-t border-line pt-7 md:grid-cols-[1fr_auto] md:items-center">
      <form className="flex min-h-14 items-center gap-3 rounded-full border border-line bg-white px-5 text-base text-text-muted shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10" onSubmit={onSearch}>
        <span aria-hidden="true">⌕</span>
        <input
          className="w-full min-w-0 bg-transparent text-text outline-none placeholder:text-text-subtle"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="페이지 번호 또는 구절로 검색"
        />
        {value && (
          <button className="button button--ghost button--sm shrink-0" type="button" onClick={onReset}>
            초기화
          </button>
        )}
        <button className="button button--primary button--sm shrink-0" type="submit">
          검색
        </button>
      </form>
      <Link to={`/annotations/new?bookId=${bookId}`} className="button button--primary button--lg rounded-full px-8">
        + 구절 노트 작성
      </Link>
    </section>
  );
}

export default function BookDetailPage() {
  const { bookId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');
  const [book, setBook] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [sort, setSort] = useState('recent,desc');
  const [annotationType, setAnnotationType] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isBookLoading, setIsBookLoading] = useState(true);
  const [isAnnotationsLoading, setIsAnnotationsLoading] = useState(true);
  const [isBookFavoritePending, setIsBookFavoritePending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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

  const visibleBook = useMemo(
    () =>
      book ?? {
        title: '책 상세',
        author: '',
        genre: '일반',
        annotationCount: 0,
        isFavorited: false,
      },
    [book],
  );

  useEffect(() => {
    let ignore = false;

    async function loadBook() {
      setIsBookLoading(true);

      try {
        const response = await getBook(bookId);
        if (!ignore) setBook(normalizeBook(response));
      } catch (error) {
        if (!ignore) setErrorMessage(error.message || '책 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setIsBookLoading(false);
      }
    }

    loadBook();

    return () => {
      ignore = true;
    };
  }, [bookId]);

  useEffect(() => {
    let ignore = false;

    async function loadAnnotations() {
      setIsAnnotationsLoading(true);
      setErrorMessage('');

      try {
        const params = {
          sort,
          type: annotationType || undefined,
          page: 1,
          size: 20,
        };
        const trimmedSearch = searchKeyword.trim();
        const pageNumber = Number(trimmedSearch);
        const isPageSearch = trimmedSearch !== '' && !Number.isNaN(pageNumber);

        let response;
        if (groupId) {
          // 그룹 라운지에서 들어온 경우 전체 공개 주석이 아니라 해당 그룹에 남겨진 주석만 조회한다.
          response = await getGroupAnnotations(groupId, { ...params, bookId });
        } else if (trimmedSearch) {
          response = await searchAnnotations({
            ...params,
            bookId,
            keyword: isPageSearch ? undefined : trimmedSearch,
            pageNumber: isPageSearch ? pageNumber : undefined,
          });
        } else {
          response = await getBookAnnotations(bookId, params);
        }

        const page = getPageData(response);
        let items = page.data.map(normalizeAnnotation);

        // 그룹 전용 주석 API는 검색 파라미터를 지원하지 않으므로, 그룹 컨텍스트의 검색은 받아온 결과에서 클라이언트 필터링한다.
        if (groupId && trimmedSearch) {
          const keyword = trimmedSearch.toLowerCase();
          items = items.filter((item) =>
            isPageSearch
              ? item.page === pageNumber
              : item.quote.toLowerCase().includes(keyword) || item.review.toLowerCase().includes(keyword)
          );
        }

        if (!ignore) setAnnotations(items);
      } catch (error) {
        if (!ignore) {
          setAnnotations([]);
          setErrorMessage(error.message || '주석 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (!ignore) setIsAnnotationsLoading(false);
      }
    }

    loadAnnotations();

    return () => {
      ignore = true;
    };
  }, [annotationType, bookId, sort, searchKeyword, groupId]);

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchKeyword(searchInput.trim());
  };

  const resetSearch = () => {
    setSearchInput('');
    setSearchKeyword('');
  };

  const handleToggleBookFavorite = async () => {
    if (!requireAuth()) return;
    if (!book || isBookFavoritePending) return;

    const nextFavorited = !book.isFavorited;
    setIsBookFavoritePending(true);
    setBook((current) => (current ? { ...current, isFavorited: nextFavorited } : current));

    try {
      if (nextFavorited) {
        await favoriteBook(book.id);
      } else {
        await unfavoriteBook(book.id);
      }
    } catch (error) {
      setBook((current) => (current ? { ...current, isFavorited: !nextFavorited } : current));
      setErrorMessage(error.message || '서재 담기를 변경하지 못했습니다.');
    } finally {
      setIsBookFavoritePending(false);
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />

      <div className="border-b border-line bg-white/40">
        <div className="container flex min-h-[58px] min-w-0 items-center gap-2 text-sm font-semibold text-text-muted">
          {groupId ? (
            <Link className="shrink-0" to={`/groups/${groupId}`}>그룹 라운지</Link>
          ) : (
            <Link className="shrink-0" to="/">홈</Link>
          )}
          <span className="shrink-0">/</span>
          <span className="min-w-0 truncate text-text">{visibleBook.title}</span>
          <span className="sr-only">현재 책 ID {bookId}</span>
        </div>
      </div>

      <main className="page">
        <div className="container mx-auto grid max-w-[980px] gap-8">
          <BookHero
            book={visibleBook}
            isLoading={isBookLoading}
            onToggleFavorite={handleToggleBookFavorite}
            isFavoritePending={isBookFavoritePending}
          />
          <SearchAndAction
            bookId={bookId}
            value={searchInput}
            onChange={setSearchInput}
            onSearch={handleSearch}
            onReset={resetSearch}
          />

          <section className="grid gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {annotationTypeOptions.map((type) => (
                  <button
                    key={type.value || 'all'}
                    className={`button button--sm ${annotationType === type.value ? 'button--primary' : 'button--secondary'}`}
                    type="button"
                    onClick={() => setAnnotationType(type.value)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <select
                className="select w-full md:w-[140px]"
                aria-label="정렬"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {errorMessage && (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-text-muted">{errorMessage}</p>
              </div>
            )}

            {!errorMessage && (
              <div className="grid gap-4">
                {isAnnotationsLoading
                  ? Array.from({ length: 2 }).map((_, index) => <AnnotationSkeleton key={index} />)
                  : annotations.map((annotation) => (
                      <AnnotationCard
                        key={annotation.id}
                        annotation={annotation}
                        isMine={user?.id === annotation.authorId}
                        onRequireAuth={requireAuth}
                      />
                    ))}
              </div>
            )}

            {!isAnnotationsLoading && !errorMessage && annotations.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-text-muted">
                  {groupId ? '아직 그룹원이 남긴 주석이 없습니다' : '아직 등록된 주석이 없습니다'}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

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
