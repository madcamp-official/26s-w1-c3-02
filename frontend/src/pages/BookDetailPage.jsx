import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { getBook } from '../api/books';
import { getBookAnnotations } from '../api/annotations';
import { getGroup, getGroupAnnotations } from '../api/groups';
import { getErrorMessage } from '../utils/error';

const FILTERS = [
  { value: '', label: '전체' },
  { value: 'QUESTION', label: '질문' },
  { value: 'DISCUSSION', label: '토론' },
  { value: 'REVIEW', label: '감상' },
  { value: 'NORMAL', label: '일반' },
];

const VISIBILITY_LABEL = {
  public: '공개',
  friends: '친구공개',
  group: '그룹',
  private: '비공개',
};

const formatRelativeTime = (iso) => {
  if (!iso) return '';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${Math.max(diffMin, 0)}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return '어제';
  if (diffDay < 7) return `${diffDay}일 전`;
  const d = new Date(iso);
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}`;
};

function LogoMark() {
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-soft">
      <span className="absolute left-2 top-1.5 h-5 w-2 -skew-y-12 rounded-[2px] bg-primary" />
      <span className="absolute right-2 top-1.5 h-5 w-2 skew-y-12 rounded-[2px] bg-primary/85" />
    </span>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="container grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
        <Link to="/" className="brand justify-self-start">
          <LogoMark />
          <span>문장서재</span>
          <span className="brand__subtitle hidden xl:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </Link>

        <div className="hidden justify-self-center md:block md:w-[min(42vw,420px)] lg:w-[min(36vw,460px)]">
          <label className="flex w-full items-center gap-3 rounded-sm border border-line bg-white px-4 py-2.5 text-sm text-text-muted shadow-soft">
            <span aria-hidden="true">⌕</span>
            <input
              className="w-full min-w-0 bg-transparent text-text outline-none placeholder:text-text-subtle"
              placeholder="책 제목, 저자, 문장 검색"
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
  return (
    <div className="relative aspect-[3/4] w-full max-w-[180px] rounded-md bg-gradient-to-br from-teal-200 via-teal-300 to-teal-600 shadow-float md:max-w-[220px]">
      {book?.coverImageUrl ? (
        <img className="absolute inset-0 h-full w-full rounded-md object-cover" src={book.coverImageUrl} alt={book.title} />
      ) : (
        <>
          <div className="absolute inset-y-0 left-0 w-5 rounded-l-md bg-teal-900/70" />
          <div className="absolute inset-8 flex flex-col items-center justify-center border border-white/60 text-center text-white">
            <span className="mb-8 h-px w-10 bg-white/70" />
            <strong className="text-3xl font-bold leading-snug md:text-4xl">{book?.title}</strong>
            <span className="mt-8 h-px w-10 bg-white/70" />
            <span className="mt-5 text-base font-semibold">{book?.author}</span>
          </div>
        </>
      )}
      <div className="absolute -bottom-2 left-4 right-0 h-3 rounded-b-md bg-black/15 blur-[2px]" />
    </div>
  );
}

function BookHero({ book }) {
  return (
    <section className="mx-auto grid w-full max-w-[900px] gap-6 py-10 md:grid-cols-[240px_1fr] md:items-center md:py-16">
      <div className="flex justify-center md:justify-start">
        <BookCover book={book} />
      </div>

      <div className="min-w-0 text-center md:text-left">
        <span className="tag tag--blue mx-auto md:mx-0">{book.genreCode}</span>
        <h1 className="mt-5 break-words text-4xl font-extrabold leading-tight text-text md:text-5xl">
          {book.title}
        </h1>
        <p className="mt-5 text-xl font-medium text-text-muted">{book.author} 지음</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 md:justify-start">
          <button className="button button--secondary button--lg">☆ 서재에 담기</button>
          <span className="text-base font-medium text-text-subtle">주석 {book.annotationCount ?? 0}개</span>
        </div>
      </div>
    </section>
  );
}

function AnnotationCard({ annotation }) {
  return (
    <Link
      to={`/annotations/${annotation.annotationId}`}
      className="card card--padded block transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {annotation.page != null && <span className="tag">p.{annotation.page}</span>}
          <span className="tag tag--blue">{VISIBILITY_LABEL[annotation.visibility] || annotation.visibility}</span>
          {annotation.isSpoiler && <span className="tag tag--danger">스포일러</span>}
        </div>
        <span className="shrink-0 text-sm font-medium text-text-subtle">{formatRelativeTime(annotation.createdAt)}</span>
      </div>

      <blockquote className="mt-5 border-l-4 border-primary-soft pl-5 text-2xl font-medium leading-[1.7] text-text">
        "{annotation.passage}"
      </blockquote>
      {annotation.review && <p className="mt-4 text-base leading-[1.8] text-text-muted">{annotation.review}</p>}

      <footer className="mt-7 flex items-center justify-between gap-4 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {annotation.author?.nickname?.slice(0, 1)}
          </span>
          <span>{annotation.author?.nickname}</span>
        </div>
        <span>
          ♡ {annotation.likeCount || 0} · 댓글 {annotation.commentCount || 0}개
        </span>
      </footer>
    </Link>
  );
}

function SearchAndAction() {
  return (
    <section className="grid gap-4 border-t border-line pt-7 md:grid-cols-[1fr_auto] md:items-center">
      <label className="flex min-h-14 items-center gap-3 rounded-full border border-line bg-white px-5 text-base text-text-muted shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <span aria-hidden="true">⌕</span>
        <input
          className="w-full min-w-0 bg-transparent text-text outline-none placeholder:text-text-subtle"
          placeholder="페이지 번호 또는 구절로 검색"
        />
      </label>
      <Link to="/annotations/new" className="button button--primary button--lg rounded-full px-8">
        + 구절 노트 작성
      </Link>
    </section>
  );
}

export default function BookDetailPage() {
  const { bookId } = useParams();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');

  const [book, setBook] = useState(null);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [bookError, setBookError] = useState('');

  const [group, setGroup] = useState(null);

  const [annotations, setAnnotations] = useState([]);
  const [isLoadingAnnotations, setIsLoadingAnnotations] = useState(true);
  const [annotationError, setAnnotationError] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortOption, setSortOption] = useState('latest');

  const latestAnnotationRequestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingBook(true);
    setBookError('');
    getBook(bookId)
      .then((res) => {
        if (!cancelled) setBook(res);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setBookError(getErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBook(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookId]);

  // 그룹 경유로 들어온 경우 배너/뒤로가기용으로 그룹 이름을 함께 불러온다
  useEffect(() => {
    if (!groupId) {
      setGroup(null);
      return;
    }
    let cancelled = false;
    getGroup(groupId)
      .then((res) => {
        if (!cancelled) setGroup(res);
      })
      .catch((err) => console.error(err));
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  useEffect(() => {
    const requestId = ++latestAnnotationRequestId.current;
    setIsLoadingAnnotations(true);
    setAnnotationError('');

    const request = groupId
      ? getGroupAnnotations(groupId, { bookId, type: typeFilter || undefined, sort: sortOption })
      : getBookAnnotations(bookId, { type: typeFilter || undefined, sort: sortOption });

    request
      .then((res) => {
        if (requestId !== latestAnnotationRequestId.current) return;
        setAnnotations(res.data || []);
      })
      .catch((err) => {
        if (requestId !== latestAnnotationRequestId.current) return;
        console.error(err);
        setAnnotationError(getErrorMessage(err));
      })
      .finally(() => {
        if (requestId === latestAnnotationRequestId.current) setIsLoadingAnnotations(false);
      });
  }, [bookId, groupId, typeFilter, sortOption]);

  return (
    <div className="min-h-screen bg-page">
      <Header />

      <div className="border-b border-line bg-white/40">
        <div className="container flex min-h-[58px] items-center gap-2 text-sm font-semibold text-text-muted">
          {groupId ? (
            <Link to={`/groups/${groupId}`}>{group?.groupName || '그룹'}</Link>
          ) : (
            <Link to="/search">둘러보기</Link>
          )}
          <span>/</span>
          <span className="text-text">{book?.title || `책 ${bookId}`}</span>
        </div>
      </div>

      <main className="page">
        <div className="container mx-auto grid max-w-[980px] gap-8">
          {isLoadingBook ? (
            <div className="card card--padded h-[220px] animate-pulse bg-surfaceMuted" />
          ) : bookError ? (
            <div className="card card--padded bg-white text-center py-12">
              <p className="text-sm font-semibold text-danger">{bookError}</p>
            </div>
          ) : (
            <>
              <BookHero book={book} />
              <SearchAndAction />

              {groupId && (
                <div className="card card--padded bg-primary-soft text-sm font-semibold text-primary">
                  🔒 이 목록은 <strong>{group?.groupName || '그룹'}</strong> 멤버들이 작성한 주석만 보여줍니다.{' '}
                  <Link to={`/groups/${groupId}`} className="underline">
                    그룹으로 돌아가기
                  </Link>
                </div>
              )}

              <section className="grid gap-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2">
                    {FILTERS.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setTypeFilter(f.value)}
                        className={`button button--sm ${typeFilter === f.value ? 'button--primary' : 'button--secondary'}`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <select
                    className="select w-full md:w-[140px]"
                    aria-label="정렬"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="latest">최신순</option>
                    <option value="popular">인기순</option>
                    <option value="pageNumber">페이지순</option>
                  </select>
                </div>

                {isLoadingAnnotations ? (
                  <div className="grid gap-4">
                    <div className="card card--padded h-[180px] animate-pulse bg-surfaceMuted" />
                    <div className="card card--padded h-[180px] animate-pulse bg-surfaceMuted" />
                  </div>
                ) : annotationError ? (
                  <div className="py-10 text-center">
                    <p className="text-sm font-semibold text-danger">{annotationError}</p>
                  </div>
                ) : annotations.length === 0 ? (
                  <div className="py-12 text-center card card--padded bg-white/50">
                    <p className="text-sm font-semibold text-text-muted">
                      {groupId ? '아직 이 그룹 멤버가 이 책에 남긴 주석이 없습니다' : '아직 작성된 주석이 없습니다'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {annotations.map((annotation) => (
                      <AnnotationCard key={annotation.annotationId} annotation={annotation} />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
