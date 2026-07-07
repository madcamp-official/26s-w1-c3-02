import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../api/users';
import { getUserAnnotations } from '../api/annotations';
import DonutChart from '../components/DonutChart';
import { buildGenreSummary } from '../utils/genre';
import { getTypeMeta, formatCount, formatRelativeTime } from '../utils/format';
import { MessageIcon, HeartIcon, BookIcon, CalendarIcon } from '../components/icons';

function EmptyState({ message }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm font-semibold text-text-muted">{message}</p>
    </div>
  );
}

const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
};

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const PAGE_SIZE = 5;

  const [profile, setProfile] = useState(null);
  const [annotations, setAnnotations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const [profileRes, annRes] = await Promise.all([
          getUserProfile(userId),
          getUserAnnotations(userId, { size: 100 }),
        ]);
        if (ignore) return;
        setProfile(profileRes);
        setAnnotations(annRes.data || []);
        setVisibleCount(PAGE_SIZE);
      } catch (err) {
        if (ignore) return;
        console.error(err);
        setLoadError(err?.status === 404 ? '존재하지 않는 사용자입니다.' : '불러오지 못했습니다');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [userId]);

  const { summary: genreSummary, total: genreTotal } = buildGenreSummary(
    annotations.map((a) => a.book?.genreCode),
  );
  const isSelf = user?.id != null && String(user.id) === String(userId);
  const visibleAnnotations = annotations.slice(0, visibleCount);
  const hasMoreAnnotations = visibleCount < annotations.length;

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader />

      <main className="page flex-1">
        <div className="container">
          <div className="mx-auto grid w-full max-w-4xl gap-6">
            {isLoading ? (
              <>
                <div className="card card--padded h-[140px] animate-pulse bg-surfaceMuted" />
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <div className="card card--padded h-[280px] animate-pulse bg-surfaceMuted" />
                  <div className="card card--padded h-[280px] animate-pulse bg-surfaceMuted" />
                </div>
              </>
            ) : loadError ? (
              <div className="py-16 text-center">
                <p className="text-sm font-semibold text-danger">{loadError}</p>
                <Link to="/" className="button button--secondary button--sm mt-4">홈으로</Link>
              </div>
            ) : (
              <>
                {/* 프로필 헤더 + 통계 */}
                <section className="card card--padded flex flex-wrap items-center justify-between gap-6 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt={profile.nickname}
                          className="h-16 w-16 rounded-full object-cover shadow-soft"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-2xl font-bold text-primary shadow-soft">
                          {profile.nickname ? profile.nickname.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h1 className="text-[22px] font-bold leading-none text-text">{profile.nickname}</h1>
                        {isSelf && (
                          <Link
                            to="/mypage"
                            className="button button--secondary button--sm !min-h-7 !px-2.5 text-xs"
                          >
                            마이페이지에서 관리 →
                          </Link>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-text-muted">{profile.bio || '아직 소개글이 없습니다.'}</p>
                      {profile.createdAt && (
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-text-subtle">
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5" /> {formatDate(profile.createdAt)} 가입
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    {[
                      { label: '작성한 주석', value: profile.annotationCount, Icon: MessageIcon },
                      { label: '받은 좋아요', value: profile.totalLikes, Icon: HeartIcon },
                    ].map(({ label, value, Icon }) => (
                      <div key={label} className="flex flex-col items-center gap-2 text-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-semibold text-text-muted">{label}</span>
                        <span className="text-lg font-extrabold text-text">{formatCount(value)}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 작성한 주석 + 취향 분석 */}
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <section className="card card--padded bg-white">
                    <h2 className="section-title !text-lg mb-4">작성한 주석</h2>
                    {annotations.length === 0 ? (
                      <EmptyState message="공개된 주석이 없습니다" />
                    ) : (
                      <ul className="grid gap-4">
                        {visibleAnnotations.map((item) => {
                          const { label, tagClass } = getTypeMeta(item.type);
                          return (
                            <li key={item.annotationId}>
                              <Link
                                to={`/annotations/${item.annotationId}`}
                                className="flex items-start gap-3 border-b border-line pb-4 transition hover:opacity-80 last:border-0 last:pb-0"
                              >
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-primary-soft">
                                  {item.book?.coverImageUrl ? (
                                    <img
                                      className="h-full w-full object-cover"
                                      src={item.book.coverImageUrl}
                                      alt={item.book?.title}
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-primary/50">
                                      <BookIcon className="h-6 w-6" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`tag ${tagClass}`}>{label}</span>
                                    <strong className="truncate text-sm font-bold text-text">{item.book?.title}</strong>
                                  </div>
                                  <p className="mt-1.5 truncate text-sm text-text-muted">"{item.passage}"</p>
                                </div>
                                <div className="shrink-0 text-right text-xs text-text-subtle">
                                  <p>{formatRelativeTime(item.createdAt, formatDate)}</p>
                                  <p className="mt-1 font-semibold text-text-muted">♡ {item.likeCount || 0}</p>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    {hasMoreAnnotations && (
                      <button
                        type="button"
                        onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, annotations.length))}
                        className="button button--ghost button--sm mt-4 w-full justify-center"
                      >
                        더보기
                      </button>
                    )}
                  </section>

                  <section className="card card--padded bg-white">
                    <h2 className="section-title !text-lg mb-2">취향 분석</h2>
                    {genreTotal > 0 ? (
                      <>
                        <DonutChart total={genreTotal} segments={genreSummary} />
                        <ul className="mt-4 grid gap-2 text-sm">
                          {genreSummary.map((g) => {
                            const pct = genreTotal > 0 ? Math.round((g.value / genreTotal) * 100) : 0;
                            return (
                              <li key={g.key} className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-text-muted">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                                  {g.label}
                                </span>
                                <span className="font-bold text-text">{g.value} ({pct}%)</span>
                              </li>
                            );
                          })}
                        </ul>
                      </>
                    ) : (
                      <p className="py-10 text-center text-sm text-text-muted">
                        아직 취향을 분석할 주석이 없어요.
                      </p>
                    )}
                  </section>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
