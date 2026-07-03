import { Link } from 'react-router-dom';

const recommendedBooks = [
  {
    id: 1,
    title: '순간의 나와 영원의 당신',
    author: '김초엽',
    genre: '소설',
    saves: '1.2k',
    cover: 'from-sky-100 via-blue-100 to-slate-200',
  },
  {
    id: 2,
    title: '연금술사',
    author: '파울로 코엘료',
    genre: '소설',
    saves: '2.8k',
    cover: 'from-slate-900 via-indigo-900 to-amber-700',
  },
  {
    id: 3,
    title: '달과 6펜스',
    author: '서머싯 몸',
    genre: '소설',
    saves: '1.6k',
    cover: 'from-emerald-200 via-stone-300 to-rose-200',
  },
  {
    id: 4,
    title: '나를 소모하지 않는 현명한 태도',
    author: '마티아스 뇔케',
    genre: '에세이',
    saves: '3.1k',
    cover: 'from-slate-100 via-white to-blue-200',
  },
  {
    id: 5,
    title: '카라마조프가의 형제들',
    author: '도스토예프스키',
    genre: '소설',
    saves: '2.2k',
    cover: 'from-stone-100 via-amber-100 to-stone-300',
  },
];

const feedItems = [
  {
    id: 1,
    author: '서연',
    time: '2시간 전',
    book: '소년이 온다',
    quote: '죽은 자가 산 자를 구하는 일은 가능한가. 산 자가 죽은 자를 기억하는 일은 가능한가.',
    tag: '기억',
    likes: 128,
    comments: 15,
    avatar: 'bg-rose-200',
  },
  {
    id: 2,
    author: '민준',
    time: '4시간 전',
    book: '데미안',
    quote: '새는 알에서 나오기 위해 투쟁한다. 알은 세계이다. 태어나려는 자는 하나의 세계를 파괴해야 한다.',
    tag: '성장',
    likes: 96,
    comments: 8,
    avatar: 'bg-slate-300',
  },
  {
    id: 3,
    author: '지우',
    time: '6시간 전',
    book: '나미야 잡화점의 기적',
    quote: '누군가의 진심은 언젠가 반드시 누군가에게 닿기 마련입니다.',
    tag: '위로',
    likes: 142,
    comments: 22,
    avatar: 'bg-orange-200',
  },
];

const filters = ['전체',  '소설', '시/에세이', '인문', '자기계발'];

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
                <Link className="nav__link nav__link--active shrink-0" to="/">
                홈
                </Link>
                <Link className="nav__link shrink-0" to="/search">
                둘러보기
                </Link>
                <Link className="nav__link shrink-0" to="/mypage">
                내 서재
                </Link>
                <Link className="nav__link shrink-0" to="/groups">
                활동
                </Link>
                <Link className="nav__link shrink-0 " to="/login">
                로그인
                </Link>
            </nav>

            <Link
                className="button button--primary button--sm shrink-0 whitespace-nowrap md:hidden"
                to="/login"
            >
                로그인
            </Link>
            </div>
      </div>
    </header>
  );
}

function HeroScene() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] overflow-hidden rounded-r-lg md:block">
      <div className="absolute inset-0 bg-gradient-to-l from-stone-200/70 via-white/35 to-transparent" />
      <div className="absolute bottom-0 right-0 h-28 w-full bg-gradient-to-r from-stone-100 to-stone-300" />
      <div className="absolute bottom-24 right-12 h-4 w-32 rounded-sm bg-slate-800 shadow-card" />
      <div className="absolute bottom-28 right-10 h-4 w-36 rounded-sm bg-stone-100 shadow-card" />
      <div className="absolute bottom-32 right-14 h-4 w-32 rounded-sm bg-slate-700 shadow-card" />
      <div className="absolute bottom-20 right-56 h-12 w-7 rounded-sm bg-primary shadow-card" />
      <div className="absolute bottom-16 right-36 h-1.5 w-44 -rotate-12 rounded-full bg-slate-700" />
      <div className="absolute right-20 top-10 h-32 w-32 rounded-full bg-white/60 blur-2xl" />
    </div>
  );
}

function HomeHero() {
  return (
    <section className="hero-card relative min-h-[260px] p-8 md:p-10">
      <HeroScene />
      <div className="relative z-10 max-w-[620px]">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-2xl font-bold text-text">오늘의 문장</p>
          <p className="text-sm font-semibold text-text-muted">5월 16일 금요일</p>
        </div>

        <div className="mt-9 flex gap-5">
          <span className="text-5xl font-bold leading-none text-primary-soft">“</span>
          <div>
            <h1 className="text-2xl font-semibold leading-[1.8] text-text md:text-[28px]">
              자기 자신으로 있기 위해서는
              <br />
              끊임없이 자신을 갱신해야 한다.
            </h1>
            <p className="mt-5 text-base font-medium text-text-muted">- 헤르만 헤세, 데미안</p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <div className="flex -space-x-2">
            {['bg-rose-200', 'bg-amber-200', 'bg-slate-300', 'bg-emerald-200'].map((color) => (
              <span key={color} className={`h-7 w-7 rounded-full border-2 border-white ${color}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-text-muted">1,247명이 공감했습니다</span>
        </div>
      </div>

      <button className="button button--secondary button--sm absolute right-6 top-6 hidden md:inline-flex">
        저장하기
      </button>
    </section>
  );
}

function BookCover({ cover, title }) {
  return (
    <div className={`book-cover bg-gradient-to-br ${cover}`}>
      <div className="flex h-full items-end p-2">
        <span className="line-clamp-3 text-[10px] font-bold leading-tight text-text/80">{title}</span>
      </div>
    </div>
  );
}

function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="block">
    <article className="card book-card">
      <img className="book-cover" src={book.coverImageUrl} alt={`${book.title} 표지`} />

      <div className="min-w-0 flex h-full flex-col">
        <h3 className="line-clamp-2 min-h-[44px] text-[15px] font-bold leading-[1.45] text-text">
          {book.title}
        </h3>

        <p className="mt-1 truncate text-sm text-text-muted">
          {book.author}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="tag tag--blue shrink-0 whitespace-nowrap">
            {book.genre}
          </span>

          <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm text-text-muted">
            <span>♡</span>
            <span>{book.saves}</span>
          </span>
        </div>
      </div>
    </article>
    </Link>
  );
}


function AnnotationCard({ item }) {
  return (
    <article className="card annotation-card transition hover:-translate-y-1 hover:shadow-card">
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`avatar ${item.avatar}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <strong className="text-sm text-text">{item.author}</strong>
              <span className="text-sm text-text-muted">{item.time}</span>
            </div>
            <p className="mt-1 truncate text-xs font-semibold text-text-muted">「{item.book}」</p>
          </div>
        </div>
        <button className="button button--ghost button--sm" aria-label="더보기">
          ···
        </button>
      </header>

      <div>
        <p className="annotation-quote">
          <span className="mr-2 text-3xl font-bold text-primary-soft">“</span>
          {item.quote}
        </p>
        <span className="tag tag--blue">#{item.tag}</span>
      </div>

      <footer className="card-actions">
        <div className="flex items-center gap-5">
          <span>♡ {item.likes}</span>
          <span>댓글 {item.comments}</span>
        </div>
        <button className="text-lg text-text-muted" aria-label="저장">
          ▱
        </button>
      </footer>
    </article>
  );
}

function Footer() {
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-page">
      <Header />

      <main className="page">
        <div className="container grid gap-8">
          <HomeHero />

          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="section-title">이런 책은 어때요?</h2>
              <Link to="/search" className="button button--ghost button--sm">
                더보기
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recommendedBooks.slice(0, 4).map((book) => (
                    <BookCard key={book.id} book={book} />
                ))}
            </div>
          </section>

          <section className="grid gap-4 border-t border-line pt-7">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="section-title mr-2">오늘의 문장 피드</h2>
                {filters.map((filter, index) => (
                  <button
                    key={filter}
                    className={`button button--sm ${index === 0 ? 'button--primary' : 'button--secondary'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                
                <Link to="/annotations/new" className="button button--primary">
                  문장 공유하기
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {feedItems.map((item) => (
                <AnnotationCard key={item.id} item={item} />
              ))}
            </div>

            <nav className="pagination pt-2" aria-label="문장 피드 페이지">
              <button className="pagination__item" aria-label="이전 페이지">
                ‹
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`pagination__item ${page === 1 ? 'pagination__item--active' : ''}`}
                >
                  {page}
                </button>
              ))}
              <button className="pagination__item" aria-label="다음 페이지">
                ›
              </button>
            </nav>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
