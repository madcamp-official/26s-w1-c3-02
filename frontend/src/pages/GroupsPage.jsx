import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SiteHeader from '../components/SiteHeader';
import { getMyGroups } from '../api/users';
import { createGroup } from '../api/groups';
import { getErrorMessage } from '../utils/error';

const iconProps = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

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

const PlusIcon = (props) => (
  <svg {...iconProps} strokeWidth={2.2} {...props}>
    <path d="M10 4v12M4 10h12" />
  </svg>
);

function EmptyState({ message }) {
  return (
    <div className="py-12 text-center card card--padded bg-white/50">
      <p className="text-sm font-semibold text-text-muted">{message}</p>
    </div>
  );
}

function GroupCardSkeleton() {
  return <div className="card card--padded h-[168px] animate-pulse bg-surfaceMuted" />;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  const fetchGroups = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const res = await getMyGroups();
      setGroups(Array.isArray(res) ? res : res.data || []);
    } catch (err) {
      console.error(err);
      setLoadError('불러오지 못했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreateError('');
    if (!newGroupName.trim()) {
      setCreateError('그룹 이름을 입력해 주세요.');
      return;
    }

    setIsCreating(true);
    try {
      await createGroup({ groupName: newGroupName.trim() });
      setShowCreateModal(false);
      setNewGroupName('');
      fetchGroups();
    } catch (err) {
      console.error(err);
      setCreateError(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="lounge" />

      <main className="page flex-1">
        <div className="container grid gap-6">
          <div className="card card--padded bg-white flex items-center justify-between gap-4">
            <div>
              <h1 className="section-title !text-lg">라운지</h1>
              <p className="mt-1.5 text-sm text-text-muted">내가 속한 그룹 라운지를 한눈에 확인해 보세요.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="button button--primary button--lg shrink-0"
            >
              <PlusIcon className="h-5 w-5" />
              라운지 만들기
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GroupCardSkeleton />
              <GroupCardSkeleton />
            </div>
          ) : loadError ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-danger">{loadError}</p>
            </div>
          ) : groups.length === 0 ? (
            <EmptyState message="참여 중인 그룹이 없습니다" />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map((group) => (
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
      </main>

      {showCreateModal && (
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

              {createError && <p className="text-xs text-danger">{createError}</p>}

              <div className="flex justify-end gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewGroupName('');
                    setCreateError('');
                  }}
                  className="button button--secondary"
                >
                  취소
                </button>
                <button type="submit" className="button button--primary" disabled={isCreating}>
                  {isCreating ? '만드는 중...' : '만들기'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
