import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 임시 디버그용 홈 화면. 실제 홈(책 목록/피드)은 A가 구현 예정이며,
// 그 전까지 각 라우트 이동을 확인하기 위한 네비게이션 버튼만 제공한다.
const routeGroups = [
  {
    title: '인증',
    links: [
      { to: '/login', label: '로그인' },
      { to: '/register', label: '회원가입' },
    ],
  },
  {
    title: '계정 (로그인 필요)',
    links: [
      { to: '/mypage', label: '마이페이지' },
      { to: '/friends', label: '친구' },
      { to: '/groups', label: '그룹 목록' },
      { to: '/groups/9', label: '그룹 상세 (mock id=9)' },
    ],
  },
  {
    title: '도서 · 주석 (A 도메인, 아직 미구현)',
    links: [
      { to: '/books/3', label: '책 상세 (mock id=3)' },
      { to: '/annotations/101', label: '주석 상세 (mock id=101)' },
      { to: '/search', label: '검색' },
    ],
  },
  {
    title: '기타',
    links: [{ to: '/404', label: 'Not Found 확인' }],
  },
];

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <main className="page min-h-[calc(100vh-72px)]">
      <div className="container grid gap-8">
        <section className="card card--padded bg-white">
          <h1 className="page-title mb-1">디버그 홈</h1>
          <p className="text-sm text-text-muted">
            실제 홈 화면 구현 전까지 각 페이지 이동을 확인하기 위한 임시 화면입니다.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="tag" data-testid="auth-status">
              {isAuthenticated ? `로그인됨 · ${user?.nickname ?? ''}` : '로그아웃 상태'}
            </span>
            {isAuthenticated && (
              <button onClick={logout} className="button button--secondary button--sm">
                로그아웃 (로컬 상태만 초기화)
              </button>
            )}
          </div>
        </section>

        {routeGroups.map((group) => (
          <section key={group.title} className="card card--padded bg-white">
            <h2 className="section-title mb-4">{group.title}</h2>
            <div className="flex flex-wrap gap-2">
              {group.links.map((link) => (
                <Link key={link.to} to={link.to} className="button button--secondary">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
