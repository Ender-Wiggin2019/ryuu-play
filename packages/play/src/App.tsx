import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { showToast } from '@/lib/toast';
import { useTranslation } from 'react-i18next';

export function App(): JSX.Element {
  const { i18n } = useTranslation();
  const location = useLocation();
  const auth = useAuth();

  const isAuthRoute = ['/login', '/register', '/reset-password'].some(path =>
    location.pathname.startsWith(path)
  );

  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.toggle('dark');
    root.dataset.theme = isDark ? 'dark' : 'light';
  };

  return (
    <div className="app-shell">
      {!isAuthRoute && (
        <aside className="app-sidebar">
          <h1 className="app-title">RyuuPlay</h1>
          <nav className="mt-4 grid gap-2 text-sm">
            <NavLink to="/games">Games</NavLink>
            <NavLink to="/ranking">Ranking</NavLink>
            <NavLink to="/replays">Replays</NavLink>
            <NavLink to="/deck">Deck</NavLink>
            <NavLink to="/testing">Testing</NavLink>
            <NavLink to="/scenario">Scenario</NavLink>
          </nav>
        </aside>
      )}
      <main className="app-main">
        <header className="app-header">
          <div className="app-header-actions">
            <Button size="sm" variant="outline" onClick={() => i18n.changeLanguage('en')}>
              EN
            </Button>
            <Button size="sm" variant="outline" onClick={() => i18n.changeLanguage('zh')}>
              中文
            </Button>
            <Button size="sm" variant="secondary" onClick={toggleTheme}>
              Theme
            </Button>
            {auth.isLoggedIn && (
              <Button size="sm" variant="destructive" onClick={() => {
                auth.logout();
                showToast('success', 'Logged out');
              }}>
                Logout
              </Button>
            )}
          </div>
        </header>
        <section className="app-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
