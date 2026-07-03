import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearAccessToken, setAccessToken as setClientAccessToken } from '../api/client';

const TOKEN_STORAGE_KEY = 'annotation-note.accessToken';
const USER_STORAGE_KEY = 'annotation-note.user';

const AuthContext = createContext(null);

const readStorage = (key) => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
};

const removeStorage = (key) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable in private browsing or restricted environments.
  }
};

const readStoredUser = () => {
  const rawUser = readStorage(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    removeStorage(USER_STORAGE_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(() => readStorage(TOKEN_STORAGE_KEY));
  const [user, setUserState] = useState(() => readStoredUser());

  useEffect(() => {
    setClientAccessToken(accessToken);
  }, [accessToken]);

  const login = ({ accessToken: nextAccessToken, user: nextUser = null }) => {
    setAccessTokenState(nextAccessToken);
    setUserState(nextUser);
    setClientAccessToken(nextAccessToken);
    writeStorage(TOKEN_STORAGE_KEY, nextAccessToken);

    if (nextUser) {
      writeStorage(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      removeStorage(USER_STORAGE_KEY);
    }
  };

  const logout = () => {
    setAccessTokenState(null);
    setUserState(null);
    clearAccessToken();
    removeStorage(TOKEN_STORAGE_KEY);
    removeStorage(USER_STORAGE_KEY);
  };

  const setUser = (nextUser) => {
    setUserState(nextUser);

    if (nextUser) {
      writeStorage(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      removeStorage(USER_STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: Boolean(accessToken),
      login,
      logout,
      setUser,
    }),
    [accessToken, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
