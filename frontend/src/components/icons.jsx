// 공용 인라인 SVG 아이콘 (lucide-react 미설치 상태라 최소 인라인 SVG로 대체).
// MyPage 대시보드와 사용자 프로필 페이지 등에서 공유한다.
import React from 'react';

export const iconProps = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const HomeIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 9.5 10 3l7 6.5" />
    <path d="M5 8.5V16a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8.5" />
  </svg>
);

export const MessageIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 4h14v9H8l-4 3v-3H3z" />
  </svg>
);

// 좋아요 표시는 앱 전체에서 유니코드 ▲ 글자로 통일한다. 다른 스트로크 아이콘과 같은
// className="h-5 w-5" 규격으로 끼워 넣을 수 있도록 span으로 감싼다.
export const TriangleIcon = ({ className = '' }) => (
  <span className={`flex items-center justify-center leading-none ${className}`} aria-hidden="true">▲</span>
);

export const StarIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M10 2.5l2.35 4.76 5.25.76-3.8 3.7.9 5.23L10 14.5l-4.7 2.45.9-5.23-3.8-3.7 5.25-.76z" strokeLinejoin="round" />
  </svg>
);

export const BookIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H10v14H4.5A1.5 1.5 0 0 1 3 15.5v-11Z" />
    <path d="M17 4.5A1.5 1.5 0 0 0 15.5 3H10v14h5.5a1.5 1.5 0 0 0 1.5-1.5v-11Z" />
  </svg>
);

export const UsersIcon = (props) => (
  <svg {...iconProps} {...props}>
    <circle cx="7" cy="7" r="2.3" />
    <path d="M2.5 16c.5-2.8 2.3-4.3 4.5-4.3s4 1.5 4.5 4.3" />
    <circle cx="14" cy="6.5" r="2" />
    <path d="M12.5 11.9c1.8.2 3.2 1.6 3.6 4.1" />
  </svg>
);

export const UserIcon = (props) => (
  <svg {...iconProps} {...props}>
    <circle cx="10" cy="6.5" r="3" />
    <path d="M3.5 17c.8-3.6 3-5.5 6.5-5.5s5.7 1.9 6.5 5.5" />
  </svg>
);

export const SettingsIcon = (props) => (
  <svg {...iconProps} {...props}>
    <circle cx="10" cy="10" r="2.6" />
    <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.4 4.6l-1.4 1.4M6 12.6l-1.4 1.4M15.4 15.4l-1.4-1.4M6 7.4 4.6 6" />
  </svg>
);

// 즐겨찾기(북마크) 뱃지 — 기본은 채워진 형태, outline이 필요하면 fill="none" stroke="currentColor"로 덮어쓴다
export const BookmarkIcon = (props) => (
  <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M5.5 3a1 1 0 0 0-1 1v13l5.5-3.3L15.5 17V4a1 1 0 0 0-1-1h-9Z" />
  </svg>
);

export const CalendarIcon = (props) => (
  <svg {...iconProps} {...props}>
    <rect x="3" y="4.5" width="14" height="12" rx="1.5" />
    <path d="M3 8h14M7 3v3M13 3v3" />
  </svg>
);

export const MailIcon = (props) => (
  <svg {...iconProps} {...props}>
    <rect x="3" y="5" width="14" height="10" rx="1.5" />
    <path d="M3.5 6 10 11l6.5-5" />
  </svg>
);

export const CameraIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h1.6l.9-1.4A1 1 0 0 1 8.85 4h2.3a1 1 0 0 1 .85.6L12.9 6h1.6A1.5 1.5 0 0 1 16 7.5v6A1.5 1.5 0 0 1 14.5 15h-9A1.5 1.5 0 0 1 4 13.5v-6Z" />
    <circle cx="10" cy="10" r="2.4" />
  </svg>
);

export const PlusIcon = (props) => (
  <svg {...iconProps} strokeWidth={2.2} {...props}>
    <path d="M10 4v12M4 10h12" />
  </svg>
);

export const EditIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M12.5 3.5 16 7l-9 9-4 1 1-4 8.5-9.5Z" />
  </svg>
);

export const TrashIcon = (props) => (
  <svg {...iconProps} {...props}>
    <path d="M4 5.5h12M8 5.5v-1a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1M6 5.5 6.6 16a1 1 0 0 0 1 1h4.8a1 1 0 0 0 1-1L14 5.5" />
  </svg>
);
