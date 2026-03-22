import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/navbar';
import LandingPage from './Landing';
import SignIn from './pages/Auth/SignIn';
import Register from './pages/Auth/Register';
import CreateProfile from './pages/Auth/CreateProfile';
import JoinTeam from './pages/Auth/JoinTeam';
import JoinByInvite from './pages/Auth/JoinByInvite';
import DashboardLayout from './pages/Dashboard/DashboardLayout';
import { useAuth } from './context/AuthContext';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { currentUser, startupId } = useAuth();
  if (!currentUser || !startupId) {
    return <Navigate to="/auth/sign-in" replace />;
  }
  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const showNavbar = !location.pathname.startsWith('/dashboard');

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/sign-in" element={<SignIn />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/create-profile" element={<CreateProfile />} />
        <Route path="/auth/join-team" element={<JoinTeam />} />
        <Route path="/join" element={<JoinByInvite />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppContent />
    </Router>
  );
}

export default App;
