import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteAnnotation, favoriteAnnotation, getAnnotation, unfavoriteAnnotation } from '../api/annotations';
import { createComment, deleteComment, getComments } from '../api/comments';
import { like, unlike } from '../api/likes';
import { getPageData } from '../api/client';
import { getMe } from '../api/users';
import SiteHeader from '../components/SiteHeader';

const sortOptions = [
  { label: '인기순', value: 'popular' },
  { label: '최신순', value: 'recent,desc' },
];

const annotationTypeLabels = {
  NORMAL: '일반',
  REVIEW: '감상',
  QUESTION: '질문',
  DISCUSSION: '토론',
};

const visibilityLabels = {
  public: '공개',
  friends: '친구 공개',
  private: '비공개',
  group: '그룹',
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
        </Link>
        <nav className="hidden justify-self-end md:flex md:items-center md:gap-5" aria-label="주요 메뉴">
          <Link className="nav__link" to="/">홈</Link>
          <Link className="nav__link nav__link--active" to="/search">둘러보기</Link>
          <Link className="nav__link" to="/mypage">내 서재</Link>
        </nav>
      </div>
    </header>
  );
}

function normalizeAnnotation(annotation) {
  return {
    id: annotation.annotationId ?? annotation.id,
    bookId: annotation.book?.bookId ?? annotation.bookId,
    bookTitle: annotation.book?.title ?? annotation.bookTitle ?? '책 정보 없음',
    authorId: annotation.author?.id ?? annotation.authorId,
    author: annotation.author?.nickname ?? annotation.authorName ?? '익명',
    type: annotation.type ?? 'NORMAL',
    typeLabel: annotationTypeLabels[annotation.type] ?? '일반',
    page: annotation.page ?? '-',
    passage: annotation.passage ?? '',
    review: annotation.review ?? '',
    visibility: visibilityLabels[annotation.visibility] ?? annotation.visibility ?? '공개',
    likeCount: annotation.likeCount ?? 0,
    isLiked: Boolean(annotation.isLiked),
    isFavorited: Boolean(annotation.isFavorited),
    isSpoiler: Boolean(annotation.isSpoiler),
    createdAt: annotation.createdAt,
  };
}

function normalizeComment(comment) {
  return {
    id: comment.commentId ?? comment.id,
    authorId: comment.author?.id ?? comment.authorId,
    author: comment.author?.nickname ?? comment.authorName ?? '익명',
    content: comment.content ?? '',
    likeCount: comment.likeCount ?? 0,
    isLiked: Boolean(comment.isLiked),
    createdAt: comment.createdAt,
  };
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(date);
}

function AnnotationCard({ annotation, isMine, onDelete }) {
  const [isRevealed, setIsRevealed] = useState(!annotation.isSpoiler || isMine);
  const [isLiked, setIsLiked] = useState(annotation.isLiked);
  const [isFavorited, setIsFavorited] = useState(annotation.isFavorited);
  const [likeCount, setLikeCount] = useState(annotation.likeCount);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const shouldHideContent = annotation.isSpoiler && !isMine && !isRevealed;

  const handleLike = async () => {
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
    }
  };

  const handleFavorite = async () => {
    if (isFavoritePending) return;

    const nextFavorited = !isFavorited;
    setIsFavoritePending(true);
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
    <article className="card card--padded">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="tag">p.{annotation.page}</span>
          <span className="tag tag--cream">{annotation.typeLabel}</span>
          <span className="tag tag--blue">{annotation.visibility}</span>
          {annotation.isSpoiler && <span className="tag tag--danger">스포일러</span>}
          <span className="text-sm font-semibold text-text-muted">「{annotation.bookTitle}」</span>
        </div>
        <span className="text-sm text-text-subtle">{formatDate(annotation.createdAt)}</span>
      </div>

      {shouldHideContent ? (
        <div className="mt-5 rounded-sm border border-line bg-surfaceMuted p-6 text-center">
          <p className="text-sm font-bold text-text-muted">스포일러가 포함된 구절 노트입니다.</p>
          <button className="button button--secondary button--sm mt-4" type="button" onClick={() => setIsRevealed(true)}>
            보기
          </button>
        </div>
      ) : (
        <>
          <blockquote className="mt-5 border-l-4 border-primary-soft pl-5 text-2xl font-semibold leading-[1.7] text-text">
            “{annotation.passage}”
          </blockquote>
          <p className="mt-4 text-base leading-[1.8] text-text-muted">{annotation.review}</p>
          <footer className="mt-7 flex flex-wrap items-center justify-between gap-4 text-sm text-text-muted">
            <span>{annotation.author}</span>
            <div className="flex flex-wrap gap-2">
              {isMine && (
                <>
                  <Link className="button button--secondary button--sm" to={`/annotations/${annotation.id}/edit`}>
                    수정
                  </Link>
                  <button className="button button--danger button--sm" type="button" onClick={onDelete}>
                    삭제
                  </button>
                </>
              )}
              <button className={`button button--sm ${isLiked ? 'button--primary' : 'button--secondary'}`} type="button" onClick={handleLike}>
                ▲ 좋아요 {likeCount}
              </button>
              <button
                className={`button button--sm ${isFavorited ? 'button--primary' : 'button--secondary'}`}
                type="button"
                onClick={handleFavorite}
                disabled={isFavoritePending}
                aria-pressed={isFavorited}
              >
                {isFavorited ? '★ 저장됨' : '☆ 저장'}
              </button>
            </div>
          </footer>
        </>
      )}
    </article>
  );
}

function CommentCard({ comment, isMine, onDelete }) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);

  const handleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount((count) => Math.max(count + (nextLiked ? 1 : -1), 0));

    try {
      if (nextLiked) {
        await like({ targetType: 'comment', targetId: comment.id });
      } else {
        await unlike({ targetType: 'comment', targetId: comment.id });
      }
    } catch {
      setIsLiked(!nextLiked);
      setLikeCount((count) => Math.max(count + (nextLiked ? -1 : 1), 0));
    }
  };

  return (
    <article className="border-l-4 border-primary-soft py-1 pl-5">
      <header className="flex flex-wrap items-center gap-3">
        <strong className="text-sm text-text">{comment.author}</strong>
        <span className="text-sm text-text-subtle">{formatDate(comment.createdAt)}</span>
      </header>
      <p className="mt-3 leading-[1.75] text-text">{comment.content}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={`button button--sm ${isLiked ? 'button--primary' : 'button--secondary'}`} type="button" onClick={handleLike}>
          ▲ 좋아요 {likeCount}
        </button>
        {isMine && (
          <button className="button button--danger button--sm" type="button" onClick={onDelete}>
            삭제
          </button>
        )}
      </div>
    </article>
  );
}

export default function AnnotationDetailPage() {
  const { annotationId } = useParams();
  const navigate = useNavigate();
  const [annotation, setAnnotation] = useState(null);
  const [comments, setComments] = useState([]);
  const [me, setMe] = useState(null);
  const [sort, setSort] = useState('popular');
  const [visibleCount, setVisibleCount] = useState(5);
  const [draftContent, setDraftContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const visibleComments = comments.slice(0, visibleCount);

  const commentCountLabel = useMemo(() => {
    return comments.length;
  }, [comments.length]);

  async function loadComments(nextSort = sort) {
    const response = await getComments(annotationId, { sort: nextSort, page: 1, size: 100 });
    setComments(getPageData(response).data.map(normalizeComment));
  }

  useEffect(() => {
    let ignore = false;

    async function loadDetail() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [annotationResponse, meResponse] = await Promise.all([
          getAnnotation(annotationId),
          getMe().catch(() => null),
          loadComments(sort),
        ]);
        if (!ignore) {
          setAnnotation(normalizeAnnotation(annotationResponse));
          setMe(meResponse);
        }
      } catch (error) {
        if (!ignore) setErrorMessage(error.message || '주석 상세를 불러오지 못했습니다.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadDetail();

    return () => {
      ignore = true;
    };
  }, [annotationId]);

  useEffect(() => {
    setVisibleCount(5);
    loadComments(sort).catch((error) => {
      setErrorMessage(error.message || '댓글을 불러오지 못했습니다.');
    });
  }, [sort]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedContent = draftContent.trim();
    if (!trimmedContent) return;

    setIsSubmitting(true);

    try {
      await createComment(annotationId, {
        content: trimmedContent,
      });
      setDraftContent('');
      setVisibleCount(5);
      await loadComments(sort);
    } catch (error) {
      setErrorMessage(error.message || '댓글을 작성하지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAnnotation = async () => {
    if (!window.confirm('이 구절 노트를 삭제할까요?')) return;

    try {
      await deleteAnnotation(annotationId);
      navigate(annotation?.bookId ? `/books/${annotation.bookId}` : '/');
    } catch (error) {
      setErrorMessage(error.message || '구절 노트를 삭제하지 못했습니다.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제할까요?')) return;

    try {
      await deleteComment(commentId);
      await loadComments(sort);
    } catch (error) {
      setErrorMessage(error.message || '댓글을 삭제하지 못했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-page">
      <SiteHeader />

      <main className="page">
        <div className="container grid max-w-[940px] gap-8">
          {errorMessage && (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-text-muted">{errorMessage}</p>
            </div>
          )}

          {!errorMessage && isLoading && (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-text-muted">불러오는 중입니다</p>
            </div>
          )}

          {!errorMessage && !isLoading && annotation && (
            <>
              <AnnotationCard
                annotation={annotation}
                isMine={me?.id === annotation.authorId}
                onDelete={handleDeleteAnnotation}
              />

              <section className="grid gap-4">
                <div className="flex flex-col gap-3 border-b border-line pb-4 md:flex-row md:items-center md:justify-between">
                  <h2 className="section-title">댓글 {commentCountLabel}</h2>

                  <select className="select w-full md:w-[140px]" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="댓글 정렬">
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-6">
                  {visibleComments.length === 0 ? (
                    <div className="py-10 text-center">
                      <p className="text-sm font-semibold text-text-muted">아직 댓글이 없습니다</p>
                    </div>
                  ) : (
                    visibleComments.map((comment) => (
                      <CommentCard
                        key={comment.id}
                        comment={comment}
                        isMine={me?.id === comment.authorId}
                        onDelete={() => handleDeleteComment(comment.id)}
                      />
                    ))
                  )}
                </div>

                {visibleCount < comments.length && (
                  <button className="button button--secondary justify-self-center" type="button" onClick={() => setVisibleCount((count) => count + 5)}>
                    더보기
                  </button>
                )}
              </section>

              <form className="card card--padded grid gap-4" onSubmit={handleSubmit}>
                <textarea
                  className="textarea"
                  value={draftContent}
                  onChange={(event) => setDraftContent(event.target.value)}
                  placeholder="이 구절에 대한 댓글을 남겨보세요."
                />
                <div className="flex justify-end">
                  <button className="button button--primary" type="submit" disabled={isSubmitting || !draftContent.trim()}>
                    {isSubmitting ? '작성 중' : '댓글 작성'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
