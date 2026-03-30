import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

type RoutePageProps = {
  route: string;
};

export function RoutePage({ route }: RoutePageProps): JSX.Element {
  const { t } = useTranslation();
  const location = useLocation();
  const params = useParams();
  const replayHint = route === '/table/:gameId' && location.search.includes('mode=replay')
    ? sessionStorage.getItem(`replay:${params.gameId ?? ''}`)
    : null;

  return (
    <div className="route-page">
      <h2 className="route-page-title">{route}</h2>
      <p className="route-page-description">
        {t('MIGRATION_PLACEHOLDER_MESSAGE', {
          defaultValue: 'React migration placeholder. This route is ready for feature-by-feature migration.'
        })}
      </p>
      {replayHint && (
        <p className="route-page-description mt-2">
          Replay payload is staged in session storage for this table route.
        </p>
      )}
    </div>
  );
}
