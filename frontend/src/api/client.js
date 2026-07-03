import axios from 'axios';

let accessToken = null;

export class ApiError extends Error {
  constructor({ code, message, status, details }) {
    super(message || 'API request failed');
    this.name = 'ApiError';
    this.code = code || 'UNKNOWN_ERROR';
    this.status = status;
    this.details = details;
  }
}

export const setAccessToken = (token) => {
  accessToken = token || null;
};

export const getAccessToken = () => accessToken;

export const clearAccessToken = () => {
  accessToken = null;
};

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

client.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const payload = error.response?.data;
    const apiError = payload?.error;

    return Promise.reject(
      new ApiError({
        code: apiError?.code,
        message: apiError?.message || error.message,
        status,
        details: payload,
      }),
    );
  },
);

export const getPageData = (response) => ({
  data: response?.data ?? [],
  pagination: response?.pagination ?? null,
});

export default client;
