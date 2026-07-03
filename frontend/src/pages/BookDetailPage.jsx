
import { Link, useParams } from 'react-router-dom';

const book = {
  id: 1,
  title: '냇물이 흐르듯',
  author: '오채린',
  genre: '자기계발',
  stats: '구절 노트 1개',
};

const annotations = [
  {
    id: 1,
    page: 33,
    visibility: '공개',
    quote: '흐르는 것은 멈추지 않기에 아름답다.',
    review: '완벽하지 않아도 계속 나아가면 된다는 위로.',
    author: '하윤',
    time: '2일 전',
    comments: 0,
  },
  {
    id: 2,
    page: 48,
    visibility: '공개',
    quote: '삶은 고여 있는 답보다 매일 갱신되는 질문에 가깝다.',
    review: '읽는 시점마다 다르게 다가올 문장이라 남겨둔다.',
    author: '서연',
    time: '4일 전',
    comments: 3,
  },
];

const filters = ['전체', '질문', '토론', '감상', '일반'];

function LogoMark() {
  return (
    <span className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-primary-soft">
      <span className="absolute left-2 top-1.5 h-5 w-2 -skew-y-12 rounded-[2px] bg-primary" />
      <span className="absolute right-2 top-1.5 h-5 w-2 skew-y-12 rounded-[2px] bg-primary/85" />
    </span>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="container grid min-h-[72px] grid-cols-[auto_1fr_auto] items-center gap-4 lg:gap-8">
        <Link to="/" className="brand justify-self-start">
          <LogoMark />
          <span>문장서재</span>
          <span className="brand__subtitle hidden xl:inline">문장을 수집하고, 생각을 나누는 공간</span>
        </Link>

        <div className="hidden justify-self-center md:block md:w-[min(42vw,420px)] lg:w-[min(36vw,460px)]">
          <label className="flex w-full items-center gap-3 rounded-sm border border-line bg-white px-4 py-2.5 text-sm text-text-muted shadow-soft">
            <span aria-hidden="true">⌕</span>
            <input
              className="w-full min-w-0 bg-transparent text-text outline-none placeholder:text-text-subtle"
              placeholder="책 제목, 저자, 문장 검색"
            />
          </label>
        </div>

        <nav className="hidden justify-self-end md:flex md:items-center md:gap-3 lg:gap-5 xl:gap-7" aria-label="주요 메뉴">
          <Link className="nav__link shrink-0" to="/">
            홈
          </Link>
          <Link className="nav__link nav__link--active shrink-0" to="/search">
            둘러보기
          </Link>
          <Link className="nav__link shrink-0" to="/mypage">
            내 서재
          </Link>
          <Link className="nav__link shrink-0" to="/groups">
            활동
          </Link>
          <Link className="nav__link shrink-0" to="/login">
            로그인
          </Link>
        </nav>

        <Link className="button button--primary button--sm justify-self-end md:hidden" to="/login">
          로그인
        </Link>
      </div>
    </header>
  );
}

function BookCover() {
  return (
    <div className="relative aspect-[3/4] w-full max-w-[180px] rounded-md bg-gradient-to-br from-teal-200 via-teal-300 to-teal-600 shadow-float md:max-w-[220px]">
      <div className="absolute inset-y-0 left-0 w-5 rounded-l-md bg-teal-900/70" />
      <div className="absolute inset-8 flex flex-col items-center justify-center border border-white/60 text-center text-white">
        <span className="mb-8 h-px w-10 bg-white/70" />
        <strong className="text-3xl font-bold leading-snug md:text-4xl">
          냇물이
          <br />
          흐르듯
        </strong>
        <span className="mt-8 h-px w-10 bg-white/70" />
        <span className="mt-5 text-base font-semibold">오채린</span>
      </div>
      <div className="absolute -bottom-2 left-4 right-0 h-3 rounded-b-md bg-black/15 blur-[2px]" />
    </div>
  );
}

function BookHero() {
  return (
    <section className="mx-auto grid w-full max-w-[900px] gap-8 py-10 md:grid-cols-[240px_1fr] md:items-center md:py-16">
      <div className="flex justify-center md:justify-start">
        <BookCover />
      </div>

      <div className="min-w-0 text-center md:text-left">
        <span className="tag tag--blue mx-auto md:mx-0">{book.genre}</span>
        <h1 className="mt-5 break-words text-4xl font-extrabold leading-tight text-text md:text-5xl">
          {book.title}
        </h1>
        <p className="mt-5 text-xl font-medium text-text-muted">{book.author} 지음</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-4 md:justify-start">
          <button className="button button--secondary button--lg">☆ 서재에 담기</button>
          <span className="text-base font-medium text-text-subtle">{book.stats}</span>
        </div>
      </div>
    </section>
  );
}

function AnnotationCard({ annotation }) {
  return (
    <Link
      to={`/annotations/${annotation.id}`}
      className="card card--padded block transition hover:-translate-y-1 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <span className="tag">p.{annotation.page}</span>
          <span className="tag tag--blue">{annotation.visibility}</span>
        </div>
        <span className="shrink-0 text-sm font-medium text-text-subtle">{annotation.time}</span>
      </div>

      <blockquote className="mt-5 border-l-4 border-primary-soft pl-5 text-2xl font-medium leading-[1.7] text-text">
        “{annotation.quote}”
      </blockquote>
      <p className="mt-4 text-base leading-[1.8] text-text-muted">{annotation.review}</p>

      <footer className="mt-7 flex items-center justify-between gap-4 text-sm text-text-muted">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
            {annotation.author.slice(0, 1)}
          </span>
          <span>{annotation.author}</span>
        </div>
        <span>주석 {annotation.comments}개</span>
      </footer>
    </Link>
  );
}

function SearchAndAction() {
  return (
    <section className="grid gap-4 border-t border-line pt-7 md:grid-cols-[1fr_auto] md:items-center">
      <label className="flex min-h-14 items-center gap-3 rounded-full border border-line bg-white px-5 text-base text-text-muted shadow-soft focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
        <span aria-hidden="true">⌕</span>
        <input
          className="w-full min-w-0 bg-transparent text-text outline-none placeholder:text-text-subtle"
          placeholder="페이지 번호 또는 구절로 검색"
        />
      </label>
      <Link to="/annotations/new" className="button button--primary button--lg rounded-full px-8">
        + 구절 노트 작성
      </Link>
    </section>
  );
}

export default function BookDetailPage() {
  const { bookId } = useParams();

  return (
    <div className="min-h-screen bg-page">
      <Header />

      <div className="border-b border-line bg-white/40">
        <div className="container flex min-h-[58px] items-center gap-2 text-sm font-semibold text-text-muted">
          <Link to="/search">둘러보기</Link>
          <span>/</span>
          <span className="text-text">{book.title}</span>
          <span className="sr-only">현재 책 ID {bookId}</span>
        </div>
      </div>

      <main className="page">
        <div className="container mx-auto grid max-w-[980px] gap-8">
          <BookHero />
          <SearchAndAction />

          <section className="grid gap-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.map((filter, index) => (
                  <button
                    key={filter}
                    className={`button button--sm ${index === 0 ? 'button--primary' : 'button--secondary'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <select className="select w-full md:w-[140px]" aria-label="정렬">
                <option>최신순</option>
                <option>인기순</option>
                <option>페이지순</option>
              </select>
            </div>

            <div className="grid gap-4">
              {annotations.map((annotation) => (
                <AnnotationCard key={annotation.id} annotation={annotation} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
