import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/LoadingSpinner';
import { resolveRedirect } from '../utils/redirect';

export function ProtectedRoute({ role }) {
  const { user, booting, homePath } = useAuth();
  const location = useLocation();

  if (booting) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to={homePath} replace />;

  return <Outlet />;
}

export function GuestRoute() {
  const { user, booting } = useAuth();
  const location = useLocation();

  if (booting) return <PageLoader />;
  if (user) return <Navigate to={resolveRedirect(location.state?.from, user)} replace />;

  return <Outlet />;
}
