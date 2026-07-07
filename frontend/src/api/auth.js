import client from './client';

export const register = async ({ nickname, email, password }) => {
  return client.post('/auth/register', { nickname, email, password });
};

export const checkNickname = async (nickname) => {
  return client.get('/auth/nickname-check', { params: { nickname } });
};

export const checkEmail = async (email) => {
  return client.get('/auth/email-check', { params: { email } });
};

export const login = async ({ email, password }) => {
  return client.post('/auth/login', { email, password });
};

export const kakaoLogin = async ({ code, redirectUri }) => {
  return client.post('/auth/kakao', { code, redirectUri });
};

export const logout = async () => {
  return client.post('/auth/logout');
};
