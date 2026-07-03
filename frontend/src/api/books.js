// 도서 API (A) — /books, /books/{id}, /books/{id}/favorite
import client from './client';

export const getBooks = (params) => {
  return client.get('/books', { params });
};

export const getBook = (bookId) => {
  return client.get(`/books/${bookId}`);
};

export const createBook = (payload) => {
  return client.post('/books', payload);
};

export const favoriteBook = (bookId) => {
  return client.post(`/books/${bookId}/favorite`);
};

export const unfavoriteBook = (bookId) => {
  return client.delete(`/books/${bookId}/favorite`);
};

export const getFavoriteBooks = (params) => {
  return client.get('/users/me/favorite-books', { params });
};