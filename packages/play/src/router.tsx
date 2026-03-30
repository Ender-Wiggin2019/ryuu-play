import { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import { App } from '@/App';
import { AppErrorBoundary } from '@/components/app-error-boundary';
import { RequireAuth } from '@/components/require-auth';
import { RoutePage } from '@/pages/route-page';

const LoginPage = lazy(async () => import('@/pages/login-page').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(async () => import('@/pages/register-page').then(module => ({ default: module.RegisterPage })));
const ResetPasswordPage = lazy(async () => import('@/pages/reset-password-page').then(module => ({ default: module.ResetPasswordPage })));
const SetNewPasswordPage = lazy(async () => import('@/pages/set-new-password-page').then(module => ({ default: module.SetNewPasswordPage })));
const GamesPage = lazy(async () => import('@/pages/games-page').then(module => ({ default: module.GamesPage })));
const RankingPage = lazy(async () => import('@/pages/ranking-page').then(module => ({ default: module.RankingPage })));
const ReplaysPage = lazy(async () => import('@/pages/replays-page').then(module => ({ default: module.ReplaysPage })));
const DeckPage = lazy(async () => import('@/pages/deck-page').then(module => ({ default: module.DeckPage })));
const DeckEditPage = lazy(async () => import('@/pages/deck-edit-page').then(module => ({ default: module.DeckEditPage })));
const MessagesPage = lazy(async () => import('@/pages/messages-page').then(module => ({ default: module.MessagesPage })));
const ProfilePage = lazy(async () => import('@/pages/profile-page').then(module => ({ default: module.ProfilePage })));
const TablePage = lazy(async () => import('@/pages/table-page').then(module => ({ default: module.TablePage })));
const TestingPage = lazy(async () => import('@/pages/testing-page').then(module => ({ default: module.TestingPage })));
const ScenarioPage = lazy(async () => import('@/pages/scenario-page').then(module => ({ default: module.ScenarioPage })));

function withSuspense(element: JSX.Element): JSX.Element {
  return (
    <Suspense fallback={<div className="app-panel">Loading...</div>}>
      {element}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <AppErrorBoundary />,
    children: [
      { index: true, element: <Navigate replace to="/games" /> },
      { path: 'login', element: withSuspense(<LoginPage />) },
      { path: 'register', element: withSuspense(<RegisterPage />) },
      { path: 'reset-password', element: withSuspense(<ResetPasswordPage />) },
      { path: 'reset-password/:token', element: withSuspense(<SetNewPasswordPage />) },
      {
        path: 'games',
        element: <RequireAuth>{withSuspense(<GamesPage />)}</RequireAuth>
      },
      {
        path: 'ranking',
        element: <RequireAuth>{withSuspense(<RankingPage />)}</RequireAuth>
      },
      {
        path: 'replays',
        element: <RequireAuth>{withSuspense(<ReplaysPage />)}</RequireAuth>
      },
      {
        path: 'deck',
        element: <RequireAuth>{withSuspense(<DeckPage />)}</RequireAuth>
      },
      {
        path: 'deck/:deckId',
        element: <RequireAuth>{withSuspense(<DeckEditPage />)}</RequireAuth>
      },
      {
        path: 'message',
        element: <RequireAuth>{withSuspense(<MessagesPage />)}</RequireAuth>
      },
      {
        path: 'message/:userId',
        element: <RequireAuth>{withSuspense(<MessagesPage />)}</RequireAuth>
      },
      {
        path: 'profile/:userId',
        element: <RequireAuth>{withSuspense(<ProfilePage />)}</RequireAuth>
      },
      {
        path: 'table/:gameId',
        element: <RequireAuth>{withSuspense(<TablePage />)}</RequireAuth>
      },
      {
        path: 'testing',
        element: <RequireAuth>{withSuspense(<TestingPage />)}</RequireAuth>
      },
      {
        path: 'scenario',
        element: <RequireAuth>{withSuspense(<ScenarioPage />)}</RequireAuth>
      },
      { path: '*', element: <RoutePage route="*" /> }
    ]
  }
]);
