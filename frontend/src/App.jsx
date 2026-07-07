import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import KakaoCallbackPage from './pages/KakaoCallbackPage';
import RegisterPage from './pages/RegisterPage';
import MyPage from './pages/MyPage';
import BookDetailPage from './pages/BookDetailPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import AnnotationFormPage from './pages/AnnotationFormPage.jsx';
import AnnotationDetailPage from './pages/AnnotationDetailPage.jsx';
import GroupDetailPage from './pages/GroupDetailPage.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';

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
      <Route path="/books/:bookId" element={<BookDetailPage />} />
      <Route
        path="/annotations/new"
        element={
          <ProtectedRoute>
            <AnnotationFormPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/annotations/:annotationId/edit"
        element={
          <ProtectedRoute>
            <AnnotationFormPage />
          </ProtectedRoute>
        }
      />
      <Route path="/annotations/:annotationId" element={<AnnotationDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/users/:userId" element={<UserProfilePage />} />
      
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
      <Route path="/auth/kakao/callback" element={<KakaoCallbackPage />} />

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
            <GroupsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups/:groupId"
        element={
          <ProtectedRoute>
            <GroupDetailPage />
          </ProtectedRoute>
        }
      />
      
      <Route path="/404" element={<EmptyPage title="Not Found" />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
