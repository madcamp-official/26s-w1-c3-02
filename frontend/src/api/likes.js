// 좋아요 API (A) — /likes
import client from './client';

export const like = (payload) => {
  return client.post('/likes', payload);
};

export const unlike = (params) => {
  return client.delete('/likes', { params });
};