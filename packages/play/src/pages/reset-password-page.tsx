import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useFeedback } from '@/components/feedback-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { readApiErrorCode, useAuth } from '@/lib/auth-context';
import { isValidEmail } from '@/lib/validators';

const resetPasswordSchema = z.object({
  email: z.string().refine(isValidEmail, 'Please enter a valid email address.')
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage(): JSX.Element {
  const auth = useAuth();
  const feedback = useFeedback();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [error, setError] = useState('');
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setError('');
    try {
      await auth.sendResetPasswordMail(values.email);
      await feedback.alert(
        t('RESET_PASSWORD_SUCCESS', { defaultValue: 'Reset password email sent.' }),
        t('RESET_PASSWORD_TITLE', { defaultValue: 'Reset password' })
      );
      navigate('/login', { replace: true });
    } catch (e) {
      const code = readApiErrorCode(e);
      setError(code !== undefined ? `Request failed (${String(code)}).` : ((e as Error).message || 'Request failed.'));
    }
  };

  return (
    <Card className="mx-auto w-full max-w-[600px]">
      <CardHeader>
        <CardTitle>{t('RESET_PASSWORD_TITLE', { defaultValue: 'Reset password' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="app-form" onSubmit={form.handleSubmit(values => void onSubmit(values))}>
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem className="app-form-field">
                  <FormLabel>{t('LABEL_EMAIL', { defaultValue: 'Email' })}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" maxLength={128} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button disabled={auth.loading || form.formState.isSubmitting} type="submit">
              {t('RESET_PASSWORD_BUTTON', { defaultValue: 'Send reset link' })}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
