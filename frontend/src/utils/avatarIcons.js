// 선택 가능한 프로필 아이콘 프리셋 — 사용자가 이미지를 업로드하는 대신 이 중 하나를 고른다.
// 기본 아이콘 1종 + 사람 아이콘 4종(남자 2 · 여자 2) + 동물 아이콘 6종.
// 키 목록은 backend/accounts/models.py의 AVATAR_ICON_KEYS와 반드시 동기화할 것.
export const AVATAR_ICON_OPTIONS = [
  { key: 'basic', emoji: '👤', bg: 'bg-gray-300' },
  { key: 'man1', emoji: '👨', bg: 'bg-accent-blue' },
  { key: 'man2', emoji: '👦', bg: 'bg-accent-green' },
  { key: 'woman1', emoji: '👩', bg: 'bg-accent-rose' },
  { key: 'woman2', emoji: '👧', bg: 'bg-primary-soft' },
  { key: 'cat', emoji: '🐱', bg: 'bg-accent-rose' },
  { key: 'fox', emoji: '🦊', bg: 'bg-accent-cream' },
  { key: 'bear', emoji: '🐻', bg: 'bg-accent-green' },
  { key: 'rabbit', emoji: '🐰', bg: 'bg-primary-soft' },
  { key: 'panda', emoji: '🐼', bg: 'bg-accent-blue' },
];
