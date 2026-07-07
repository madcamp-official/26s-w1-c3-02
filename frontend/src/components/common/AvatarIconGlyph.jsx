// 'basic' 키는 이모지 대신 페이스북/카카오톡 기본 프로필처럼 하얀 인물 실루엣으로 렌더링한다.
// width/height를 1em으로 둬 부모의 font-size(텍스트 크기 클래스)를 그대로 따라간다.
export default function AvatarIconGlyph({ iconKey, emoji }) {
  if (iconKey === 'basic') {
    return (
      <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" className="text-white" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7v1H4v-1z" />
      </svg>
    );
  }

  return emoji;
}
