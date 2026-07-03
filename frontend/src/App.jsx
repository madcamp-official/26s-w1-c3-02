import { Navigate, Route, Routes } from 'react-router-dom';

import BookDetailPage from './pages/BookDetailPage.jsx';
import HomePage from './pages/HomePage.jsx';

const EmptyPage = ({ title }) => <main>{title}</main>;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/books/:bookId" element={<BookDetailPage />} />
      <Route path="/annotations/:annotationId" element={<EmptyPage title="Annotation Detail" />} />
      <Route path="/search" element={<EmptyPage title="Search" />} />
      <Route path="/login" element={<EmptyPage title="Login" />} />
      <Route path="/register" element={<EmptyPage title="Register" />} />
      <Route path="/mypage" element={<EmptyPage title="My Page" />} />
      <Route path="/friends" element={<EmptyPage title="Friends" />} />
      <Route path="/groups" element={<EmptyPage title="Groups" />} />
      <Route path="/groups/:groupId" element={<EmptyPage title="Group Detail" />} />
      <Route path="/404" element={<EmptyPage title="Not Found" />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
