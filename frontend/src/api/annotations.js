// 주석 카드 API (A) — /annotations, /books/{id}/annotations, /annotations/search, /annotations/{id}/favorite
import client from './client';

export const createAnnotation = (payload) => {
  return client.post('/annotations', payload);
};

export const getBookAnnotations = (bookId, params) => {
  return client.get(`/books/${bookId}/annotations`, { params });
};

export const getAnnotation = (annotationId) => {
  return client.get(`/annotations/${annotationId}`);
};

export const updateAnnotation = (annotationId, payload) => {
  return client.patch(`/annotations/${annotationId}`, payload);
};

export const deleteAnnotation = (annotationId) => {
  return client.delete(`/annotations/${annotationId}`);
};

export const searchAnnotations = (params) => {
  return client.get('/annotations/search', { params });
};

export const getMyAnnotations = (params) => {
  return client.get('/users/me/annotations', { params });
};

export const favoriteAnnotation = (annotationId) => {
  return client.post(`/annotations/${annotationId}/favorite`);
};

export const unfavoriteAnnotation = (annotationId) => {
  return client.delete(`/annotations/${annotationId}/favorite`);
};

export const getFavoriteAnnotations = (params) => {
  return client.get('/users/me/favorite-annotations', { params });
};