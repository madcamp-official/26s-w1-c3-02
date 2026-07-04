import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import {
  getGroup,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  addGroupBook,
} from '../api/groups';
import { searchUsers } from '../api/users';
import { getBooks } from '../api/books';
import { getErrorMessage } from '../utils/error';

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

const BookIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H10v14H4.5A1.5 1.5 0 0 1 3 15.5v-11Z" />
    <path d="M17 4.5A1.5 1.5 0 0 0 15.5 3H10v14h5.5a1.5 1.5 0 0 0 1.5-1.5v-11Z" />
  </svg>
);

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

  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [bookKeyword, setBookKeyword] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [isSearchingBooks, setIsSearchingBooks] = useState(false);
  const [addBookError, setAddBookError] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const latestGroupRequestId = useRef(0);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const isOwner = group?.owner?.id === user?.id;

  const loadGroup = async () => {
    const requestId = ++latestGroupRequestId.current;
    setIsLoadingGroup(true);
    setGroupError('');
    try {
      const res = await getGroup(groupId);
      if (requestId !== latestGroupRequestId.current) return;
      setGroup(res);
    } catch (err) {
      if (requestId !== latestGroupRequestId.current) return;
      console.error(err);
      setGroupError(getErrorMessage(err));
    } finally {
      if (requestId === latestGroupRequestId.current) setIsLoadingGroup(false);
    }
  };

  useEffect(() => {
    loadGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // 그룹 이름 수정 (방장 전용)
  const handleStartEditName = () => {
    setEditedName(group.groupName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) return;
    setIsSavingName(true);
    try {
      await updateGroup(groupId, { groupName: editedName.trim() });
      setGroup((prev) => ({ ...prev, groupName: editedName.trim() }));
      setIsEditingName(false);
      showToast('그룹 이름을 변경했습니다.');
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsSavingName(false);
    }
  };

  // 그룹 삭제(방장) / 나가기(멤버)
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

  // 멤버 초대/내보내기
  const handleSearchInvite = async (e) => {
    e.preventDefault();
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
      await addGroupMember(groupId, memberUser.id);
      showToast(`${memberUser.nickname}님을 초대했습니다.`);
      setInviteResults((prev) => prev.filter((u) => u.id !== memberUser.id));
      loadGroup();
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleRemoveMember = async (memberUser) => {
    if (!window.confirm(`${memberUser.nickname}님을 그룹에서 내보내시겠습니까?`)) return;
    try {
      await removeGroupMember(groupId, memberUser.id);
      setGroup((prev) => ({ ...prev, members: prev.members.filter((m) => m.id !== memberUser.id) }));
      showToast(`${memberUser.nickname}님을 내보냈습니다.`);
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  // 그룹 도서 추가/제거
  const handleSearchBooks = async (e) => {
    e.preventDefault();
    if (!bookKeyword.trim()) return;
    setIsSearchingBooks(true);
    setAddBookError('');
    try {
      const res = await getBooks({ keyword: bookKeyword.trim() });
      setBookResults(res.data || []);
    } catch (err) {
      console.error(err);
      setAddBookError(getErrorMessage(err));
    } finally {
      setIsSearchingBooks(false);
    }
  };

  const handleAddBook = async (book) => {
    try {
      await addGroupBook(groupId, book.bookId);
      showToast(`${book.title}을(를) 그룹 도서에 추가했습니다.`);
      setBookResults((prev) => prev.filter((b) => b.bookId !== book.bookId));
      loadGroup();
    } catch (err) {
      console.error(err);
      showToast(getErrorMessage(err), 'error');
    }
  };

  const existingMemberIds = new Set((group?.members || []).map((m) => m.id));
  const existingBookIds = new Set((group?.books || []).map((b) => b.bookId));

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <Header />

      <main className="page flex-1">
        <div className="container grid gap-6 max-w-[980px] mx-auto">
          {isLoadingGroup ? (
            <div className="card card--padded h-[140px] animate-pulse bg-surfaceMuted" />
          ) : groupError ? (
            <div className="card card--padded bg-white text-center py-12">
              <p className="text-sm font-semibold text-danger mb-3">{groupError}</p>
              <Link to="/mypage" className="button button--secondary button--sm">
                마이페이지로 돌아가기
              </Link>
            </div>
          ) : (
            <>
              {/* 그룹 정보 헤더 */}
              <section className="card card--padded bg-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    {isEditingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="input !h-10 max-w-[280px]"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          disabled={isSavingName}
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleSaveName}
                          className="button button--primary button--sm"
                          disabled={isSavingName}
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingName(false)}
                          className="button button--secondary button--sm"
                          disabled={isSavingName}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-extrabold text-text truncate">{group.groupName}</h1>
                        {isOwner && (
                          <button
                            type="button"
                            onClick={handleStartEditName}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-text-muted transition hover:border-primary hover:text-primary"
                            aria-label="그룹 이름 수정"
                            title="이름 수정"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="mt-1.5 text-sm text-text-muted">방장: {group.owner?.nickname}</p>
                    <div className="mt-3 flex items-center gap-5 text-sm text-text-muted">
                      <span className="flex items-center gap-1.5">
                        <UsersIcon className="h-4 w-4" /> 멤버 {group.members?.length ?? 0}명
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookIcon className="h-4 w-4" /> 책 {group.books?.length ?? 0}권
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={handleDeleteGroup}
                        className="button button--secondary text-danger hover:border-danger/30 hover:bg-danger-soft"
                      >
                        그룹 삭제
                      </button>
                    ) : (
                      <button type="button" onClick={handleLeaveGroup} className="button button--secondary">
                        그룹 나가기
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* 그룹 도서 — 마이페이지 "내 서재"와 같은 카드 그리드. 책을 고르면 책 상세 페이지로 이동하고,
                  거기서는 이 그룹 멤버들이 쓴 주석만 모아 보여준다(?groupId= 쿼리로 전달). */}
              <section className="card card--padded bg-white">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="section-title !text-lg">그룹 도서 ({group.books?.length ?? 0})</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setBookKeyword('');
                      setBookResults([]);
                      setAddBookError('');
                      setShowAddBookModal(true);
                    }}
                    className="button button--primary button--sm !min-h-8 !px-3 text-xs"
                  >
                    <PlusIcon className="h-3.5 w-3.5" /> 책 추가
                  </button>
                </div>
                {(group.books || []).length === 0 ? (
                  <p className="text-sm text-text-muted py-6 text-center">
                    등록된 책이 없습니다. "책 추가"로 그룹에서 함께 읽을 책을 등록해 보세요.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {group.books.map((book) => (
                      <Link to={`/books/${book.bookId}?groupId=${groupId}`} key={book.bookId} className="block">
                        <article className="card book-card !w-[280px] !max-w-none bg-white transition hover:-translate-y-1 hover:shadow-card">
                          {book.coverImageUrl ? (
                            <img className="book-cover" src={book.coverImageUrl} alt={book.title} />
                          ) : (
                            <div className="book-cover flex items-center justify-center text-center text-xs font-bold text-text-subtle p-2">
                              No Cover
                            </div>
                          )}
                          <div className="min-w-0 flex h-full flex-col justify-center">
                            <h3 className="truncate text-base font-bold text-text leading-tight">{book.title}</h3>
                            <p className="mt-1 text-xs text-text-muted truncate">{book.author}</p>
                            {book.genreCode && (
                              <div className="mt-3">
                                <span className="tag tag--blue">{book.genreCode}</span>
                              </div>
                            )}
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              {/* 멤버 */}
              <section className="card card--padded bg-white">
                <div className="mb-3 flex items-center justify-between">
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
                      className="button button--primary button--sm !min-h-8 !px-3 text-xs"
                    >
                      <PlusIcon className="h-3.5 w-3.5" /> 멤버 초대
                    </button>
                  )}
                </div>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {(group.members || []).map((member) => (
                    <li key={member.id} className="flex items-center justify-between gap-2 p-2 rounded bg-pageSoft">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                          {member.nickname?.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate text-sm font-semibold text-text">{member.nickname}</span>
                        {member.id === group.owner?.id && (
                          <span className="tag shrink-0 text-[10px]">방장</span>
                        )}
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
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* 멤버 초대 모달 */}
      {showInviteModal && (
        <div className="modal-overlay">
          <section className="modal card card--padded">
            <h2 className="section-title mb-4">멤버 초대</h2>
            <form onSubmit={handleSearchInvite} className="flex gap-2">
              <input
                className="input !h-9 flex-1"
                type="text"
                placeholder="닉네임 입력"
                value={inviteKeyword}
                onChange={(e) => setInviteKeyword(e.target.value)}
              />
              <button type="submit" className="button button--primary button--sm" disabled={isSearchingInvite}>
                {isSearchingInvite ? '검색...' : '검색'}
              </button>
            </form>
            {inviteError && <p className="text-xs text-danger mt-2">{inviteError}</p>}
            {inviteResults.length > 0 && (
              <ul className="grid gap-2 mt-4 max-h-[200px] overflow-y-auto border-t border-line pt-4">
                {inviteResults.map((result) => {
                  if (result.id === user?.id) return null;
                  const alreadyMember = existingMemberIds.has(result.id);
                  return (
                    <li key={result.id} className="flex justify-between items-center p-2 rounded bg-pageSoft">
                      <span className="text-xs font-semibold text-text truncate max-w-[150px]">{result.nickname}</span>
                      {alreadyMember ? (
                        <span className="text-[11px] text-text-subtle font-bold">이미 멤버</span>
                      ) : (
                        <button
                          onClick={() => handleInvite(result)}
                          className="button button--primary button--sm !min-h-7 !px-2.5 text-xs"
                        >
                          초대
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowInviteModal(false)} className="button button--secondary">
                닫기
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 책 추가 모달 */}
      {showAddBookModal && (
        <div className="modal-overlay">
          <section className="modal card card--padded">
            <h2 className="section-title mb-4">그룹 도서 추가</h2>
            <form onSubmit={handleSearchBooks} className="flex gap-2">
              <input
                className="input !h-9 flex-1"
                type="text"
                placeholder="책 제목 또는 저자"
                value={bookKeyword}
                onChange={(e) => setBookKeyword(e.target.value)}
              />
              <button type="submit" className="button button--primary button--sm" disabled={isSearchingBooks}>
                {isSearchingBooks ? '검색...' : '검색'}
              </button>
            </form>
            {addBookError && <p className="text-xs text-danger mt-2">{addBookError}</p>}
            {bookResults.length > 0 && (
              <ul className="grid gap-2 mt-4 max-h-[240px] overflow-y-auto border-t border-line pt-4">
                {bookResults.map((book) => {
                  const alreadyAdded = existingBookIds.has(book.bookId);
                  return (
                    <li key={book.bookId} className="flex justify-between items-center p-2 rounded bg-pageSoft">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-text">{book.title}</p>
                        <p className="truncate text-[11px] text-text-muted">{book.author}</p>
                      </div>
                      {alreadyAdded ? (
                        <span className="text-[11px] text-text-subtle font-bold shrink-0">이미 추가됨</span>
                      ) : (
                        <button
                          onClick={() => handleAddBook(book)}
                          className="button button--primary button--sm !min-h-7 !px-2.5 text-xs shrink-0"
                        >
                          추가
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowAddBookModal(false)} className="button button--secondary">
                닫기
              </button>
            </div>
          </section>
        </div>
      )}

      {/* 토스트 */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-sm px-4 py-3 text-sm font-semibold shadow-card transition-all duration-300 ${
            toastType === 'error' ? 'bg-danger-soft text-danger' : 'bg-white text-primary border border-line'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
