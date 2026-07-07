// 장르(중분류) 집계 유틸 — 마이페이지 취향 분석과 사용자 프로필에서 공유.

// genreCode: 알라딘 categoryName 원문("국내도서>소설/시/희곡>판타지/환상문학>...").
// 첫 '>'와 두 번째 '>' 사이의 중분류(위 예시라면 "소설/시/희곡")를 취향 기준으로 쓴다.
// 세그먼트 구조가 없는(중분류가 없는) 예전/축약 코드는 집계에서 제외(null 반환).
export const parseGenreLabel = (genreCode) => {
  const parts = (genreCode || '').split('>').map((s) => s.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[1] : null;
};

// 도넛 차트 색상 — 상위 5개 장르 + 나머지(기타)는 회색 고정
export const GENRE_CHART_COLORS = ['#2a78d6', '#1baf7a', '#eda100', '#008300', '#8a63d2', '#c65b6e'];
export const GENRE_OTHER_COLOR = '#9aa4b5';

// genreCode 배열 → 상위 5개 장르 세그먼트 + 나머지 "기타", 그리고 집계된 총합을 반환.
// 반환: { summary: [{ key, label, value, color }], total }
export const buildGenreSummary = (genreCodes) => {
  const counts = new Map();
  (genreCodes || []).forEach((code) => {
    const label = parseGenreLabel(code);
    if (label) {
      counts.set(label, (counts.get(label) || 0) + 1);
    }
  });

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 5);
  const otherCount = sorted.slice(5).reduce((sum, [, count]) => sum + count, 0);

  const summary = top.map(([label, value], i) => ({
    key: label,
    label,
    value,
    color: GENRE_CHART_COLORS[i],
  }));
  if (otherCount > 0) {
    summary.push({ key: '__other__', label: '기타', value: otherCount, color: GENRE_OTHER_COLOR });
  }

  const total = summary.reduce((sum, g) => sum + g.value, 0);
  return { summary, total };
};
