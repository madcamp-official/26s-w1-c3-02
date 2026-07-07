import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi, kakaoLogin as kakaoLoginApi } from '../api/auth';
import { kakaoAuthLogin } from '../lib/kakao';
import { getErrorMessage } from '../utils/error';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = '이메일을 입력해 주세요.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = '올바른 이메일 형식이 아닙니다.';
    }

    if (!password) {
      errors.password = '비밀번호를 입력해 주세요.';
    } else if (password.length < 4) {
      errors.password = '비밀번호는 최소 4자 이상이어야 합니다.';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setFormError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginApi({ email, password });
      login({ accessToken: response.accessToken, user: response.user });
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      const errMsg = getErrorMessage(err);
      setFormError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setFormError('');
    setIsKakaoLoading(true);

    try {
      const authObj = await kakaoAuthLogin();
      const response = await kakaoLoginApi({ accessToken: authObj.access_token });
      login({ accessToken: response.accessToken, user: response.user });
      navigate('/', { replace: true });
    } catch (err) {
      const isCancelled = err?.error === 'access_denied' || err?.type === 'cancel' || err?.error === 'popup_closed_by_user';
      if (!isCancelled) {
        console.error(err);
        setFormError(getErrorMessage(err) || '카카오 로그인에 실패했습니다.');
      }
    } finally {
      setIsKakaoLoading(false);
    }
  };

  return (
    <main className="page min-h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="container">
        <form onSubmit={handleSubmit} className="card card--padded mx-auto grid max-w-[420px] gap-4">
          <div className="text-center mb-2">
            <h1 className="page-title mb-1">문장서재</h1>
            <p className="text-sm text-text-muted">책 속 문장을 모으고 주석을 나누는 공간</p>
          </div>

          {location.state?.registered && (
            <div className="bg-[#e4eee5] text-[#496a54] text-center rounded-sm p-2.5 text-xs font-bold border border-[#d2dfd4]">
              회원가입이 완료되었습니다. 로그인해 주세요.
            </div>
          )}

          <label className="form-field">
            <span className="form-label">이메일</span>
            <input
              className={`input ${fieldErrors.email ? 'input--error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.email && <span className="form-error">{fieldErrors.email}</span>}
          </label>

          <label className="form-field">
            <span className="form-label">비밀번호</span>
            <input
              className={`input ${fieldErrors.password ? 'input--error' : ''}`}
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
          </label>

          {formError && (
            <div className="form-error text-center mt-1 text-sm font-semibold">
              {formError}
            </div>
          )}

          <button className="button button--primary button--lg mt-2" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                로그인 중
              </>
            ) : (
              '로그인'
            )}
          </button>

          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="h-px flex-1 bg-line" />또는<span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            className="button button--kakao button--lg"
            onClick={handleKakaoLogin}
            disabled={isKakaoLoading}
          >
            {isKakaoLoading ? '카카오 로그인 중' : '카카오로 로그인하기'}
          </button>

          <p className="mt-4 text-center text-sm text-text-muted">
            계정이 없으신가요?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              회원가입
            </Link>
          </p>

          <p className="text-center text-sm text-text-muted">
            <Link to="/" className="font-bold text-primary hover:underline">
              로그인 없이 둘러보기 →
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
