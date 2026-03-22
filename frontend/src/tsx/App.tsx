import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/navbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';

const LandingPage = lazy(() => import('./Landing'));
const SignIn = lazy(() => import('./pages/Auth/SignIn'));
const Register = lazy(() => import('./pages/Auth/Register'));
const CreateProfile = lazy(() => import('./pages/Auth/CreateProfile'));
const JoinTeam = lazy(() => import('./pages/Auth/JoinTeam'));
const JoinByInvite = lazy(() => import('./pages/Auth/JoinByInvite'));
const DashboardLayout = lazy(() => import('./pages/Dashboard/DashboardLayout'));
const NotFound = lazy(() => import('./pages/NotFound'));

function RouteSpinner() {
  return (
    <div className="route-spinner">
      <div className="spinner lg" />
    </div>
  );
}

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
      <Suspense fallback={<RouteSpinner />}>
        <div key={location.pathname} className="page-enter">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/create-profile" element={<CreateProfile />} />
          <Route path="/auth/join-team" element={<JoinTeam />} />
          <Route path="/join" element={<JoinByInvite />} />
          <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </div>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router basename={import.meta.env.BASE_URL}>
        <AppContent />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
