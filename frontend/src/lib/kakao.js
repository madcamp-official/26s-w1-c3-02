const KAKAO_JS_KEY = '23a28756f9fd75b16d0a5cbe63368807'; // 카카오 개발자 콘솔의 "JavaScript 키"로 교체

function ensureKakaoInit() {
  if (window.Kakao && !window.Kakao.isInitialized()) {
    window.Kakao.init(KAKAO_JS_KEY);
  }
}

export function kakaoAuthLogin() {
  return new Promise((resolve, reject) => {
    if (!window.Kakao) {
      reject(new Error('카카오 SDK를 불러오지 못했습니다.'));
      return;
    }

    ensureKakaoInit();
    window.Kakao.Auth.login({
      scope: 'profile_nickname, account_email',
      success: resolve,
      fail: reject,
    });
  });
}
