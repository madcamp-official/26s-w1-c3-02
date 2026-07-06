// 표시용 포맷 유틸 — 마이페이지와 사용자 프로필에서 공유.

// 주석 유형별 라벨/태그 색상
export const ANNOTATION_TYPE_META = {
  QUESTION: { label: '질문', tagClass: 'tag--cream' },
  DISCUSSION: { label: '토론', tagClass: 'tag--green' },
  REVIEW: { label: '감상', tagClass: 'tag--rose' },
};
export const getTypeMeta = (type) => ANNOTATION_TYPE_META[type] || { label: '일반', tagClass: '' };

// 큰 숫자를 "1,284" / "1.2K" 형태로 축약
export const formatCount = (n) => {
  const value = n || 0;
  if (value < 1000) return value.toLocaleString('en-US');
  const k = value / 1000;
  return `${Number.isInteger(k) ? k.toFixed(0) : k.toFixed(1)}K`;
};

// "2시간 전" / "어제" / "3일 전" 형태의 상대 시간 표시 (그 이상은 날짜로 폴백)
export const formatRelativeTime = (isoString, formatDate) => {
  if (!isoString) return '';
  const diffMinutes = Math.floor((Date.now() - new Date(isoString).getTime()) / 60000);
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return '어제';
  if (diffDays < 7) return `${diffDays}일 전`;
  return formatDate(isoString);
};
