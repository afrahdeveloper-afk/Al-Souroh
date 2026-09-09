import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../providers/AuthProvider';
import { useLang } from '../../providers/LanguageProvider';

/**
 * Route guard for every `/dashboard/*` screen except `/dashboard/login`
 * (mounted as a parent `<Route>` around the CMS routes in App.tsx). Redirects
 * to Login, remembering the attempted path via router state so Login can
 * send the admin back where they meant to go after signing in.
 */
export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useLang();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dashboard-bg">
        <span className="text-dashboard-table-body text-dashboard-muted-foreground">
          {t('جاري التحقق من الجلسة...', 'Checking your session...')}
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/dashboard/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
