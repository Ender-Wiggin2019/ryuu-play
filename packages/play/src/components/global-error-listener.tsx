import { useEffect } from 'react';

import { formatErrorMessage, showToast } from '@/lib/toast';

export function GlobalErrorListener(): null {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      showToast('error', 'Unexpected error', formatErrorMessage(event.error || event.message));
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      showToast('error', 'Unhandled promise rejection', formatErrorMessage(event.reason));
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, []);

  return null;
}
