import { HomeIcon, MessageIcon, StarIcon, BookIcon, UsersIcon, UserIcon, SettingsIcon } from '../components/icons';

// 마이페이지 좌측 사이드바 / 모바일 메뉴 드로어에서 공통으로 쓰는 탭 목록.
export const MYPAGE_NAV_ITEMS = [
  { key: 'dashboard', label: '마이페이지', Icon: HomeIcon },
  { key: 'annotations', label: '내 주석', Icon: MessageIcon },
  { key: 'favoriteAnnotations', label: '즐겨찾기한 주석', Icon: StarIcon },
  { key: 'favoriteBooks', label: '내 서재', Icon: BookIcon },
  { key: 'groups', label: '그룹 라운지', Icon: UsersIcon },
  { key: 'friends', label: '친구', Icon: UserIcon },
  { key: 'settings', label: '설정', Icon: SettingsIcon },
];
