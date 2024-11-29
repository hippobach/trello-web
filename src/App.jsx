import { Route, Routes, Navigate } from 'react-router-dom';

import Auth from '~/pages/Auth/Auth';
import Board from '~/pages/Boards/_id';
import NotFound from '~/pages/404/NotFound';
import AccountVerification from '~/pages/Auth/AccountVerification';

function App() {
  return (
    <Routes>
      {/* Redirect Route */}
      <Route
        path="/"
        element={
          <Navigate to="/boards/66520fe4add70c243359d450" replace={true} />
        }
      />
      <Route path="/boards/:boardId" element={<Board />} />
      {/* Authentication */}
      <Route path="/login" element={<Auth />} />
      <Route path="/register" element={<Auth />} />
      <Route path="/account/verification" element={<AccountVerification />} />
      {/* 404 Not Found Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
