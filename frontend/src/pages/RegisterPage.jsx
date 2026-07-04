import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/auth';
import { getErrorMessage } from '../utils/error';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  const validate = () => {
    const errors = {};
    if (!nickname.trim()) {
      errors.nickname = '닉네임을 입력해 주세요.';
    } else if (nickname.length < 2) {
      errors.nickname = '닉네임은 최소 2자 이상이어야 합니다.';
    }

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

    if (password !== confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
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
      await registerApi({ nickname, email, password });
      navigate('/login', { state: { registered: true }, replace: true });
    } catch (err) {
      console.error(err);
      const errMsg = getErrorMessage(err);
      setFormError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page min-h-[calc(100vh-72px)] flex items-center justify-center">
      <div className="container">
        <form onSubmit={handleSubmit} className="card card--padded mx-auto grid max-w-[420px] gap-4">
          <div className="text-center mb-2">
            <h1 className="page-title mb-1">회원가입</h1>
            <p className="text-sm text-text-muted">문장서재의 새로운 멤버가 되어보세요</p>
          </div>

          <label className="form-field">
            <span className="form-label">닉네임</span>
            <input
              className={`input ${fieldErrors.nickname ? 'input--error' : ''}`}
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.nickname && <span className="form-error">{fieldErrors.nickname}</span>}
          </label>

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
              placeholder="비밀번호 (최소 4자)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.password && <span className="form-error">{fieldErrors.password}</span>}
          </label>

          <label className="form-field">
            <span className="form-label">비밀번호 확인</span>
            <input
              className={`input ${fieldErrors.confirmPassword ? 'input--error' : ''}`}
              type="password"
              placeholder="비밀번호 다시 입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            {fieldErrors.confirmPassword && <span className="form-error">{fieldErrors.confirmPassword}</span>}
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
                가입 중
              </>
            ) : (
              '회원가입'
            )}
          </button>

          <p className="mt-4 text-center text-sm text-text-muted">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}