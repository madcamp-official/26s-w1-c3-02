// 그룹 API (B) — /groups, /groups/{id}/members, /groups/{id}/books, /groups/{id}/annotations
import client from './client';

export const createGroup = async ({ groupName, bookIds = [], memberIds = [] }) => {
  return client.post('/groups', { groupName, bookIds, memberIds });
};

export const getGroup = async (groupId) => {
  return client.get(`/groups/${groupId}`);
};

export const updateGroup = async (groupId, payload) => {
  return client.patch(`/groups/${groupId}`, payload);
};

export const deleteGroup = async (groupId) => {
  return client.delete(`/groups/${groupId}`);
};

export const addGroupMember = async (groupId, userId) => {
  return client.post(`/groups/${groupId}/members`, { userId });
};

export const removeGroupMember = async (groupId, userId) => {
  return client.delete(`/groups/${groupId}/members/${userId}`);
};

export const addGroupBook = async (groupId, bookId) => {
  return client.post(`/groups/${groupId}/books`, { bookId });
};

export const removeGroupBook = async (groupId, bookId) => {
  return client.delete(`/groups/${groupId}/books/${bookId}`);
};

export const getGroupAnnotations = async (groupId, params) => {
  return client.get(`/groups/${groupId}/annotations`, { params });
};
