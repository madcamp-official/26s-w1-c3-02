import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const searchCategories = [
  { label: '통합검색', value: 'all' },
  { label: '책', value: 'book' },
  { label: '주석', value: 'annotation' },
  { label: '저자', value: 'author' },
];

function LogoMark() {
  return (
    <img className="w-[132px] shrink-0 object-contain sm:w-[160px] lg:w-[190px]" src="/logo.png" alt="문장서재" />
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link className={`nav__link shrink-0 ${active ? 'nav__link--active' : ''}`} to={to}>
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

  const handleSearch = (event) => {
    event.preventDefault();
    const trimmedKeyword = keyword.trim();
    const params = new URLSearchParams({ category });
    if (trimmedKeyword) params.set('q', trimmedKeyword);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <header className="site-header relative">
      <div className="container grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-3 lg:gap-8">
        <Link to="/" className="brand justify-self-start">
          <LogoMark />
          <span className="brand__subtitle hidden xl:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </Link>

        {showSearch ? (
          <form
            className="flex min-h-11 w-full min-w-[140px] max-w-[520px] items-center justify-self-center overflow-hidden rounded-full border border-line bg-white shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
            onSubmit={handleSearch}
          >
            <select
              className="h-11 w-[88px] shrink-0 border-0 bg-transparent px-2 text-sm font-bold text-text outline-none sm:w-[116px] sm:px-4"
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
            <button className="flex h-11 w-10 shrink-0 items-center justify-center text-xl font-bold text-primary sm:w-12" type="submit" aria-label="검색">
              ⌕
            </button>
          </form>
        ) : (
          <span />
        )}

        <nav className="hidden justify-self-end md:flex md:items-center md:gap-3 lg:gap-5 xl:gap-7" aria-label="주요 메뉴">
          <NavLink to="/" active={activeKey === 'home'}>
            홈
          </NavLink>
          <NavLink to="/search" active={activeKey === 'browse'}>
            둘러보기
          </NavLink>
          <NavLink to="/groups" active={activeKey === 'lounge'}>
            라운지
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/mypage" active={activeKey === 'mypage'}>
              마이페이지
            </NavLink>
          ) : (
            <NavLink to="/login" active={activeKey === 'login'}>
              로그인
            </NavLink>
          )}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 justify-self-end md:hidden"
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <span className={`block h-0.5 w-6 bg-text transition-transform ${isMenuOpen ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block h-0.5 w-6 bg-text transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-text transition-transform ${isMenuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {isMenuOpen && (
        <nav
          className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-line bg-white p-4 shadow-card md:hidden"
          aria-label="주요 메뉴 (모바일)"
        >
          <NavLink to="/" active={activeKey === 'home'}>
            홈
          </NavLink>
          <NavLink to="/search" active={activeKey === 'browse'}>
            둘러보기
          </NavLink>
          <NavLink to="/groups" active={activeKey === 'lounge'}>
            라운지
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/mypage" active={activeKey === 'mypage'}>
              마이페이지
            </NavLink>
          ) : (
            <NavLink to="/login" active={activeKey === 'login'}>
              로그인
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}
