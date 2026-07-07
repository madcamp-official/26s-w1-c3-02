const KAKAO_JS_KEY = '23a28756f9fd75b16d0a5cbe63368807'; // 카카오 개발자 콘솔의 "JavaScript 키"로 교체
//이거 필요없으면 삭제

function ensureKakaoInit() {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
  }
}

export const KAKAO_REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;

// Kakao.Auth.login() 팝업은 카카오 정책상 폐지되어, 현재는 authorize()로
// 페이지 전체를 카카오 동의 화면으로 리다이렉트한 뒤 콜백에서 code를 받아야 한다.
export function kakaoAuthorize() {
  if (!window.Kakao) {
    throw new Error('카카오 SDK를 불러오지 못했습니다.');
  }

  ensureKakaoInit();
  window.Kakao.Auth.authorize({
    redirectUri: KAKAO_REDIRECT_URI,
    scope: 'profile_nickname, account_email',
  });
}
