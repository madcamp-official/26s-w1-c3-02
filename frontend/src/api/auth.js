import client from './client';

export const register = async ({ nickname, email, password }) => {
  return client.post('/auth/register', { nickname, email, password });
};

export const login = async ({ email, password }) => {
  return client.post('/auth/login', { email, password });
};

export const logout = async () => {
  return client.post('/auth/logout');
};
