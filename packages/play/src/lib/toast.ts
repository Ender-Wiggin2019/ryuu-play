import { toast } from 'sonner';

type ToastLevel = 'info' | 'success' | 'warning' | 'error';

export function showToast(level: ToastLevel, message: string, description?: string): void {
  const payload = description ? { description } : undefined;

  switch (level) {
    case 'success':
      toast.success(message, payload);
      return;
    case 'warning':
      toast.warning(message, payload);
      return;
    case 'error':
      toast.error(message, payload);
      return;
    default:
      toast(message, payload);
  }
}

export function formatErrorMessage(error: unknown, fallback = 'Unexpected error.'): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string' && error) {
    return error;
  }
  return fallback;
}
