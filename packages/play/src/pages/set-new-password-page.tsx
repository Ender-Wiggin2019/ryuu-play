import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { isValidPassword } from '@/lib/validators';

const setNewPasswordSchema = z.object({
  password: z.string().refine(isValidPassword, 'Password must be 5-32 chars and cannot contain spaces.'),
  confirmPassword: z.string()
}).refine(values => values.password === values.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.'
});

type SetNewPasswordFormValues = z.infer<typeof setNewPasswordSchema>;

export function SetNewPasswordPage(): JSX.Element {
  const { token = '' } = useParams();
  const auth = useAuth();
  const feedback = useFeedback();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [error, setError] = useState('');
  const form = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordSchema),
    mode: 'onTouched',
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (values: SetNewPasswordFormValues) => {
    setError('');
    try {
      await auth.setNewPassword(token, values.password);
      await feedback.alert(
        t('SET_PASSWORD_SUCCESS', { defaultValue: 'Password changed.' }),
        t('SET_PASSWORD_TITLE', { defaultValue: 'Set new password' })
      );
      navigate('/login', { replace: true });
    } catch (e) {
      const code = readApiErrorCode(e);
      setError(code !== undefined ? `Set password failed (${String(code)}).` : ((e as Error).message || 'Set password failed.'));
    }
  };

  return (
    <Card className="mx-auto w-full max-w-[600px]">
      <CardHeader>
        <CardTitle>{t('SET_PASSWORD_TITLE', { defaultValue: 'Set new password' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="app-form" onSubmit={form.handleSubmit(values => void onSubmit(values))}>
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="app-form-field">
                  <FormLabel>{t('SET_PASSWORD_NEW', { defaultValue: 'New password' })}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" maxLength={32} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem className="app-form-field">
                  <FormLabel>{t('SET_PASSWORD_CONFIRM', { defaultValue: 'Confirm password' })}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" maxLength={32} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {token.length === 0 && (
              <p className="text-sm text-destructive">
                {t('SET_PASSWORD_INVALID_TOKEN', { defaultValue: 'Reset token is invalid.' })}
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button disabled={token.length === 0 || auth.loading || form.formState.isSubmitting} type="submit">
              {t('SET_PASSWORD_BUTTON', { defaultValue: 'Change password' })}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
