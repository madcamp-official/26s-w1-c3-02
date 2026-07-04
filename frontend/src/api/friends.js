import client from './client';

export const sendFriendRequest = async (friendId) => {
  return client.post('/friends', { friendId });
};

export const acceptFriendRequest = async (userId) => {
  return client.post(`/friends/${userId}/accept`);
};

export const deleteFriendRelationship = async (userId) => {
  return client.delete(`/friends/${userId}`);
};
