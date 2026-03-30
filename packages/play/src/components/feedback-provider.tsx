import { createContext, useContext, useMemo, useState } from 'react';
import { Toaster } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type FeedbackRequest =
  | {
      type: 'alert';
      title?: string;
      message: string;
      resolve: () => void;
    }
  | {
      type: 'confirm';
      title?: string;
      message: string;
      confirmLabel?: string;
      cancelLabel?: string;
      resolve: (value: boolean) => void;
    }
  | {
      type: 'prompt';
      title?: string;
      message: string;
      defaultValue?: string;
      placeholder?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      resolve: (value: string | undefined) => void;
    };

type FeedbackContextValue = {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, options?: { title?: string; confirmLabel?: string; cancelLabel?: string }) => Promise<boolean>;
  prompt: (
    message: string,
    options?: { title?: string; defaultValue?: string; placeholder?: string; confirmLabel?: string; cancelLabel?: string }
  ) => Promise<string | undefined>;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [request, setRequest] = useState<FeedbackRequest | null>(null);
  const [promptValue, setPromptValue] = useState('');

  const close = () => setRequest(null);

  const value = useMemo<FeedbackContextValue>(() => ({
    alert: (message, title) => new Promise<void>(resolve => {
      setRequest({ type: 'alert', title, message, resolve });
    }),
    confirm: (message, options) => new Promise<boolean>(resolve => {
      setRequest({
        type: 'confirm',
        title: options?.title,
        message,
        confirmLabel: options?.confirmLabel,
        cancelLabel: options?.cancelLabel,
        resolve
      });
    }),
    prompt: (message, options) => new Promise<string | undefined>(resolve => {
      setPromptValue(options?.defaultValue ?? '');
      setRequest({
        type: 'prompt',
        title: options?.title,
        message,
        defaultValue: options?.defaultValue,
        placeholder: options?.placeholder,
        confirmLabel: options?.confirmLabel,
        cancelLabel: options?.cancelLabel,
        resolve
      });
    })
  }), []);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      <Toaster richColors closeButton position="top-right" />
      <Dialog
        open={request !== null}
        onOpenChange={open => {
          if (open || request === null) {
            return;
          }
          if (request.type === 'confirm') {
            request.resolve(false);
          } else if (request.type === 'prompt') {
            request.resolve(undefined);
          } else {
            request.resolve();
          }
          close();
        }}
      >
        <DialogContent>
          {request && (
            <>
              <DialogHeader>
                <DialogTitle>{request.title || 'Notice'}</DialogTitle>
                <DialogDescription>{request.message}</DialogDescription>
              </DialogHeader>

              {request.type === 'prompt' && (
                <Input
                  autoFocus
                  value={promptValue}
                  onChange={event => setPromptValue(event.target.value)}
                  placeholder={request.placeholder}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      const trimmed = promptValue.trim();
                      request.resolve(trimmed ? trimmed : undefined);
                      close();
                    }
                  }}
                />
              )}

              <DialogFooter>
                {request.type !== 'alert' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (request.type === 'confirm') {
                        request.resolve(false);
                      } else {
                        request.resolve(undefined);
                      }
                      close();
                    }}
                  >
                    {request.cancelLabel || 'Cancel'}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    if (request.type === 'confirm') {
                      request.resolve(true);
                    } else if (request.type === 'prompt') {
                      const trimmed = promptValue.trim();
                      request.resolve(trimmed ? trimmed : undefined);
                    } else {
                      request.resolve();
                    }
                    close();
                  }}
                >
                  {request.type === 'alert' ? 'OK' : request.confirmLabel || 'Confirm'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const value = useContext(FeedbackContext);
  if (!value) {
    throw new Error('useFeedback must be used within FeedbackProvider.');
  }
  return value;
}
