import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout as logoutApi } from '../api/auth';
import SiteHeader from '../components/SiteHeader';
import {
  updateMe,
  getMyAnnotations,
  getFavoriteBooks,
  getFavoriteAnnotations,
  getMyGroups,
  getGroupInvitations,
  getMyFriends,
  getFriendRequests,
  searchUsers,
} from '../api/users';
import {
  acceptFriendRequest,
  deleteFriendRelationship,
  sendFriendRequest,
} from '../api/friends';
import { unfavoriteBook } from '../api/books';
import { deleteAnnotation } from '../api/annotations';
import { acceptGroupInvitation, createGroup, removeGroupMember } from '../api/groups';
import { getErrorMessage } from '../utils/error';
import { getBookCardCategory } from '../utils/bookCategory';
import {
  HomeIcon,
  MessageIcon,
  HeartIcon,
  BookIcon,
  UsersIcon,
  UserIcon,
  SettingsIcon,
  BookmarkIcon,
  CalendarIcon,
  MailIcon,
  CameraIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
} from '../components/icons';
import DonutChart from '../components/DonutChart';
import { buildGenreSummary } from '../utils/genre';
import { getTypeMeta, formatCount, formatRelativeTime } from '../utils/format';

const NAV_ITEMS = [
  { key: 'dashboard', label: '대시보드', Icon: HomeIcon },
  { key: 'annotations', label: '내 주석', Icon: MessageIcon },
  { key: 'favoriteAnnotations', label: '즐겨찾기한 주석', Icon: HeartIcon },
  { key: 'favoriteBooks', label: '내 서재', Icon: BookIcon },
  { key: 'groups', label: '그룹 라운지', Icon: UsersIcon },
  { key: 'friends', label: '친구', Icon: UserIcon },
  { key: 'settings', label: '설정', Icon: SettingsIcon },
];

// 선택 가능한 프로필 아이콘 프리셋 — 사용자가 이미지를 업로드하는 대신 이 중 하나를 고른다.
// 다른 화면(헤더, 그룹 멤버 목록 등)에 실제로 노출하는 작업은 아직 하지 않는다(팀원 작업과의 충돌 방지를 위해
// 선택/저장 기능만 먼저 구현 — design.md 참고).
const AVATAR_ICON_OPTIONS = [
  { key: 'reader', emoji: '📖', bg: 'bg-accent-blue' },
  { key: 'cat', emoji: '🐱', bg: 'bg-accent-rose' },
  { key: 'fox', emoji: '🦊', bg: 'bg-accent-cream' },
  { key: 'bear', emoji: '🐻', bg: 'bg-accent-green' },
  { key: 'rabbit', emoji: '🐰', bg: 'bg-primary-soft' },
  { key: 'owl', emoji: '🦉', bg: 'bg-accent-cream' },
  { key: 'star', emoji: '⭐', bg: 'bg-accent-blue' },
  { key: 'plant', emoji: '🌿', bg: 'bg-accent-green' },
  { key: 'coffee', emoji: '☕', bg: 'bg-accent-rose' },
  { key: 'moon', emoji: '🌙', bg: 'bg-primary-soft' },
];

// 공통 EmptyState 컴포넌트
function EmptyState({ message }) {
  return (
    <div className="py-12 text-center card card--padded bg-white/50">
      <p className="text-sm font-semibold text-text-muted">{message}</p>
    </div>
  );
}

// 주석 한 줄 카드 — 왼쪽에 책 표지/제목/저자, 오른쪽에 주석 본문 (내 주석 / 즐겨찾기한 주석 공용)
// onEdit/onDelete가 주어지면(= 내가 쓴 주석) 카드 우상단에 수정/삭제 아이콘 버튼을 노출한다.
function AnnotationRow({ item, meta, onEdit, onDelete }) {
  const { label, tagClass } = getTypeMeta(item.type);

  return (
    <article className="card card--padded flex gap-5 bg-white transition hover:-translate-y-1 hover:shadow-card">
      <Link to={`/books/${item.book?.bookId}`} className="w-[88px] shrink-0 text-center">
        {item.book?.coverImageUrl ? (
          <img className="book-cover w-[88px] mx-auto" src={item.book.coverImageUrl} alt={item.book?.title} />
        ) : (
          <div className="book-cover w-[88px] mx-auto flex items-center justify-center p-1 text-center text-[10px] font-bold text-text-subtle">
            No Cover
          </div>
        )}
        <p className="mt-2 truncate text-xs font-bold text-text">{item.book?.title}</p>
        <p className="truncate text-[11px] text-text-muted">{item.book?.author}</p>
      </Link>

      <div className="min-w-0 flex-1 flex flex-col">
        {(meta || onEdit || onDelete) && (
        <header className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">{meta}</div>
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 shrink-0">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-text transition hover:border-primary"
                  aria-label="주석 수정"
                  title="수정"
                >
                  <EditIcon className="h-5 w-5" strokeWidth={2.2} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-danger transition hover:border-danger"
                  aria-label="주석 삭제"
                  title="삭제"
                >
                  <TrashIcon className="h-5 w-5" strokeWidth={2.2} />
                </button>
              )}
            </div>
          )}
        </header>
        )}
        <Link to={`/annotations/${item.annotationId}`} className="block transition hover:opacity-80">
          <p className={`annotation-quote line-clamp-2 text-[17px] font-bold text-text mb-3 ${(meta || onEdit || onDelete) ? 'mt-3' : 'mt-0'}`}>
            "{item.passage}"
          </p>
          <p className="text-sm text-text-muted line-clamp-2 mb-4 leading-relaxed">
            {item.review}
          </p>
        </Link>
        <footer className="card-actions mt-auto border-t border-line pt-3">
          <div className="flex gap-2">
            <span className={`tag ${tagClass}`}>{label}</span>
            {item.isSpoiler && <span className="tag tag--danger">스포일러</span>}
          </div>
          <div className="flex gap-3 text-text-subtle font-medium">
            <span>♡ {item.likeCount || 0}</span>
            <span>💬 {item.commentCount || 0}</span>
          </div>
        </footer>
      </div>
    </article>
  );
}

// 주석 한 줄 카드 스켈레톤
function AnnotationRowSkeleton() {
  return (
    <article className="card card--padded flex gap-5 bg-white animate-pulse">
      <div className="w-[88px] shrink-0">
        <div className="book-cover w-[88px] mx-auto bg-surfaceMuted" />
      </div>
      <div className="grid flex-1 gap-3">
        <div className="h-3 w-24 rounded bg-surfaceMuted" />
        <div className="h-5 w-full rounded bg-surfaceMuted" />
        <div className="h-5 w-5/6 rounded bg-surfaceMuted" />
        <div className="mt-auto h-6 w-14 rounded-full bg-surfaceMuted" />
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
  const [groupInvitations, setGroupInvitations] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    annotations: 0,
    favoriteBooks: 0,
    favoriteAnnotations: 0,
    groups: 0,
    friends: 0,
    totalLikes: 0,
    genreSummary: [],
    genreTotal: 0,
    recentAnnotations: [],
    recentGroups: [],
    recentQuotes: [],
  });
  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [tabError, setTabError] = useState('');

  // 설정 탭 — 프로필(닉네임/소개글/아바타 아이콘) 변경 관련 상태
  const [newNickname, setNewNickname] = useState(user?.nickname || '');
  const [newBio, setNewBio] = useState(user?.bio || '');
  // 선택 가능한 프로필 아이콘 프리셋 중 고른 것 — 아직 다른 화면에는 표시하지 않고 저장만 한다.
  const [newAvatarIcon, setNewAvatarIcon] = useState(user?.avatarIcon || '');
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

  // 그룹 라운지 생성 모달 상태
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [createGroupError, setCreateGroupError] = useState('');

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

  // 탭을 빠르게 전환할 때 이전 탭의 응답이 늦게 도착해 최신 탭 데이터를 덮어쓰는 것을 막기 위한 요청 ID
  const latestRequestIdRef = useRef(0);

  // 탭 데이터 로딩
  const fetchTabData = async (tabName) => {
    const requestId = ++latestRequestIdRef.current;
    const isStale = () => requestId !== latestRequestIdRef.current;

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
        if (isStale()) return;

        const myAnnotations = annRes.data || [];
        const favoriteBookList = favBooksRes.data || [];
        const groupList = Array.isArray(groupsRes) ? groupsRes : groupsRes.data || [];

        // "나의 취향 분석": 내가 작성한 주석이 달린 책의 중분류 장르 분포.
        // 같은 책에 주석을 여러 개 남기면 그 주석 수만큼 같은 장르가 누적된다.
        const { summary: genreSummary, total: genreTotal } = buildGenreSummary(
          myAnnotations.map((annotation) => annotation.book?.genreCode),
        );

        let totalLikes = 0;
        myAnnotations.forEach((a) => {
          totalLikes += a.likeCount || 0;
        });

        const recentAnnotations = [...myAnnotations]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);

        const recentGroups = [...groupList]
          .sort((a, b) => new Date(b.lastActivityAt || b.createdAt) - new Date(a.lastActivityAt || a.createdAt))
          .slice(0, 3);

        setDashboardStats({
          annotations: annRes.pagination?.totalElements ?? myAnnotations.length,
          favoriteBooks: favBooksRes.pagination?.totalElements ?? (favBooksRes.data || []).length,
          favoriteAnnotations: favAnnRes.pagination?.totalElements ?? (favAnnRes.data || []).length,
          groups: groupList.length,
          friends: (friendsRes.data || []).length,
          totalLikes,
          genreSummary,
          genreTotal,
          recentAnnotations,
          recentGroups,
          recentQuotes: (favAnnRes.data || []).slice(0, 2),
        });
      } else if (tabName === 'annotations') {
        const res = await getMyAnnotations();
        if (isStale()) return;
        setTabData(res.data || []);
      } else if (tabName === 'favoriteBooks') {
        const res = await getFavoriteBooks();
        if (isStale()) return;
        setTabData(res.data || []);
      } else if (tabName === 'favoriteAnnotations') {
        const res = await getFavoriteAnnotations();
        if (isStale()) return;
        setTabData(res.data || []);
      } else if (tabName === 'groups') {
        const [res, invitationsRes] = await Promise.all([getMyGroups(), getGroupInvitations()]);
        if (isStale()) return;
        // groups는 api-spec상 배열 형태 통째 응답이거나 {data}일 수 있으므로 유연하게 처리
        setTabData(Array.isArray(res) ? res : res.data || []);
        setGroupInvitations(Array.isArray(invitationsRes) ? invitationsRes : invitationsRes.data || []);
      } else if (tabName === 'friends') {
        const [friendsRes, receivedRes, sentRes] = await Promise.all([
          getMyFriends(),
          getFriendRequests('received'),
          getFriendRequests('sent'),
        ]);
        if (isStale()) return;
        setTabData(friendsRes.data || []);
        setReceivedRequests(receivedRes.data || []);
        setSentRequests(sentRes.data || []);
      }
    } catch (err) {
      if (isStale()) return;
      console.error(err);
      setTabError('불러오지 못했습니다');
    } finally {
      if (!isStale()) {
        setIsLoadingTab(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      latestRequestIdRef.current += 1; // 진행 중이던 목록 탭 요청 결과를 무효화
      setNewNickname(user?.nickname || '');
      setNewBio(user?.bio || '');
      setNewAvatarIcon(user?.avatarIcon || '');
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

  // 프로필(닉네임/소개/아바타) 변경 폼 제출 (설정 탭)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!newNickname.trim()) {
      setEditError('닉네임을 입력해 주세요.');
      return;
    }

    setIsUpdatingNickname(true);
    try {
      const updatedUser = await updateMe({
        nickname: newNickname,
        bio: newBio,
        avatarIcon: newAvatarIcon,
      });
      setUser(updatedUser);
      showToast('프로필이 성공적으로 변경되었습니다.');
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

  // 내 서재 — 북마크(즐겨찾기) 해제
  const handleUnfavoriteBook = async (bookId, title) => {
    try {
      await unfavoriteBook(bookId);
      setTabData((prev) => prev.filter((book) => book.bookId !== bookId));
      showToast(`${title} 즐겨찾기를 해제했습니다.`);
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  // 내 주석 수정 — /annotations/{id}/edit 페이지로 이동
  const handleEditAnnotation = (item) => {
    navigate(`/annotations/${item.annotationId}/edit`);
  };

  // 내 주석 삭제
  const handleDeleteAnnotation = async (item) => {
    if (!window.confirm('이 주석을 삭제하시겠습니까? 삭제한 주석은 복구할 수 없습니다.')) {
      return;
    }
    try {
      await deleteAnnotation(item.annotationId);
      setTabData((prev) => prev.filter((a) => a.annotationId !== item.annotationId));
      showToast('주석을 삭제했습니다.');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  // 그룹 라운지 생성
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreateGroupError('');
    if (!newGroupName.trim()) {
      setCreateGroupError('그룹 이름을 입력해 주세요.');
      return;
    }

    setIsCreatingGroup(true);
    try {
      await createGroup({ groupName: newGroupName.trim() });
      setShowCreateGroupModal(false);
      setNewGroupName('');
      showToast('그룹 라운지가 생성되었습니다.');
      fetchTabData('groups');
    } catch (err) {
      console.error(err);
      setCreateGroupError(getErrorMessage(err));
    } finally {
      setIsCreatingGroup(false);
    }
  };

  // 받은 그룹 초대 수락
  const handleAcceptGroupInvitation = async (invitation) => {
    try {
      await acceptGroupInvitation(invitation.groupId, user.id);
      setGroupInvitations((prev) => prev.filter((item) => item.groupId !== invitation.groupId));
      showToast(`${invitation.groupName}에 가입했습니다.`);
      fetchTabData('groups');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  // 받은 그룹 초대 거절
  const handleRejectGroupInvitation = async (invitation) => {
    try {
      await removeGroupMember(invitation.groupId, user.id);
      setGroupInvitations((prev) => prev.filter((item) => item.groupId !== invitation.groupId));
      showToast(`${invitation.groupName} 초대를 거절했습니다.`);
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  // 사이드바 탭 전환: activeTab과 함께 tabData/isLoadingTab을 같은 이벤트에서 초기화해
  // "새 탭인데 이전 탭의 데이터가 그대로 렌더링되는" 프레임이 생기지 않도록 한다.
  const handleTabClick = (key) => {
    if (key === activeTab) return;
    setActiveTab(key);
    if (key !== 'settings') {
      latestRequestIdRef.current += 1; // 진행 중이던 이전 탭 요청은 무효화
      setTabData([]);
      setTabError('');
      setIsLoadingTab(true);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="mypage" />

      <main className="page flex-1">
      <div className="container flex flex-col md:flex-row items-start gap-6">
        {/* 좌측 사이드바 */}
        <aside className="w-full md:w-[220px] shrink-0">
          <div className="card card--padded bg-white md:sticky md:top-[88px]">
            <h2 className="section-title mb-3">마이페이지</h2>
            <div className="h-px bg-line -mx-6 mb-3" />
            <nav className="grid gap-1">
              {NAV_ITEMS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => handleTabClick(key)}
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
              <div className="grid gap-6">
                <div className="card card--padded h-[140px] animate-pulse bg-surfaceMuted" />
                <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <div className="card card--padded h-[280px] animate-pulse bg-surfaceMuted" />
                  <div className="card card--padded h-[280px] animate-pulse bg-surfaceMuted" />
                </div>
              </div>
            ) : tabError ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-danger">{tabError}</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {/* 프로필 요약 + 통계 */}
                <section className="card card--padded flex flex-wrap items-center justify-between gap-6 bg-white">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.nickname}
                          className="h-16 w-16 rounded-full object-cover shadow-soft"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-primary-soft flex items-center justify-center text-primary font-bold text-2xl shadow-soft">
                          {user?.nickname ? user.nickname.charAt(0).toUpperCase() : 'U'}
                        </div>
                      )}
                      <button
                        onClick={() => handleTabClick('settings')}
                        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-text-muted shadow-soft hover:text-primary"
                        aria-label="프로필 사진 변경"
                        title="프로필 사진 변경"
                      >
                        <CameraIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h1 className="text-[22px] font-bold text-text leading-none">{user?.nickname}</h1>
                        <button
                          onClick={() => handleTabClick('settings')}
                          className="button button--secondary button--sm !min-h-7 !px-2.5 text-xs"
                        >
                          편집
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-text-muted">{user?.bio || '아직 소개글이 없습니다.'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-text-subtle">
                        {user?.createdAt && (
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon className="h-3.5 w-3.5" /> {formatDate(user.createdAt)} 가입
                          </span>
                        )}
                        {user?.email && (
                          <span className="flex items-center gap-1.5">
                            <MailIcon className="h-3.5 w-3.5" /> {user.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    {[
                      { label: '작성한 주석', value: dashboardStats.annotations, Icon: MessageIcon, tab: 'annotations' },
                      { label: '좋아요 받은 주석', value: dashboardStats.totalLikes, Icon: HeartIcon, tab: 'annotations' },
                      { label: '즐겨찾기한 문장', value: dashboardStats.favoriteAnnotations, Icon: BookmarkIcon, tab: 'favoriteAnnotations' },
                      { label: '친구', value: dashboardStats.friends, Icon: UsersIcon, tab: 'friends' },
                    ].map(({ label, value, Icon, tab }) => (
                      <button
                        key={label}
                        onClick={() => handleTabClick(tab)}
                        className="flex flex-col items-center gap-2 text-center"
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="text-xs font-semibold text-text-muted">{label}</span>
                        <span className="text-lg font-extrabold text-text">{formatCount(value)}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* 최근 활동 + 나의 취향 분석 */}
                <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                  <section className="card card--padded bg-white">
                    <h2 className="section-title !text-lg mb-4">최근 활동</h2>
                    {dashboardStats.recentAnnotations.length === 0 ? (
                      <EmptyState message="작성한 주석이 없습니다" />
                    ) : (
                      <ul className="grid gap-4">
                        {dashboardStats.recentAnnotations.map((item) => {
                          const { label, tagClass } = getTypeMeta(item.type);
                          return (
                            <li
                              key={item.annotationId}
                              className="flex items-start gap-3 border-b border-line pb-4 last:border-0 last:pb-0"
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
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    <button
                      onClick={() => handleTabClick('annotations')}
                      className="button button--ghost button--sm mt-4 w-full justify-center"
                    >
                      내 주석 전체 보기 ›
                    </button>
                  </section>

                  <section className="card card--padded bg-white">
                    <div className="mb-2 flex items-center justify-between">
                      <h2 className="section-title !text-lg">나의 취향 분석</h2>
                      <button
                        onClick={() => handleTabClick('annotations')}
                        className="text-xs font-bold text-text-muted hover:text-primary"
                      >
                        더보기 ›
                      </button>
                    </div>
                    {dashboardStats.genreTotal > 0 ? (
                      <>
                        <DonutChart total={dashboardStats.genreTotal} segments={dashboardStats.genreSummary} />
                        <ul className="mt-4 grid gap-2 text-sm">
                          {dashboardStats.genreSummary.map((g) => {
                            const pct = dashboardStats.genreTotal > 0
                              ? Math.round((g.value / dashboardStats.genreTotal) * 100)
                              : 0;
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
                        주석을 작성하면 해당 책의 장르로 취향을 분석해 드려요.
                      </p>
                    )}
                  </section>
                </div>

                {/* 참여 중인 그룹 라운지 + 즐겨찾기한 문장 */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <section className="card card--padded bg-white">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="section-title !text-lg">참여 중인 그룹 라운지</h2>
                      <button
                        onClick={() => handleTabClick('groups')}
                        className="text-xs font-bold text-text-muted hover:text-primary"
                      >
                        더보기 ›
                      </button>
                    </div>
                    {dashboardStats.recentGroups.length === 0 ? (
                      <EmptyState message="참여 중인 그룹이 없습니다" />
                    ) : (
                      <ul className="grid gap-3">
                        {dashboardStats.recentGroups.map((group) => (
                          <li key={group.groupId}>
                            <Link
                              to={`/groups/${group.groupId}`}
                              className="-m-2 flex items-center gap-3 rounded-sm p-2 transition hover:bg-pageSoft"
                            >
                              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-primary-soft">
                                {group.coverImageUrl ? (
                                  <img
                                    className="h-full w-full object-cover"
                                    src={group.coverImageUrl}
                                    alt={group.groupName}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-primary/50">
                                    <UsersIcon className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-text">{group.groupName}</p>
                                <p className="truncate text-xs text-text-muted">
                                  멤버 {group.memberCount ?? 0}명 · 최근 활동{' '}
                                  {formatRelativeTime(group.lastActivityAt || group.createdAt, formatDate)}
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section className="card card--padded bg-white">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="section-title !text-lg">즐겨찾기한 문장</h2>
                      <button
                        onClick={() => handleTabClick('favoriteAnnotations')}
                        className="text-xs font-bold text-text-muted hover:text-primary"
                      >
                        더보기 ›
                      </button>
                    </div>
                    {dashboardStats.recentQuotes.length === 0 ? (
                      <EmptyState message="즐겨찾기한 주석이 없습니다" />
                    ) : (
                      <ul className="grid gap-4">
                        {dashboardStats.recentQuotes.map((item) => (
                          <li
                            key={item.annotationId}
                            className="flex items-start justify-between gap-3 border-b border-line pb-4 last:border-0 last:pb-0"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-text">
                                <span className="mr-1 text-lg font-bold text-primary-soft">"</span>
                                {item.passage}
                              </p>
                              <p className="mt-1.5 truncate text-xs text-text-muted">
                                {item.book?.title} · {item.book?.author}
                              </p>
                            </div>
                            <BookmarkIcon
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              className="h-4 w-4 shrink-0 text-text-subtle"
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </div>
            )
          )}

          {/* 2. 내 주석 탭 */}
          {activeTab === 'annotations' && (
            isLoadingTab ? (
              <div className="grid gap-4">
                <AnnotationRowSkeleton />
                <AnnotationRowSkeleton />
              </div>
            ) : tabError ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-danger">{tabError}</p>
              </div>
            ) : tabData.length === 0 ? (
              <EmptyState message="작성한 주석이 없습니다" />
            ) : (
              <div className="grid gap-4">
                {tabData.map((item) => (
                  <AnnotationRow
                    key={item.annotationId}
                    item={item}
                    meta={<span className="text-xs text-text-subtle">{formatDate(item.createdAt)}</span>}
                    onEdit={handleEditAnnotation}
                    onDelete={handleDeleteAnnotation}
                  />
                ))}
              </div>
            )
          )}

          {/* 3. 즐겨찾기한 주석 탭 */}
          {activeTab === 'favoriteAnnotations' && (
            isLoadingTab ? (
              <div className="grid gap-4">
                <AnnotationRowSkeleton />
                <AnnotationRowSkeleton />
              </div>
            ) : tabError ? (
              <div className="py-12 text-center">
                <p className="text-sm font-semibold text-danger">{tabError}</p>
              </div>
            ) : tabData.length === 0 ? (
              <EmptyState message="즐겨찾기한 주석이 없습니다" />
            ) : (
              <div className="grid gap-4">
                {tabData.map((item) => (
                  <AnnotationRow
                    key={item.annotationId}
                    item={item}
                    meta={
                      <>
                        <div className="h-6 w-6 rounded-full bg-primary-soft flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {item.author?.nickname?.charAt(0).toUpperCase()}
                        </div>
                        <strong className="min-w-0 truncate text-xs text-text">{item.author?.nickname}</strong>
                      </>
                    }
                  />
                ))}
              </div>
            )
          )}

          {/* 4. 내 서재(즐겨찾기 책) 탭 */}
          {activeTab === 'favoriteBooks' && (
            isLoadingTab ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {tabData.map((book) => (
                  <Link to={`/books/${book.bookId}`} key={book.bookId} className="block">
                    <article className="card book-card bg-white transition hover:-translate-y-1 hover:shadow-card">
                      <div className="relative">
                        {book.coverImageUrl ? (
                          <img className="book-cover" src={book.coverImageUrl} alt={book.title} />
                        ) : (
                          <div className="book-cover flex items-center justify-center text-center text-xs font-bold text-text-subtle p-2">
                            No Cover
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUnfavoriteBook(book.bookId, book.title);
                          }}
                          className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-danger text-white shadow-soft transition hover:scale-105"
                          aria-label="즐겨찾기 해제"
                          title="즐겨찾기 해제"
                        >
                          <BookmarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="min-w-0 flex h-full flex-col justify-center">
                        <h3 className="truncate text-base font-bold text-text leading-tight">{book.title}</h3>
                        <p className="mt-1 text-xs text-text-muted truncate">{book.author}</p>
                        <div className="mt-3">
                          <span className="tag tag--blue max-w-full truncate">{getBookCardCategory(book.genreCode)}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )
          )}

          {/* 5. 그룹 라운지 탭 */}
          {activeTab === 'groups' && (
            <div className="grid gap-4">
              <div className="card card--padded bg-white flex items-center justify-between gap-4">
                <p className="text-sm font-bold text-text">함께 읽을 사람들을 모아 새 그룹 라운지를 만들어 보세요.</p>
                <button
                  type="button"
                  onClick={() => setShowCreateGroupModal(true)}
                  className="button button--primary button--lg shrink-0"
                >
                  <PlusIcon className="h-5 w-5" />
                  라운지 만들기
                </button>
              </div>

              {groupInvitations.length > 0 && (
                <div className="card card--padded bg-white">
                  <h3 className="text-sm font-bold text-text mb-3">받은 그룹 초대 ({groupInvitations.length})</h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {groupInvitations.map((invitation) => (
                      <li key={invitation.groupId} className="flex items-center justify-between gap-3 rounded bg-pageSoft p-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-text">{invitation.groupName}</p>
                          <p className="truncate text-xs text-text-muted">
                            방장: {invitation.owner?.nickname || '알 수 없음'}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAcceptGroupInvitation(invitation)}
                            className="button button--primary button--sm !min-h-8"
                          >
                            수락
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectGroupInvitation(invitation)}
                            className="button button--secondary button--sm !min-h-8"
                          >
                            거절
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isLoadingTab ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card card--padded h-[168px] animate-pulse bg-surfaceMuted" />
                <div className="card card--padded h-[168px] animate-pulse bg-surfaceMuted" />
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
                  <Link
                    to={`/groups/${group.groupId}`}
                    key={group.groupId}
                    className="card card--padded min-h-[168px] flex flex-col justify-between bg-white block transition hover:-translate-y-1 hover:shadow-card"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-text">{group.groupName}</h3>
                      <p className="text-xs text-text-muted mt-1.5">
                        방장: {group.owner?.nickname || '알 수 없음'}
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-5 border-t border-line pt-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <UsersIcon className="h-4 w-4" /> 멤버 {group.memberCount ?? 0}명
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookIcon className="h-4 w-4" /> 책 {group.bookCount ?? 0}권
                      </span>
                    </div>
                    {group.createdAt && (
                      <p className="mt-3 text-xs text-text-subtle">{formatDate(group.createdAt)} 생성</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
            </div>
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
                      친구 찾기
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
                          {friend.userId ? (
                            <Link to={`/users/${friend.userId}`} className="text-sm font-semibold text-text transition hover:text-primary">
                              {friend.nickname}
                            </Link>
                          ) : (
                            <span className="text-sm font-semibold text-text">{friend.nickname}</span>
                          )}
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
                <h3 className="text-sm font-bold text-text mb-4">프로필 편집</h3>
                <form onSubmit={handleSaveProfile} className="grid gap-3">
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
                  <label className="form-field">
                    <span className="form-label">소개글</span>
                    <textarea
                      className="textarea"
                      rows={3}
                      placeholder="나를 소개하는 한마디를 남겨보세요."
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      disabled={isUpdatingNickname}
                    />
                  </label>
                  <div className="form-field">
                    <span className="form-label">프로필 아이콘</span>
                    <div className="grid grid-cols-5 gap-2">
                      {AVATAR_ICON_OPTIONS.map((icon) => {
                        const isSelected = newAvatarIcon === icon.key;
                        return (
                          <button
                            key={icon.key}
                            type="button"
                            onClick={() => setNewAvatarIcon(isSelected ? '' : icon.key)}
                            disabled={isUpdatingNickname}
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-xl transition ${icon.bg} ${
                              isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:opacity-80'
                            }`}
                            aria-label={`아이콘 ${icon.key} 선택`}
                            aria-pressed={isSelected}
                            title={icon.key}
                          >
                            {icon.emoji}
                          </button>
                        );
                      })}
                    </div>
                    <span className="form-help">
                      선택한 아이콘은 지금은 저장만 되고, 다른 화면에는 아직 표시되지 않습니다(추후 적용 예정).
                    </span>
                  </div>
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
            <h2 className="section-title mb-4">친구 찾기</h2>
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

      {/* 라운지 만들기 모달 */}
      {showCreateGroupModal && (
        <div className="modal-overlay">
          <section className="modal card card--padded">
            <h2 className="section-title mb-4">라운지 만들기</h2>
            <form onSubmit={handleCreateGroup} className="grid gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-text-muted">그룹 이름</label>
                <input
                  className="input"
                  type="text"
                  placeholder="예: 데미안 같이 읽기"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  autoFocus
                />
              </div>
              <p className="text-xs text-text-subtle">
                멤버 초대와 책 추가는 라운지를 만든 뒤 라운지 페이지에서 진행할 수 있습니다.
              </p>

              {createGroupError && <p className="text-xs text-danger">{createGroupError}</p>}

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateGroupModal(false);
                    setNewGroupName('');
                    setCreateGroupError('');
                  }}
                  className="button button--secondary"
                >
                  취소
                </button>
                <button type="submit" className="button button--primary" disabled={isCreatingGroup}>
                  {isCreatingGroup ? '만드는 중...' : '만들기'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* 성공/실패 토스트 */}
      {toastMessage && (
        <div className={`fixed bottom-6 left-6 right-6 z-50 max-w-[calc(100vw-3rem)] sm:left-auto sm:max-w-sm rounded-sm px-4 py-3 text-sm font-semibold shadow-card transition-all duration-300 ${
          toastType === 'error'
            ? 'bg-danger-soft text-danger'
            : 'bg-white text-primary border border-line'
        }`}>
          {toastMessage}
        </div>
      )}
      </main>

    </div>
  );
}
