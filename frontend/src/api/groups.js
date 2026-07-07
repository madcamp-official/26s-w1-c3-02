// 그룹 API (B) - /groups, /groups/{id}/members, /groups/{id}/books, /groups/{id}/annotations
import client from './client';

export const createGroup = ({ groupName, bookIds = [], memberIds = [] }) => {
  return client.post('/groups', { groupName, bookIds, memberIds });
};

export const getGroup = (groupId) => {
  return client.get(`/groups/${groupId}`);
};

export const updateGroup = (groupId, payload) => {
  return client.patch(`/groups/${groupId}`, payload);
};

export const deleteGroup = (groupId) => {
  return client.delete(`/groups/${groupId}`);
};

export const inviteGroupMember = (groupId, userId) => {
  return client.post(`/groups/${groupId}/members`, { userId });
};

export const removeGroupMember = (groupId, userId) => {
  return client.delete(`/groups/${groupId}/members/${userId}`);
};

export const acceptGroupInvitation = (groupId, userId) => {
  return client.post(`/groups/${groupId}/members/${userId}/accept`);
};

export const getGroupPendingInvites = (groupId) => {
  return client.get(`/groups/${groupId}/invitations`);
};

export const addGroupBook = (groupId, bookId) => {
  return client.post(`/groups/${groupId}/books`, { bookId });
};

export const removeGroupBook = (groupId, bookId) => {
  return client.delete(`/groups/${groupId}/books/${bookId}`);
};

export const createGroupNotice = (groupId, content) => {
  return client.post(`/groups/${groupId}/notice`, { content });
};

export const getGroupAnnotations = (groupId, params) => {
  return client.get(`/groups/${groupId}/annotations`, { params });
};
