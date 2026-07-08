import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  addGroupBook,
  createGroupNotice,
  deleteGroup,
  getGroup,
  getGroupPendingInvites,
  inviteGroupMember,
  removeGroupBook,
  removeGroupMember,
  updateGroup,
} from '../api/groups';
import { getBooks, importBookFromAladin, searchExternalBooks } from '../api/books';
import { searchUsers } from '../api/users';
import { getErrorMessage } from '../utils/error';
import { getBookCardCategory } from '../utils/bookCategory';
import SiteHeader from '../components/SiteHeader';
import ExactBookCover from '../components/ExactBookCover';
import UserAvatar from '../components/common/UserAvatar';

const iconProps = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const PlusIcon = (props) => (
  <svg {...iconProps} strokeWidth={2.2} {...props}>
    <path d="M10 4v12M4 10h12" />
  </svg>
);

const EditIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M12.5 3.5 16 7l-9 9-4 1 1-4 8.5-9.5Z" />
  </svg>
);

const CloseIcon = (props) => (
  <svg {...iconProps} strokeWidth={2} {...props}>
    <path d="M5 5l10 10M15 5 5 15" />
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

const NoticeIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 8.5v3a1 1 0 0 0 1 1h1.4l1.2 4h2l-1.1-4H10l5.5 3V4.5L10 7.5H4a1 1 0 0 0-1 1Z" />
    <path d="M15.5 8.2a2.1 2.1 0 0 1 0 3.6" />
  </svg>
);

const BookIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H10v14H4.5A1.5 1.5 0 0 1 3 15.5v-11Z" />
    <path d="M17 4.5A1.5 1.5 0 0 0 15.5 3H10v14h5.5a1.5 1.5 0 0 0 1.5-1.5v-11Z" />
  </svg>
);

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

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [isLoadingGroup, setIsLoadingGroup] = useState(true);
  const [groupError, setGroupError] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteKeyword, setInviteKeyword] = useState('');
  const [inviteResults, setInviteResults] = useState([]);
  const [isSearchingInvite, setIsSearchingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [pendingInvites, setPendingInvites] = useState([]);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [bookKeyword, setBookKeyword] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [isSearchingBooks, setIsSearchingBooks] = useState(false);
  const [addBookError, setAddBookError] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [isSavingNotice, setIsSavingNotice] = useState(false);
  const [isEditingNotice, setIsEditingNotice] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const latestGroupRequestId = useRef(0);

  const isOwner = group?.owner?.id === user?.id;
  const existingMemberIds = new Set((group?.members || []).map((member) => member.id));
  const existingPendingIds = new Set(pendingInvites.map((invite) => invite.userId));
  const existingBookIds = new Set((group?.books || []).map((book) => book.bookId));

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const loadGroup = async () => {
    const requestId = ++latestGroupRequestId.current;
    setIsLoadingGroup(true);
    setGroupError('');
    try {
      const res = await getGroup(groupId);
      if (requestId !== latestGroupRequestId.current) return;
      setGroup(res);
      setNoticeContent(res.notice?.content ?? '');
      if (res.owner?.id === user?.id) {
        loadPendingInvites();
      }
    } catch (err) {
      if (requestId !== latestGroupRequestId.current) return;
      console.error(err);
      setGroupError(getErrorMessage(err));
    } finally {
      if (requestId === latestGroupRequestId.current) setIsLoadingGroup(false);
    }
  };

  const loadPendingInvites = async () => {
    try {
      const res = await getGroupPendingInvites(groupId);
      setPendingInvites(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  const handleSaveName = async () => {
    const nextName = editedName.trim();
    if (!nextName) return;
    setIsSavingName(true);
    try {
      await updateGroup(groupId, { groupName: nextName });
      setGroup((prev) => ({ ...prev, groupName: nextName }));
      setIsEditingName(false);
      showToast('그룹 이름을 변경했습니다.');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('이 그룹을 삭제하시겠습니까? 삭제하면 되돌릴 수 없습니다.')) return;
    try {
      await deleteGroup(groupId);
      navigate('/mypage');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm('이 그룹에서 나가시겠습니까?')) return;
    try {
      await removeGroupMember(groupId, user.id);
      navigate('/mypage');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleSearchInvite = async (event) => {
    event.preventDefault();
    if (!inviteKeyword.trim()) return;
    setIsSearchingInvite(true);
    setInviteError('');
    try {
      const res = await searchUsers(inviteKeyword.trim());
      setInviteResults(res.data || []);
    } catch (err) {
      console.error(err);
      setInviteError(getErrorMessage(err));
    } finally {
      setIsSearchingInvite(false);
    }
  };

  const handleInvite = async (memberUser) => {
    try {
      await inviteGroupMember(groupId, memberUser.id);
      showToast(`${memberUser.nickname}님을 초대했습니다.`);
      setInviteResults((prev) => prev.filter((item) => item.id !== memberUser.id));
      loadPendingInvites();
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleCancelInvite = async (invitee) => {
    if (!window.confirm(`${invitee.nickname}님에게 보낸 초대를 취소하시겠습니까?`)) return;
    try {
      await removeGroupMember(groupId, invitee.userId);
      setPendingInvites((prev) => prev.filter((item) => item.userId !== invitee.userId));
      showToast(`${invitee.nickname}님에 대한 초대를 취소했습니다.`);
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleRemoveMember = async (memberUser) => {
    if (!window.confirm(`${memberUser.nickname}님을 그룹에서 내보내시겠습니까?`)) return;
    try {
      await removeGroupMember(groupId, memberUser.id);
      setGroup((prev) => ({
        ...prev,
        members: prev.members.filter((member) => member.id !== memberUser.id),
      }));
      showToast(`${memberUser.nickname}님을 내보냈습니다.`);
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleSearchBooks = async (event) => {
    event.preventDefault();
    if (!bookKeyword.trim()) return;
    setIsSearchingBooks(true);
    setAddBookError('');
    try {
      const keyword = bookKeyword.trim();
      const [localRes, externalRes] = await Promise.all([
        getBooks({ keyword }),
        searchExternalBooks({ keyword, size: 10 }).catch(() => ({ data: [] })),
      ]);
      const localBooks = localRes.data || [];
      const localIsbns = new Set(localBooks.map((book) => book.isbn).filter(Boolean));
      const externalBooks = (externalRes.data || [])
        .filter((book) => book.isbn && !localIsbns.has(book.isbn))
        .map((book) => ({ ...book, isExternal: true }));
      setBookResults([...localBooks, ...externalBooks]);
    } catch (err) {
      console.error(err);
      setAddBookError(getErrorMessage(err));
    } finally {
      setIsSearchingBooks(false);
    }
  };

  const handleAddBook = async (book) => {
    try {
      const targetBook = book.isExternal ? await importBookFromAladin(book.isbn) : book;
      await addGroupBook(groupId, targetBook.bookId);
      showToast(`${targetBook.title}을(를) 그룹 도서에 추가했습니다.`);
      setBookResults((prev) => prev.filter((item) => (item.bookId || item.isbn) !== (book.bookId || book.isbn)));
      loadGroup();
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleRemoveBook = async (book) => {
    if (!window.confirm(`${book.title}을(를) 그룹 도서에서 제거하시겠습니까?`)) return;
    try {
      await removeGroupBook(groupId, book.bookId);
      setGroup((prev) => ({
        ...prev,
        books: prev.books.filter((item) => item.bookId !== book.bookId),
      }));
      showToast('그룹 도서를 제거했습니다.');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleCreateNotice = async (event) => {
    event.preventDefault();
    if (isSavingNotice) return;

    setIsSavingNotice(true);
    try {
      const notice = await createGroupNotice(groupId, noticeContent);
      setGroup((prev) => ({ ...prev, notice }));
      setNoticeContent(notice.content ?? '');
      setIsEditingNotice(false);
      showToast('공지를 수정했습니다.');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSavingNotice(false);
    }
  };

  return (
    <>
      <SiteHeader active="lounge" />
      <main className="page min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-74px)]">
        <div className="container grid max-w-[980px] gap-4 md:gap-6">
          {isLoadingGroup ? (
            <div className="card card--padded h-[140px] animate-pulse bg-surfaceMuted" />
          ) : groupError ? (
            <div className="card card--padded bg-white py-12 text-center">
              <p className="mb-3 text-sm font-semibold text-danger">{groupError}</p>
              <Link to="/mypage" className="button button--secondary button--sm">
                마이페이지로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              <section className="card card--padded bg-white">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    {isEditingName ? (
                      <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
                        <input
                          className="input !h-10 w-full sm:max-w-[280px]"
                          value={editedName}
                          onChange={(event) => setEditedName(event.target.value)}
                          disabled={isSavingName}
                          autoFocus
                        />
                        <button type="button" onClick={handleSaveName} className="button button--primary button--sm w-full sm:w-auto" disabled={isSavingName}>
                          저장
                        </button>
                        <button type="button" onClick={() => setIsEditingName(false)} className="button button--secondary button--sm w-full sm:w-auto" disabled={isSavingName}>
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex min-w-0 items-start gap-2">
                        <h1 className="min-w-0 flex-1 break-words text-[22px] font-extrabold leading-tight text-text md:text-2xl">{group.groupName}</h1>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditedName(group.groupName);
                              setIsEditingName(true);
                            }}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-text-muted transition hover:border-primary hover:text-primary"
                            aria-label="그룹 이름 수정"
                            title="이름 수정"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-text-muted">
                      <UserAvatar
                        avatarIcon={group.owner?.avatarIcon}
                        avatarUrl={group.owner?.avatarUrl}
                        nickname={group.owner?.nickname}
                        size="xs"
                      />
                      방장: {group.owner?.nickname}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <UsersIcon className="h-4 w-4" /> 멤버 {group.members?.length ?? 0}명
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookIcon className="h-4 w-4" /> 책 {group.books?.length ?? 0}권
                      </span>
                    </div>
                  </div>

                  {isOwner ? (
                    <button type="button" onClick={handleDeleteGroup} className="button button--secondary w-full text-danger hover:border-danger/30 hover:bg-danger-soft md:w-auto">
                      그룹 삭제
                    </button>
                  ) : (
                    <button type="button" onClick={handleLeaveGroup} className="button button--secondary w-full md:w-auto">
                      그룹 나가기
                    </button>
                  )}
                </div>

                <div className="mt-5 border-t border-line pt-4">
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-text-muted">
                      <NoticeIcon className="h-4 w-4" />
                      <h2 className="text-xs font-bold uppercase tracking-wide">공지</h2>
                      {group.notice?.createdAt && (
                        <span className="text-xs font-medium text-text-subtle">
                          · {new Date(group.notice.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      )}
                    </div>
                    {isOwner && !isEditingNotice && (
                      <button
                        type="button"
                        onClick={() => {
                          setNoticeContent(group.notice?.content ?? '');
                          setIsEditingNotice(true);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-text-muted transition hover:text-primary"
                      >
                        <EditIcon className="h-3.5 w-3.5" /> 수정하기
                      </button>
                    )}
                  </div>

                  {isEditingNotice ? (
                    <form className="grid gap-2" onSubmit={handleCreateNotice}>
                      <textarea
                        className="textarea min-h-[88px]"
                        value={noticeContent}
                        onChange={(event) => setNoticeContent(event.target.value)}
                        placeholder="새 공지를 작성하세요"
                        disabled={isSavingNotice}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingNotice(false);
                            setNoticeContent(group.notice?.content ?? '');
                          }}
                          className="button button--secondary button--sm w-full sm:w-auto"
                          disabled={isSavingNotice}
                        >
                          취소
                        </button>
                        <button type="submit" className="button button--primary button--sm w-full sm:w-auto" disabled={isSavingNotice}>
                          {isSavingNotice ? '저장 중' : '공지 수정'}
                        </button>
                      </div>
                    </form>
                  ) : group.notice ? (
                    <p className="whitespace-pre-wrap rounded-sm bg-pageSoft p-3 text-sm font-medium leading-relaxed text-text">
                      {group.notice.content}
                    </p>
                  ) : (
                    <p className="rounded-sm bg-pageSoft p-3 text-sm font-semibold text-text-muted">등록된 공지가 없습니다.</p>
                  )}
                </div>
              </section>

              <section className="card card--padded bg-white">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="section-title !text-lg">그룹 도서 ({group.books?.length ?? 0})</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setBookKeyword('');
                      setBookResults([]);
                      setAddBookError('');
                      setShowAddBookModal(true);
                    }}
                    className="button button--primary button--sm !min-h-8 w-full !px-3 text-xs sm:w-auto"
                  >
                    <PlusIcon className="h-3.5 w-3.5" /> 책 추가
                  </button>
                </div>
                {(group.books || []).length === 0 ? (
                  <p className="py-6 text-center text-sm text-text-muted">등록된 책이 없습니다.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {group.books.map((book) => (
                      <article key={book.bookId} className="card book-card relative !max-w-none !justify-self-stretch bg-white transition hover:-translate-y-1 hover:shadow-card">
                        <Link to={`/books/${book.bookId}?groupId=${groupId}`} className="contents">
                          <ExactBookCover
                            coverImageUrl={book.coverImageUrl}
                            title={book.title}
                            maxWidth={115}
                            maxHeight={154}
                          />
                          <div className="min-w-0">
                            <h3 className="truncate text-base font-bold text-text">{book.title}</h3>
                            <p className="mt-1 truncate text-xs text-text-muted">{book.author}</p>
                            {book.genreCode && (
                              <span className="tag tag--blue mt-3 max-w-full truncate">
                                {getBookCardCategory(book.genreCode)}
                              </span>
                            )}
                          </div>
                        </Link>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => handleRemoveBook(book)}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-text-subtle shadow-soft transition hover:text-danger"
                            aria-label={`${book.title} 제거`}
                            title="제거"
                          >
                            <CloseIcon className="h-4 w-4" />
                          </button>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <section className="card card--padded bg-white">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="section-title !text-base">멤버 ({group.members?.length ?? 0})</h2>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setInviteKeyword('');
                        setInviteResults([]);
                        setInviteError('');
                        setShowInviteModal(true);
                      }}
                      className="button button--primary button--sm !min-h-8 w-full !px-3 text-xs sm:w-auto"
                    >
                      <PlusIcon className="h-3.5 w-3.5" /> 멤버 초대
                    </button>
                  )}
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {(group.members || []).map((member) => (
                    <li key={member.id} className="flex items-center justify-between gap-2 rounded bg-pageSoft p-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <UserAvatar avatarIcon={member.avatarIcon} avatarUrl={member.avatarUrl} nickname={member.nickname} size="sm" />
                        {member.id ? (
                          <Link to={`/users/${member.id}`} className="truncate text-sm font-semibold text-text transition hover:text-primary">
                            {member.nickname}
                          </Link>
                        ) : (
                          <span className="truncate text-sm font-semibold text-text">{member.nickname}</span>
                        )}
                        {member.id === group.owner?.id && <span className="tag shrink-0 text-[10px]">방장</span>}
                      </div>
                      {isOwner && member.id !== group.owner?.id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member)}
                          className="shrink-0 text-text-subtle transition hover:text-danger"
                          aria-label={`${member.nickname} 내보내기`}
                          title="내보내기"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              {isOwner && pendingInvites.length > 0 && (
                <section className="card card--padded bg-white">
                  <h2 className="section-title !text-base mb-3">초대 대기 중 ({pendingInvites.length})</h2>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {pendingInvites.map((invite) => (
                      <li key={invite.userId} className="flex items-center justify-between gap-2 rounded bg-pageSoft p-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <UserAvatar avatarIcon={invite.avatarIcon} avatarUrl={invite.avatarUrl} nickname={invite.nickname} size="sm" />
                          <span className="truncate text-sm font-semibold text-text">{invite.nickname}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCancelInvite(invite)}
                          className="shrink-0 text-text-subtle transition hover:text-danger"
                          aria-label={`${invite.nickname} 초대 취소`}
                          title="초대 취소"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {showInviteModal && (
          <div className="modal-overlay">
            <section className="modal card card--padded">
              <h2 className="section-title mb-4">멤버 초대</h2>
              <form onSubmit={handleSearchInvite} className="flex gap-2">
                <input className="input !h-9 flex-1" type="text" placeholder="닉네임 입력" value={inviteKeyword} onChange={(event) => setInviteKeyword(event.target.value)} />
                <button type="submit" className="button button--primary button--sm" disabled={isSearchingInvite}>
                  {isSearchingInvite ? '검색...' : '검색'}
                </button>
              </form>
              {inviteError && <p className="mt-2 text-xs text-danger">{inviteError}</p>}
              {inviteResults.length > 0 && (
                <ul className="mt-4 grid max-h-[200px] gap-2 overflow-y-auto border-t border-line pt-4">
                  {inviteResults.map((result) => {
                    if (result.id === user?.id) return null;
                    const alreadyMember = existingMemberIds.has(result.id);
                    const alreadyPending = existingPendingIds.has(result.id);
                    return (
                      <li key={result.id} className="flex items-center justify-between rounded bg-pageSoft p-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <UserAvatar avatarIcon={result.avatarIcon} avatarUrl={result.avatarUrl} nickname={result.nickname} size="sm" />
                          <span className="max-w-[150px] truncate text-xs font-semibold text-text">{result.nickname}</span>
                        </div>
                        {alreadyMember ? (
                          <span className="text-[11px] font-bold text-text-subtle">이미 멤버</span>
                        ) : alreadyPending ? (
                          <span className="text-[11px] font-bold text-text-subtle">초대 대기 중</span>
                        ) : (
                          <button type="button" onClick={() => handleInvite(result)} className="button button--primary button--sm !min-h-7 !px-2.5 text-xs">
                            초대
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="button button--secondary">
                  닫기
                </button>
              </div>
            </section>
          </div>
        )}

        {showAddBookModal && (
          <div className="modal-overlay">
            <section className="modal card card--padded">
              <h2 className="section-title mb-4">그룹 도서 추가</h2>
              <form onSubmit={handleSearchBooks} className="flex gap-2">
                <input className="input !h-9 flex-1" type="text" placeholder="책 제목 또는 저자" value={bookKeyword} onChange={(event) => setBookKeyword(event.target.value)} />
                <button type="submit" className="button button--primary button--sm" disabled={isSearchingBooks}>
                  {isSearchingBooks ? '검색...' : '검색'}
                </button>
              </form>
              {addBookError && <p className="mt-2 text-xs text-danger">{addBookError}</p>}
              {bookResults.length > 0 && (
                <ul className="mt-4 grid max-h-[240px] gap-2 overflow-y-auto border-t border-line pt-4">
                  {bookResults.map((book) => {
                    const alreadyAdded = book.bookId ? existingBookIds.has(book.bookId) : false;
                    return (
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
                        {alreadyAdded ? (
                          <span className="shrink-0 text-[11px] font-bold text-text-subtle">이미 추가됨</span>
                        ) : (
                          <button type="button" onClick={() => handleAddBook(book)} className="button button--primary button--sm !min-h-7 !px-2.5 text-xs shrink-0">
                            추가
                          </button>
                        )}
                      </li>
                    );
                  })}
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
          <div
            className={`fixed bottom-6 left-6 right-6 z-50 max-w-[calc(100vw-3rem)] sm:left-auto sm:max-w-sm rounded-sm px-4 py-3 text-sm font-semibold shadow-card transition-all duration-300 ${
              toastType === 'error' ? 'bg-danger-soft text-danger' : 'border border-line bg-white text-primary'
            }`}
          >
            {toastMessage}
          </div>
        )}
      </main>
    </>
  );
}
