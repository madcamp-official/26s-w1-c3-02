import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyPage from './pages/MyPage';

const EmptyPage = ({ title }) => <main>{title}</main>;

// 로그인하지 않은 상태여야 진입 가능한 라우트 (로그인, 회원가입)
function GuestRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

// 로그인해야만 진입 가능한 라우트
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/books/:bookId" element={<EmptyPage title="Book Detail" />} />
      <Route path="/annotations/:annotationId" element={<EmptyPage title="Annotation Detail" />} />
      <Route path="/search" element={<EmptyPage title="Search" />} />
      
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        }
      />
      
      <Route
        path="/mypage"
        element={
          <ProtectedRoute>
            <MyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <EmptyPage title="Friends" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <EmptyPage title="Groups" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          <ProtectedRoute>
            <EmptyPage title="Group Detail" />
          </ProtectedRoute>
        }
      />
      
      <Route path="/404" element={<EmptyPage title="Not Found" />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
