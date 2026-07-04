import client from './client';

export const getMe = async () => {
  return client.get('/users/me');
};

export const updateMe = async ({ nickname, password }) => {
  return client.patch('/users/me', { nickname, password });
};

export const searchUsers = async (nickname) => {
  return client.get('/users', { params: { nickname } });
};

export const getMyAnnotations = async (params) => {
  return client.get('/users/me/annotations', { params });
};

export const getFavoriteBooks = async (params) => {
  return client.get('/users/me/favorite-books', { params });
};

export const getFavoriteAnnotations = async (params) => {
  return client.get('/users/me/favorite-annotations', { params });
};

export const getMyGroups = async () => {
  return client.get('/users/me/groups');
};

export const getMyFriends = async () => {
  return client.get('/users/me/friends');
};

export const getFriendRequests = async (direction = 'received') => {
  return client.get('/users/me/friend-requests', { params: { direction } });
};
