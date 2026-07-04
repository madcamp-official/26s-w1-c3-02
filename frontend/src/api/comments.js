// 댓글 API (A) — /annotations/{id}/comments, /comments/{id}
import client from './client';

export const createComment = (annotationId, payload) => {
  return client.post(`/annotations/${annotationId}/comments`, payload);
};

export const getComments = (annotationId, params) => {
  return client.get(`/annotations/${annotationId}/comments`, { params });
};

export const updateComment = (commentId, payload) => {
  return client.patch(`/comments/${commentId}`, payload);
};

export const deleteComment = (commentId) => {
  return client.delete(`/comments/${commentId}`);
};