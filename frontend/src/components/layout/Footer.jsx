import LogoMark from './LogoMark';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white/70">
      <div className="container flex flex-col gap-4 py-6 text-sm text-text-muted md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark />
          <strong className="text-lg text-primary">문장서재</strong>
          <span className="hidden sm:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </div>
        <nav className="flex flex-wrap gap-5">
          <a href="#intro">소개</a>
          <a href="#terms">이용약관</a>
          <a href="#privacy">개인정보처리방침</a>
          <a href="#support">고객센터</a>
        </nav>
      </div>
    </footer>
  );
}
