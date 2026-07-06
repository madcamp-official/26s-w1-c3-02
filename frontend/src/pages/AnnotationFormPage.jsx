import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getBook } from '../api/books';
import { createAnnotation, getAnnotation, updateAnnotation } from '../api/annotations';
import SiteHeader from '../components/SiteHeader';

const visibilityOptions = [
  {
    label: '공개',
    value: 'public',
    help: '모두에게 이 구절 노트를 공개해요.',
  },
  {
    label: '비공개',
    value: 'private',
    help: '나만 볼 수 있는 개인 기록으로 저장돼요.',
  },
  {
    label: '친구 공개',
    value: 'friends',
    help: '친구에게만 이 구절 노트를 공개해요.',
  },
];

const annotationTypes = [
  { label: '일반', value: 'NORMAL' },
  { label: '감상', value: 'REVIEW' },
  { label: '질문', value: 'QUESTION' },
  { label: '토론', value: 'DISCUSSION' },
];

function LogoMark() {
  return (
    <img className="w-[132px] shrink-0 object-contain sm:w-[160px] lg:w-[190px]" src="/logo.png" alt="문장서재" />
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

        <nav className="hidden justify-self-end md:flex md:items-center md:gap-5" aria-label="주요 메뉴">
          <Link className="nav__link" to="/">홈</Link>
          <Link className="nav__link" to="/search">둘러보기</Link>
          <Link className="nav__link" to="/mypage">내 서재</Link>
        </nav>
      </div>
    </header>
  );
}

function normalizeBook(book) {
  return {
    id: book.bookId ?? book.id,
    title: book.title ?? '제목 없음',
    author: book.author ?? '작가 미상',
    coverImageUrl: book.coverImageUrl,
  };
}

export default function AnnotationFormPage() {
  const navigate = useNavigate();
  const { annotationId } = useParams();
  const [searchParams] = useSearchParams();
  const isEditMode = Boolean(annotationId);
  const [bookId, setBookId] = useState(searchParams.get('bookId') || '');
  const [book, setBook] = useState(null);
  const [page, setPage] = useState('');
  const [passage, setPassage] = useState('');
  const [review, setReview] = useState('');
  const [annotationType, setAnnotationType] = useState('NORMAL');
  const [visibility, setVisibility] = useState('public');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadAnnotation() {
      if (!isEditMode) return;

      setIsLoadingBook(true);
      setErrorMessage('');

      try {
        const response = await getAnnotation(annotationId);
        if (ignore) return;

        const nextBookId = response.book?.bookId ?? response.bookId;
        setBookId(nextBookId ? String(nextBookId) : '');
        setPage(response.page ? String(response.page) : '');
        setPassage(response.passage ?? '');
        setReview(response.review ?? '');
        setAnnotationType(response.type ?? 'NORMAL');
        setVisibility(response.visibility ?? 'public');
        setIsSpoiler(Boolean(response.isSpoiler));
      } catch (error) {
        if (!ignore) setErrorMessage(error.message || '구절 노트 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore && !bookId) setIsLoadingBook(false);
      }
    }

    loadAnnotation();

    return () => {
      ignore = true;
    };
  }, [annotationId, isEditMode]);

  useEffect(() => {
    let ignore = false;

    async function loadBook() {
      if (!bookId && isEditMode) {
        return;
      }

      if (!bookId) {
        setErrorMessage('책 상세 화면에서 구절 노트 작성을 시작해주세요.');
        setIsLoadingBook(false);
        return;
      }

      setIsLoadingBook(true);

      try {
        const response = await getBook(bookId);
        if (!ignore) {
          setBook(normalizeBook(response));
        }
      } catch (error) {
        if (!ignore) setErrorMessage(error.message || '책 정보를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setIsLoadingBook(false);
      }
    }

    loadBook();

    return () => {
      ignore = true;
    };
  }, [bookId, isEditMode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!bookId) {
      setErrorMessage('책 상세 화면에서 구절 노트 작성을 시작해주세요.');
      return;
    }

    if (!page || !passage.trim() || !review.trim()) {
      setErrorMessage('페이지 번호, 인용 구절, 나의 생각을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        bookId: Number(bookId),
        type: annotationType,
        passage: passage.trim(),
        review: review.trim(),
        page: Number(page),
        visibility,
        isSpoiler,
      };

      if (isEditMode) {
        await updateAnnotation(annotationId, payload);
        navigate(`/annotations/${annotationId}`);
      } else {
        await createAnnotation(payload);
        navigate(`/books/${bookId}`);
      }
    } catch (error) {
      setErrorMessage(error.message || '구절 노트를 게시하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />

      <div className="border-b border-line bg-white/40">
        <div className="container flex min-h-[58px] items-center gap-2 text-sm font-semibold text-text-muted">
          <Link to="/">홈</Link>
          <span>/</span>
          <span className="text-text">{isEditMode ? '구절 노트 수정' : '새 구절 노트'}</span>
        </div>
      </div>

      <main className="page">
        <div className="container grid max-w-[860px] gap-8">
          <div>
            <p className="text-sm font-bold text-text-muted">문장서재</p>
            <h1 className="page-title mt-2">{isEditMode ? '구절 노트 수정하기' : '새 구절 노트 남기기'}</h1>
          </div>

          <form className="card card--padded grid gap-7" onSubmit={handleSubmit}>
            <section className="rounded-sm border border-line bg-pageSoft p-5">
              <span className="form-label">선택한 책</span>
              {isLoadingBook ? (
                <div className="mt-3 grid grid-cols-[72px_1fr] gap-4">
                  <div className="aspect-[3/4] rounded-sm bg-surfaceMuted" />
                  <div className="grid content-center gap-2">
                    <div className="h-5 w-2/3 rounded bg-surfaceMuted" />
                    <div className="h-4 w-1/3 rounded bg-surfaceMuted" />
                  </div>
                </div>
              ) : book ? (
                <div className="mt-3 grid grid-cols-[72px_1fr] gap-4">
                  {book.coverImageUrl ? (
                    <img
                      className="aspect-[3/4] w-[72px] rounded-sm object-cover shadow-soft"
                      src={book.coverImageUrl}
                      alt={`${book.title} 표지`}
                    />
                  ) : (
                    <div className="flex aspect-[3/4] w-[72px] items-center justify-center rounded-sm bg-primary-soft text-xs font-bold text-primary">
                      표지
                    </div>
                  )}
                  <div className="min-w-0 self-center">
                    <h2 className="m-0 break-words text-2xl font-extrabold leading-[1.35] text-text">{book.title}</h2>
                    <p className="mt-2 text-sm font-semibold text-text-muted">{book.author}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm font-semibold text-text-muted">책 정보를 찾을 수 없습니다.</p>
              )}
            </section>

            <label className="form-field max-w-[180px]">
              <span className="form-label">페이지 번호</span>
              <input
                className="input"
                min="1"
                type="number"
                value={page}
                onChange={(event) => setPage(event.target.value)}
                placeholder="예: 134"
              />
            </label>

            <label className="form-field">
              <span className="form-label">인용 구절</span>
              <textarea
                className="textarea"
                value={passage}
                onChange={(event) => setPassage(event.target.value)}
                placeholder="책의 문장을 그대로 옮겨보세요."
              />
            </label>

            <label className="form-field">
              <span className="form-label">나의 생각</span>
              <textarea
                className="textarea"
                value={review}
                onChange={(event) => setReview(event.target.value)}
                placeholder="이 문장에서 어떤 생각이 들었나요?"
              />
            </label>

            <fieldset className="grid gap-5">
              <legend className="form-label">노트 유형</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {annotationTypes.map((type) => (
                  <button
                    key={type.value}
                    className={`button button--sm ${annotationType === type.value ? 'button--primary' : 'button--secondary'}`}
                    type="button"
                    onClick={() => setAnnotationType(type.value)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="grid gap-5">
              <legend className="form-label">공개 설정</legend>
              <div className="mt-2 grid gap-3 md:grid-cols-3">
                {visibilityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`grid cursor-pointer gap-2 rounded-sm border p-4 transition ${
                      visibility === option.value ? 'border-primary bg-primary-soft' : 'border-line bg-white'
                    }`}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={visibility === option.value}
                      onChange={(event) => setVisibility(event.target.value)}
                    />
                    <span className="text-center text-sm font-extrabold text-text">{option.label}</span>
                    <span className="text-center text-xs leading-[1.5] text-text-muted">{option.help}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label
              className={`flex cursor-pointer items-center justify-between gap-4 rounded-sm border p-4 transition ${
                isSpoiler ? 'border-danger bg-danger-soft' : 'border-line bg-white'
              }`}
            >
              <span>
                <span className="block text-sm font-extrabold text-text">스포일러 포함</span>
                <span className="mt-1 block text-xs leading-[1.5] text-text-muted">
                  선택하면 구절 카드에서 책 제목을 제외한 내용이 가려져요.
                </span>
              </span>
              <input
                className="h-5 w-5 accent-[#0f2547]"
                type="checkbox"
                checked={isSpoiler}
                onChange={(event) => setIsSpoiler(event.target.checked)}
              />
            </label>

            {errorMessage && <p className="form-error">{errorMessage}</p>}

            <div className="flex justify-end gap-2">
              <Link className="button button--secondary" to={isEditMode ? `/annotations/${annotationId}` : bookId ? `/books/${bookId}` : '/'}>
                취소
              </Link>
              <button className="button button--primary button--lg" type="submit" disabled={isSubmitting || isLoadingBook || !book}>
                {isSubmitting ? '저장 중' : isEditMode ? '수정하기' : '게시하기'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
