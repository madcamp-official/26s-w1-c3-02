import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { kakaoLogin } from '../api/auth';
import { KAKAO_REDIRECT_URI } from '../lib/kakao';
import { getErrorMessage } from '../utils/error';

export default function KakaoCallbackPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    async function run() {
      if (error || !code) {
        navigate('/login', { replace: true, state: { kakaoError: '카카오 로그인이 취소되었습니다.' } });
        return;
      }

      try {
        const response = await kakaoLogin({ code, redirectUri: KAKAO_REDIRECT_URI });
        login({ accessToken: response.accessToken, user: response.user });
        navigate(response.isNewUser ? '/onboarding/nickname' : '/', { replace: true });
      } catch (err) {
        navigate('/login', {
          replace: true,
          state: { kakaoError: getErrorMessage(err) || '카카오 로그인에 실패했습니다.' },
        });
      }
    }

    run();
  }, [searchParams, navigate, login]);

  return (
    <main className="page min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-74px)] flex items-center justify-center">
      <p className="text-sm text-text-muted">카카오 로그인 처리 중...</p>
    </main>
  );
}
