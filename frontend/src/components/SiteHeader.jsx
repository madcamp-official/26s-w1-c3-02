import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon } from './icons';

const searchCategories = [
  { label: '통합검색', value: 'all' },
  { label: '책', value: 'book' },
  { label: '주석', value: 'annotation' },
  { label: '저자', value: 'author' },
];

const navItems = [
  { to: '/', key: 'home', label: '홈' },
  { to: '/search', key: 'browse', label: '둘러보기' },
  { to: '/groups', key: 'lounge', label: '라운지' },
];

function LogoMark() {
  return <img className="w-[132px] shrink-0 object-contain sm:w-[160px] lg:w-[190px]" src="/logo.png" alt="문장의서재" />;
}

function NavLink({ to, active, children, onClick }) {
  return (
    <Link className={`nav__link shrink-0 ${active ? 'nav__link--active' : ''}`} to={to} onClick={onClick}>
      {children}
    </Link>
  );
}

export default function SiteHeader({ active = 'auto', showSearch = true }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setKeyword(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const activeKey =
    active === 'auto'
      ? location.pathname === '/'
        ? 'home'
        : location.pathname.startsWith('/search')
          ? 'browse'
          : location.pathname.startsWith('/groups')
            ? 'lounge'
            : location.pathname.startsWith('/mypage')
              ? 'mypage'
              : location.pathname.startsWith('/login')
                ? 'login'
                : ''
      : active;

  const myPagePath = isAuthenticated ? '/mypage' : '/login';
  const myPageActiveKey = isAuthenticated ? 'mypage' : 'login';

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedKeyword = keyword.trim();
    const params = new URLSearchParams({ category });
    if (trimmedKeyword) params.set('q', trimmedKeyword);
    navigate(`/search?${params.toString()}`);
    setIsMenuOpen(false);
  };

  const searchForm = (className = '') => (
    <form
      className={`min-h-11 items-center overflow-hidden rounded-full border border-line bg-white shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 ${className}`}
      onSubmit={handleSearch}
    >
      <select
        className="h-11 w-[104px] shrink-0 border-0 bg-transparent px-3 text-sm font-bold text-text outline-none sm:w-[116px] sm:px-4"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        aria-label="검색 카테고리"
      >
        {searchCategories.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <span className="h-5 w-px shrink-0 bg-line" aria-hidden="true" />
      <input
        className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-text outline-none placeholder:text-text-subtle sm:px-4"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="책 제목, 주석, 저자 검색"
      />
      <button className="flex h-11 w-11 shrink-0 items-center justify-center text-primary sm:w-12" type="submit" aria-label="검색">
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="9" r="5.5" />
          <path d="m13.2 13.2 3.3 3.3" />
        </svg>
      </button>
    </form>
  );

  return (
    <header className="site-header">
      <div className="container grid min-h-[64px] grid-cols-[auto_1fr_auto] items-center gap-3 md:min-h-[72px] lg:gap-8">
        <Link to="/" className="brand justify-self-start">
          <LogoMark />
          <span className="brand__subtitle hidden xl:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </Link>

        {showSearch ? searchForm('hidden w-full min-w-[140px] max-w-[520px] justify-self-center md:flex') : <span />}

        <nav className="hidden justify-self-end md:flex md:items-center md:gap-3 lg:gap-5 xl:gap-7" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <NavLink key={item.key} to={item.to} active={activeKey === item.key}>
              {item.label}
            </NavLink>
          ))}
          <NavLink to={myPagePath} active={activeKey === myPageActiveKey}>
            {isAuthenticated ? '마이페이지' : '로그인'}
          </NavLink>
        </nav>

        <div className="flex items-center justify-end gap-2 md:hidden">
          <Link
            to={myPagePath}
            className="flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-pageSoft hover:text-primary"
            aria-label={isAuthenticated ? '마이페이지' : '로그인'}
          >
            <UserIcon className="h-6 w-6" strokeWidth={2.1} />
          </Link>
          <Link
            to="/search"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text transition hover:bg-pageSoft hover:text-primary"
            aria-label="검색"
          >
            <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="9" r="5.5" />
              <path d="m13.2 13.2 3.3 3.3" />
            </svg>
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text transition hover:bg-pageSoft hover:text-primary"
            aria-label="메뉴 보기"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 5h14" />
              <path d="M3 10h14" />
              <path d="M3 15h14" />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/35"
            aria-label="메뉴 닫기"
            onClick={() => setIsMenuOpen(false)}
          />
          <aside className="absolute right-0 top-0 flex h-full w-[min(82vw,320px)] flex-col bg-white p-5 shadow-float">
            <div className="mb-6 flex items-center justify-between gap-3">
              <LogoMark />
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-text transition hover:bg-pageSoft hover:text-primary"
                aria-label="메뉴 닫기"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg viewBox="0 0 20 20" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 5l10 10" />
                  <path d="M15 5L5 15" />
                </svg>
              </button>
            </div>
            <nav className="grid gap-1" aria-label="모바일 주요 메뉴">
              {navItems.map((item) => (
                <NavLink key={item.key} to={item.to} active={activeKey === item.key} onClick={() => setIsMenuOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
              <NavLink to={myPagePath} active={activeKey === myPageActiveKey} onClick={() => setIsMenuOpen(false)}>
                {isAuthenticated ? '마이페이지' : '로그인'}
              </NavLink>
            </nav>
            {showSearch && <div className="mt-6">{searchForm('flex w-full')}</div>}
          </aside>
        </div>
      )}
    </header>
  );
}
