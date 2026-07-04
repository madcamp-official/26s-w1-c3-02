import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { logout as logoutApi } from '../../api/auth';
import LogoMark from './LogoMark';

const NAV_LINKS = [
  { to: '/', label: '홈', end: true },
  { to: '/search', label: '둘러보기' },
  { to: '/mypage', label: '내 서재' },
  { to: '/groups', label: '활동' },
];

export default function Header() {
  const { isAuthenticated, user, logout: localLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      localLogout();
      navigate('/');
    }
  };

  return (
    <header className="site-header">
      <div className="container grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
        <Link to="/" className="brand justify-self-start">
          <LogoMark />
          <span>문장서재</span>
          <span className="brand__subtitle hidden xl:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </Link>

        <div className="w-full min-w-[220px] max-w-[360px] md:w-[min(42vw,420px)] md:max-w-none lg:w-[min(36vw,460px)]">
          <label className="flex w-full items-center gap-3 rounded-sm border border-line bg-white px-4 py-2.5 text-sm text-text-muted shadow-soft">
            <span aria-hidden="true">⌕</span>
            <input
              className="w-full min-w-0 bg-transparent text-text outline-none placeholder:text-text-subtle"
              placeholder="책 제목, 저자, 문장 검색"
            />
          </label>
        </div>

        <div className="flex justify-self-end">
          <nav
            className="hidden items-center gap-3 md:flex lg:gap-5 xl:gap-7"
            aria-label="주요 메뉴"
          >
            {NAV_LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `nav__link shrink-0 ${isActive ? 'nav__link--active' : ''}`}
              >
                {label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-sm font-bold text-text-muted">{user?.nickname}님</span>
                <button onClick={handleLogout} className="button button--secondary button--sm">
                  로그아웃
                </button>
              </div>
            ) : (
              <Link className="nav__link shrink-0" to="/login">
                로그인
              </Link>
            )}
          </nav>

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="button button--secondary button--sm shrink-0 whitespace-nowrap md:hidden"
            >
              로그아웃
            </button>
          ) : (
            <Link
              className="button button--primary button--sm shrink-0 whitespace-nowrap md:hidden"
              to="/login"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
