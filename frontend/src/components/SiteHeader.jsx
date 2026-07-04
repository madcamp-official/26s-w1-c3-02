import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const searchCategories = [
  { label: '통합검색', value: 'all' },
  { label: '책', value: 'book' },
  { label: '주석', value: 'annotation' },
  { label: '저자', value: 'author' },
];

function LogoMark() {
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-soft">
      <span className="absolute left-2 top-1.5 h-5 w-2 -skew-y-12 rounded-[2px] bg-primary" />
      <span className="absolute right-2 top-1.5 h-5 w-2 skew-y-12 rounded-[2px] bg-primary/85" />
    </span>
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
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');

  useEffect(() => {
    setKeyword(searchParams.get('q') || '');
    setCategory(searchParams.get('category') || 'all');
  }, [searchParams]);

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
    <header className="site-header">
      <div className="container grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
        <Link to="/" className="brand justify-self-start">
          <LogoMark />
          <span>문장서재</span>
          <span className="brand__subtitle hidden xl:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </Link>

        {showSearch ? (
          <form
            className="flex min-h-11 w-full min-w-[220px] max-w-[520px] items-center justify-self-center overflow-hidden rounded-full border border-line bg-white shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
            onSubmit={handleSearch}
          >
            <select
              className="h-11 w-[116px] shrink-0 border-0 bg-transparent px-4 text-sm font-bold text-text outline-none"
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
              className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm text-text outline-none placeholder:text-text-subtle"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="책 제목, 주석, 저자 검색"
            />
            <button className="flex h-11 w-12 shrink-0 items-center justify-center text-xl font-bold text-primary" type="submit" aria-label="검색">
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
          <NavLink to="/mypage" active={activeKey === 'mypage'}>
            마이페이지
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
