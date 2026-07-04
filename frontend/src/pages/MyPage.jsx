import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout as logoutApi } from '../api/auth';
import {
  updateMe,
  getMyAnnotations,
  getFavoriteBooks,
  getFavoriteAnnotations,
  getMyGroups,
  getMyFriends,
  getFriendRequests,
  searchUsers,
} from '../api/users';
import {
  acceptFriendRequest,
  deleteFriendRelationship,
  sendFriendRequest,
} from '../api/friends';
import { getErrorMessage } from '../utils/error';

// 사이드바 아이콘 (lucide-react 미설치 상태라 최소 인라인 SVG로 대체)
const iconProps = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const HomeIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 9.5 10 3l7 6.5" />
    <path d="M5 8.5V16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.5" />
  </svg>
);

const MessageIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 4h14v9H8l-4 3v-3H3z" />
  </svg>
);

const HeartIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M10 17s-6.5-4.1-8.2-8A4.3 4.3 0 0 1 10 5a4.3 4.3 0 0 1 8.2 4c-1.7 3.9-8.2 8-8.2 8Z" />
  </svg>
);

const BookIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H10v14H4.5A1.5 1.5 0 0 1 3 15.5v-11Z" />
    <path d="M17 4.5A1.5 1.5 0 0 0 15.5 3H10v14h5.5a1.5 1.5 0 0 0 1.5-1.5v-11Z" />
  </svg>
);

const UsersIcon = (props) => (
  <svg {...iconProps} {...props}>
    <circle cx="7" cy="7" r="2.3" />
    <path d="M2.5 16c.5-2.8 2.3-4.3 4.5-4.3s4 1.5 4.5 4.3" />
    <circle cx="14" cy="6.5" r="2" />
    <path d="M12.5 11.9c1.8.2 3.2 1.6 3.6 4.1" />
  </svg>
);

const UserIcon = (props) => (
  <svg {...iconProps} {...props}>
    <circle cx="10" cy="6.5" r="3" />
    <path d="M3.5 17c.8-3.6 3-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
  </svg>
);

const SettingsIcon = (props) => (
  <svg {...iconProps} {...props}>
    <circle cx="10" cy="10" r="2.6" />
    <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.4 4.6l-1.4 1.4M6 12.6l-1.4 1.4M15.4 15.4l-1.4-1.4M6 7.4 4.6 6" />
  </svg>
);

const NAV_ITEMS = [
  { key: 'dashboard', label: '대시보드', Icon: HomeIcon },
  { key: 'annotations', label: '내 주석', Icon: MessageIcon },
  { key: 'favoriteAnnotations', label: '즐겨찾기', Icon: HeartIcon },
  { key: 'favoriteBooks', label: '내 서재', Icon: BookIcon },
  { key: 'groups', label: '그룹 주석방', Icon: UsersIcon },
  { key: 'friends', label: '친구', Icon: UserIcon },
  { key: 'settings', label: '설정', Icon: SettingsIcon },
];

// 공통 EmptyState 컴포넌트
function EmptyState({ message }) {
  return (
    <div className="py-12 text-center card card--padded bg-white/50">
      <p className="text-sm font-semibold text-text-muted">{message}</p>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card card--padded bg-white">
      <p className="text-xs font-bold text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-primary">{value}</p>
    </div>
  );
}

// 주석 카드 스켈레톤
function AnnotationCardSkeleton() {
  return (
    <article className="card annotation-card animate-pulse bg-white">
      <div className="flex items-center gap-3">
        <div className="avatar bg-surfaceMuted" />
        <div className="grid flex-1 gap-2">
          <div className="h-3 w-24 rounded bg-surfaceMuted" />
          <div className="h-3 w-16 rounded bg-surfaceMuted" />
        </div>
      </div>
      <div className="grid gap-3 my-4">
        <div className="h-5 w-full rounded bg-surfaceMuted" />
        <div className="h-5 w-5/6 rounded bg-surfaceMuted" />
      </div>
      <div className="flex justify-between items-center mt-auto">
        <div className="h-6 w-14 rounded-full bg-surfaceMuted" />
        <div className="h-4 w-24 rounded bg-surfaceMuted" />
      </div>
    </article>
  );
}

// 책 카드 스켈레톤
function BookCardSkeleton() {
  return (
    <article className="card book-card animate-pulse bg-white">
      <div className="book-cover bg-surfaceMuted" />
      <div className="flex flex-col gap-2 min-w-0 justify-center">
        <div className="h-4 w-2/3 rounded bg-surfaceMuted" />
        <div className="h-3 w-1/2 rounded bg-surfaceMuted" />
        <div className="mt-2 h-6 w-14 rounded-full bg-surfaceMuted" />
      </div>
    </article>
  );
}

export default function MyPage() {
  const { user, logout: localLogout, setUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, annotations, favoriteAnnotations, favoriteBooks, groups, friends, settings
  const [tabData, setTabData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    annotations: 0,
    favoriteBooks: 0,
    favoriteAnnotations: 0,
    groups: 0,
    friends: 0,
  });
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [tabError, setTabError] = useState('');

  // 설정 탭 — 닉네임 변경 관련 상태
  const [newNickname, setNewNickname] = useState(user?.nickname || '');
  const [isUpdatingNickname, setIsUpdatingNickname] = useState(false);
  const [editError, setEditError] = useState('');

  // 친구 탭 관련 보조 상태 (대기 중인 요청들)
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success'); // success | error
  const [showSearchModal, setShowSearchModal] = useState(false);

  // 토스트 헬퍼
  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // 날짜 포맷팅 함수
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  // 탭 데이터 로딩
  const fetchTabData = async (tabName) => {
    setIsLoadingTab(true);
    setTabError('');
    try {
      if (tabName === 'dashboard') {
        const [annRes, favBooksRes, favAnnRes, groupsRes, friendsRes] = await Promise.all([
          getMyAnnotations(),
          getFavoriteBooks(),
          getFavoriteAnnotations(),
          getMyGroups(),
          getMyFriends(),
        ]);
        setDashboardStats({
          annotations: annRes.pagination?.totalElements ?? (annRes.data || []).length,
          favoriteBooks: favBooksRes.pagination?.totalElements ?? (favBooksRes.data || []).length,
          favoriteAnnotations: favAnnRes.pagination?.totalElements ?? (favAnnRes.data || []).length,
          groups: (Array.isArray(groupsRes) ? groupsRes : groupsRes.data || []).length,
          friends: (friendsRes.data || []).length,
        });
      } else if (tabName === 'annotations') {
        const res = await getMyAnnotations();
        setTabData(res.data || []);
      } else if (tabName === 'favoriteBooks') {
        const res = await getFavoriteBooks();
        setTabData(res.data || []);
      } else if (tabName === 'favoriteAnnotations') {
        const res = await getFavoriteAnnotations();
        setTabData(res.data || []);
      } else if (tabName === 'groups') {
        const res = await getMyGroups();
        // groups는 api-spec상 배열 형태 통째 응답이거나 {data}일 수 있으므로 유연하게 처리
        setTabData(Array.isArray(res) ? res : res.data || []);
      } else if (tabName === 'friends') {
        const [friendsRes, receivedRes, sentRes] = await Promise.all([
          getMyFriends(),
          getFriendRequests('received'),
          getFriendRequests('sent'),
        ]);
        setTabData(friendsRes.data || []);
        setReceivedRequests(receivedRes.data || []);
        setSentRequests(sentRes.data || []);
      }
    } catch (err) {
      console.error(err);
      setTabError('불러오지 못했습니다');
    } finally {
      setIsLoadingTab(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      setNewNickname(user?.nickname || '');
      setEditError('');
      return;
    }
    fetchTabData(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      localLogout();
      navigate('/login');
    }
  };

  // 닉네임 변경 폼 제출 (설정 탭)
  const handleEditNickname = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!newNickname.trim()) {
      setEditError('닉네임을 입력해 주세요.');
      return;
    }
    if (newNickname === user?.nickname) {
      return;
    }

    setIsUpdatingNickname(true);
    try {
      const updatedUser = await updateMe({ nickname: newNickname });
      setUser(updatedUser);
      showToast('닉네임이 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error(err);
      setEditError(getErrorMessage(err));
    } finally {
      setIsUpdatingNickname(false);
    }
  };

  // 친구 검색
  const handleSearchUser = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResults([]);
    if (!searchKeyword.trim()) {
      setSearchError('검색할 닉네임을 입력해 주세요.');
      return;
    }

    setIsSearching(true);
    try {
      const res = await searchUsers(searchKeyword);
      setSearchResults(res.data || []);
      if ((res.data || []).length === 0) {
        setSearchError('일치하는 사용자가 없습니다.');
      }
    } catch (err) {
      console.error(err);
      setSearchError(getErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  };

  // 친구 요청 보내기
  const handleSendRequest = async (friendId, friendNickname) => {
    try {
      await sendFriendRequest(friendId);
      showToast(`${friendNickname}님께 친구 요청을 보냈습니다.`);
      // 보낸 요청 목록 새로고침
      const sentRes = await getFriendRequests('sent');
      setSentRequests(sentRes.data || []);
      // 검색 결과 목록에서 제거하거나 상태 변경 가능하나 간결하게 리셋
      setSearchKeyword('');
      setSearchResults([]);
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  // 친구 요청 수락
  const handleAcceptRequest = async (userId, nickname) => {
    try {
      await acceptFriendRequest(userId);
      showToast(`${nickname}님의 친구 요청을 수락했습니다.`);
      // 친구 목록 및 받은 요청 목록 새로고침
      fetchTabData('friends');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  // 친구 요청 거절 / 보낸 요청 취소 / 친구 삭제
  const handleDeleteRelationship = async (userId, nickname, msgPrefix) => {
    if (!window.confirm(`${nickname}님과의 친구 관계 혹은 요청을 취소하시겠습니까?`)) {
      return;
    }
    try {
      await deleteFriendRelationship(userId);
      showToast(`${nickname}님과의 ${msgPrefix} 완료되었습니다.`);
      fetchTabData('friends');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <main className="page min-h-[calc(100vh-72px)]">
      <div className="container flex flex-col md:flex-row items-start gap-6">
        {/* 좌측 사이드바 */}
        <aside className="w-full md:w-[220px] shrink-0">
          <div className="card card--padded bg-white md:sticky md:top-[88px]">
            <h2 className="text-lg font-bold text-text mb-3">마이페이지</h2>
            <div className="h-px bg-line -mx-6 mb-3" />
            <nav className="grid gap-1">
              {NAV_ITEMS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-semibold text-left transition-colors ${
                    activeTab === key
                      ? 'bg-primary-soft text-primary'
                      : 'text-text-muted hover:bg-pageSoft hover:text-text'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 우측 콘텐츠 */}
        <section className="min-w-0 flex-1 grid gap-6">
          {/* 1. 대시보드 */}
          {activeTab === 'dashboard' && (
            isLoadingTab ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="card card--padded h-24 animate-pulse bg-surfaceMuted" />
                ))}
              </div>
            ) : tabError ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-danger">{tabError}</p>
              </div>
            ) : (
              <>
                <section className="card card--padded flex flex-wrap items-center gap-4 bg-white">
                  <div className="h-16 w-16 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-2xl shadow-soft">
                    {user?.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <h1 className="text-[22px] font-bold text-text leading-none">{user?.nickname}</h1>
                    <p className="mt-1.5 text-sm text-text-muted">{user?.email}</p>
                    {user?.createdAt && (
                      <p className="mt-1 text-xs text-text-subtle">{formatDate(user.createdAt)} 가입</p>
                    )}
                  </div>
                </section>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard label="내 주석" value={dashboardStats.annotations} />
                  <StatCard label="즐겨찾기" value={dashboardStats.favoriteAnnotations} />
                  <StatCard label="내 서재" value={dashboardStats.favoriteBooks} />
                  <StatCard label="그룹 주석방" value={dashboardStats.groups} />
                  <StatCard label="친구" value={dashboardStats.friends} />
                </div>
              </>
            )
          )}

          {/* 2. 내 주석 탭 */}
          {activeTab === 'annotations' && (
            isLoadingTab ? (
              <div className="grid grid--annotations">
                <AnnotationCardSkeleton />
                <AnnotationCardSkeleton />
              </div>
            ) : tabError ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-danger">{tabError}</p>
              </div>
            ) : tabData.length === 0 ? (
              <EmptyState message="작성한 주석이 없습니다" />
            ) : (
              <div className="grid grid--annotations">
                {tabData.map((item) => (
                  <article key={item.annotationId} className="card annotation-card bg-white hover:border-line-strong transition-colors">
                    <header className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-subtle">{formatDate(item.createdAt)}</span>
                      </div>
                      {item.book && (
                        <span className="text-xs font-bold text-primary truncate max-w-[150px]">
                          {item.book.title}
                        </span>
                      )}
                    </header>
                    <p className="annotation-quote line-clamp-3 text-[17px] font-bold text-text my-3">
                      "{item.passage}"
                    </p>
                    <p className="text-sm text-text-muted line-clamp-2 mb-4 leading-relaxed">
                      {item.review}
                    </p>
                    <footer className="card-actions mt-auto border-t border-line pt-3">
                      <div className="flex gap-2">
                        <span className={`tag ${
                          item.type === 'QUESTION' ? 'tag--cream' :
                          item.type === 'DISCUSSION' ? 'tag--green' :
                          item.type === 'REVIEW' ? 'tag--rose' : ''
                        }`}>
                          {item.type === 'QUESTION' ? '질문' :
                           item.type === 'DISCUSSION' ? '토론' :
                           item.type === 'REVIEW' ? '감상' : '일반'}
                        </span>
                        {item.isSpoiler && <span className="tag tag--danger">스포일러</span>}
                      </div>
                      <div className="flex gap-3 text-text-subtle font-medium">
                        <span>♡ {item.likeCount || 0}</span>
                        <span>💬 {item.commentCount || 0}</span>
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            )
          )}

          {/* 3. 즐겨찾기(주석) 탭 */}
          {activeTab === 'favoriteAnnotations' && (
            isLoadingTab ? (
              <div className="grid grid--annotations">
                <AnnotationCardSkeleton />
                <AnnotationCardSkeleton />
              </div>
            ) : tabError ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-danger">{tabError}</p>
              </div>
            ) : tabData.length === 0 ? (
              <EmptyState message="즐겨찾기한 항목이 없습니다" />
            ) : (
              <div className="grid grid--annotations">
                {tabData.map((item) => (
                  <article key={item.annotationId} className="card annotation-card bg-white hover:border-line-strong transition-colors">
                    <header className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-primary-soft flex items-center justify-center text-[10px] font-bold text-primary">
                          {item.author?.nickname?.charAt(0).toUpperCase()}
                        </div>
                        <strong className="text-xs text-text">{item.author?.nickname}</strong>
                      </div>
                      {item.book && (
                        <span className="text-xs font-bold text-primary truncate max-w-[120px]">
                          {item.book.title}
                        </span>
                      )}
                    </header>
                    <p className="annotation-quote line-clamp-3 text-[17px] font-bold text-text my-3">
                      "{item.passage}"
                    </p>
                    <p className="text-sm text-text-muted line-clamp-2 mb-4 leading-relaxed">
                      {item.review}
                    </p>
                    <footer className="card-actions mt-auto border-t border-line pt-3">
                      <div className="flex gap-2">
                        <span className={`tag ${
                          item.type === 'QUESTION' ? 'tag--cream' :
                          item.type === 'DISCUSSION' ? 'tag--green' :
                          item.type === 'REVIEW' ? 'tag--rose' : ''
                        }`}>
                          {item.type === 'QUESTION' ? '질문' :
                           item.type === 'DISCUSSION' ? '토론' :
                           item.type === 'REVIEW' ? '감상' : '일반'}
                        </span>
                      </div>
                      <div className="flex gap-3 text-text-subtle font-medium">
                        <span>♡ {item.likeCount || 0}</span>
                        <span>💬 {item.commentCount || 0}</span>
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            )
          )}

          {/* 4. 내 서재(즐겨찾기 책) 탭 */}
          {activeTab === 'favoriteBooks' && (
            isLoadingTab ? (
              <div className="grid grid--books">
                <BookCardSkeleton />
                <BookCardSkeleton />
                <BookCardSkeleton />
              </div>
            ) : tabError ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-danger">{tabError}</p>
              </div>
            ) : tabData.length === 0 ? (
              <EmptyState message="즐겨찾기한 항목이 없습니다" />
            ) : (
              <div className="grid grid--books">
                {tabData.map((book) => (
                  <Link to={`/books/${book.bookId}`} key={book.bookId} className="card book-card bg-white hover:border-line-strong transition-colors block">
                    <div className="flex gap-4">
                      {book.coverImageUrl ? (
                        <img className="book-cover" src={book.coverImageUrl} alt={book.title} />
                      ) : (
                        <div className="book-cover flex items-center justify-center text-text-subtle font-bold text-xs p-2 text-center">
                          No Cover
                        </div>
                      )}
                      <div className="flex flex-col justify-center min-w-0">
                        <h3 className="truncate text-base font-bold text-text leading-tight">{book.title}</h3>
                        <p className="mt-1 text-xs text-text-muted truncate">{book.author}</p>
                        <div className="mt-3">
                          <span className="tag tag--blue">{book.genreCode}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {/* 5. 그룹 주석방 탭 */}
          {activeTab === 'groups' && (
            isLoadingTab ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card card--padded h-20 animate-pulse bg-surfaceMuted" />
                <div className="card card--padded h-20 animate-pulse bg-surfaceMuted" />
              </div>
            ) : tabError ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-danger">{tabError}</p>
              </div>
            ) : tabData.length === 0 ? (
              <EmptyState message="참여 중인 그룹이 없습니다" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tabData.map((group) => (
                  <Link to={`/groups/${group.groupId}`} key={group.groupId} className="card card--padded bg-white hover:border-line-strong transition-colors block">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-base font-bold text-text">{group.groupName}</h3>
                        <p className="text-xs text-text-muted mt-1.5">
                          방장: {group.owner?.nickname || '알 수 없음'}
                        </p>
                      </div>
                      {group.createdAt && (
                        <span className="text-xs text-text-subtle">{formatDate(group.createdAt)} 생성</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}

          {/* 6. 친구 탭 */}
          {activeTab === 'friends' && (
            <div className="grid gap-6">
              {/* 친구 요청 관리 섹션 */}
              <section className="grid md:grid-cols-2 gap-4">
                {/* 받은 요청 */}
                <div className="card card--padded bg-white">
                  <h3 className="text-sm font-bold text-text mb-3">받은 친구 요청</h3>
                  {receivedRequests.length === 0 ? (
                    <p className="text-xs text-text-muted py-4">대기 중인 요청이 없습니다</p>
                  ) : (
                    <ul className="grid gap-2">
                      {receivedRequests.map((req) => (
                        <li key={req.userId} className="flex justify-between items-center p-2 rounded bg-pageSoft border border-line">
                          <span className="text-sm font-semibold text-text">{req.nickname}</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleAcceptRequest(req.userId, req.nickname)}
                              className="button button--primary button--sm !min-h-8"
                            >
                              수락
                            </button>
                            <button
                              onClick={() => handleDeleteRelationship(req.userId, req.nickname, '요청 거절이')}
                              className="button button--secondary button--sm !min-h-8 text-danger hover:bg-danger-soft hover:border-danger/30"
                            >
                              거절
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 보낸 요청 */}
                <div className="card card--padded bg-white">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-text">보낸 친구 요청</h3>
                    <button
                      onClick={() => {
                        setSearchKeyword('');
                        setSearchResults([]);
                        setSearchError('');
                        setShowSearchModal(true);
                      }}
                      className="button button--primary button--sm !min-h-8"
                    >
                      친구 요청 보내기
                    </button>
                  </div>
                  {sentRequests.length === 0 ? (
                    <p className="text-xs text-text-muted py-4">대기 중인 요청이 없습니다</p>
                  ) : (
                    <ul className="grid gap-2">
                      {sentRequests.map((req) => (
                        <li key={req.userId} className="flex justify-between items-center p-2 rounded bg-pageSoft border border-line">
                          <span className="text-sm font-semibold text-text">{req.nickname}</span>
                          <button
                            onClick={() => handleDeleteRelationship(req.userId, req.nickname, '요청 취소가')}
                            className="button button--secondary button--sm !min-h-8"
                          >
                            취소
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              {/* 친구 목록 */}
              <div className="card card--padded bg-white">
                <h3 className="text-sm font-bold text-text mb-4">친구 목록 ({tabData.length})</h3>
                {tabData.length === 0 ? (
                  <p className="text-xs text-text-muted py-4">아직 친구가 없습니다</p>
                ) : (
                  <ul className="grid gap-2">
                    {tabData.map((friend) => (
                      <li key={friend.id} className="flex justify-between items-center p-3 rounded-sm border border-line bg-pageSoft/50 hover:bg-pageSoft transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary-soft flex items-center justify-center text-xs font-bold text-primary">
                            {friend.nickname?.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-text">{friend.nickname}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteRelationship(friend.id, friend.nickname, '친구 삭제가')}
                          className="button button--secondary button--sm text-danger hover:bg-danger-soft hover:border-danger/30"
                        >
                          친구 삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* 7. 설정 탭 */}
          {activeTab === 'settings' && (
            <div className="grid gap-6 max-w-[480px]">
              <section className="card card--padded bg-white">
                <h3 className="text-sm font-bold text-text mb-4">닉네임 변경</h3>
                <form onSubmit={handleEditNickname} className="grid gap-3">
                  <label className="form-field">
                    <span className="form-label">닉네임</span>
                    <input
                      className="input"
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      disabled={isUpdatingNickname}
                    />
                  </label>
                  {editError && <p className="form-error">{editError}</p>}
                  <button type="submit" className="button button--primary" disabled={isUpdatingNickname}>
                    {isUpdatingNickname ? '저장 중...' : '저장'}
                  </button>
                </form>
              </section>

              <section className="card card--padded bg-white">
                <h3 className="text-sm font-bold text-text mb-3">계정</h3>
                <button
                  onClick={handleLogout}
                  className="button button--secondary text-danger hover:border-danger/30 hover:bg-danger-soft"
                >
                  로그아웃
                </button>
              </section>
            </div>
          )}
        </section>
      </div>

      {/* 친구 찾기 모달 */}
      {showSearchModal && (
        <div className="modal-overlay">
          <section className="modal card card--padded">
            <h2 className="section-title mb-4">친구 요청 보내기</h2>
            <form onSubmit={handleSearchUser} className="flex gap-2">
              <input
                className="input !h-9 flex-1"
                type="text"
                placeholder="닉네임 입력"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="button button--primary button--sm" disabled={isSearching}>
                {isSearching ? '검색...' : '검색'}
              </button>
            </form>

            {searchError && <p className="text-xs text-danger mt-2">{searchError}</p>}

            {searchResults.length > 0 && (
              <ul className="grid gap-2 mt-4 max-h-[200px] overflow-y-auto border-t border-line pt-4">
                {searchResults.map((result) => {
                  if (result.id === user?.id) return null;
                  const isFriend = tabData.some((f) => f.id === result.id);
                  const isSent = sentRequests.some((r) => r.userId === result.id);
                  const isReceived = receivedRequests.some((r) => r.userId === result.id);

                  return (
                    <li key={result.id} className="flex justify-between items-center p-2 rounded bg-pageSoft">
                      <span className="text-xs font-semibold text-text truncate max-w-[150px]">{result.nickname}</span>
                      {isFriend ? (
                        <span className="text-[11px] text-text-subtle font-bold">친구 상태</span>
                      ) : isSent ? (
                        <span className="text-[11px] text-text-subtle font-bold">요청 보냄</span>
                      ) : isReceived ? (
                        <span className="text-[11px] text-primary font-bold">요청 받음</span>
                      ) : (
                        <button
                          onClick={() => {
                            handleSendRequest(result.id, result.nickname);
                          }}
                          className="button button--primary button--sm !min-h-7 !px-2.5 text-xs"
                        >
                          친구요청
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="button button--secondary"
              >
                닫기
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 성공/실패 토스트 */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-sm px-4 py-3 text-sm font-semibold shadow-card transition-all duration-300 ${
          toastType === 'error'
            ? 'bg-danger-soft text-danger'
            : 'bg-white text-primary border border-line'
        }`}>
          {toastMessage}
        </div>
      )}
    </main>
  );
}
