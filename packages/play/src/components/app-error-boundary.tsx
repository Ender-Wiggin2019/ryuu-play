import { useEffect } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatErrorMessage, showToast } from '@/lib/toast';

export function AppErrorBoundary(): JSX.Element {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : formatErrorMessage(error);

  useEffect(() => {
    showToast('error', 'Page crashed', message);
  }, [message]);

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="text-sm text-muted-foreground">{message}</p>
        <div className="app-inline-actions">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Button variant="outline" onClick={() => window.history.back()}>Back</Button>
        </div>
      </CardContent>
    </Card>
  );
}
