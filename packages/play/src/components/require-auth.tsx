import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/lib/auth-context';

export function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  const auth = useAuth();
  const location = useLocation();

  if (auth.loading) {
    return <div className="ptcg-u-padding">Loading session...</div>;
  }

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  }

  return children;
}
