import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { isValidEmail, isValidPassword, isValidPlayerName } from '@/lib/validators';

const registerSchema = z.object({
  name: z.string().refine(isValidPlayerName, 'Player name must be 3-32 letters or numbers.'),
  email: z.string().refine(isValidEmail, 'Please enter a valid email address.'),
  password: z.string().refine(isValidPassword, 'Password must be 5-32 chars and cannot contain spaces.'),
  confirmPassword: z.string(),
  serverPassword: z.string()
}).refine(values => values.password === values.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.'
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage(): JSX.Element {
  const auth = useAuth();
  const feedback = useFeedback();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [error, setError] = useState('');
  const [showServerPassword, setShowServerPassword] = useState(false);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      serverPassword: ''
    }
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setError('');
    try {
      await auth.register(values.name, values.email, values.password, values.serverPassword || undefined);
      await feedback.alert(
        t('REGISTER_SUCCESS', { defaultValue: 'Player account created. You can now sign in with this account.' }),
        t('REGISTER_TITLE', { defaultValue: 'Register' })
      );
      navigate('/login', { replace: true });
    } catch (e) {
      const code = readApiErrorCode(e);
      if (code !== undefined) {
        if (String(code).includes('REGISTER_INVALID_SERVER_PASSWORD')) {
          setShowServerPassword(true);
          form.setFocus('serverPassword');
        }
        setError(`Register failed (${String(code)}).`);
        return;
      }
      setError((e as Error).message || 'Register failed.');
    }
  };

  return (
    <Card className="mx-auto w-full max-w-[600px]">
      <CardHeader>
        <CardTitle>{t('REGISTER_TITLE', { defaultValue: 'Register' })}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="app-form" onSubmit={form.handleSubmit(values => void onSubmit(values))}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="app-form-field">
                  <FormLabel>{t('REGISTER_NAME', { defaultValue: 'Player name' })}</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={32} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="app-form-field">
                  <FormLabel>{t('REGISTER_PASSWORD', { defaultValue: 'Password' })}</FormLabel>
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
                  <FormLabel>{t('REGISTER_PASSWORD_CONFIRM', { defaultValue: 'Confirm password' })}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" maxLength={32} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showServerPassword && (
              <FormField
                name="serverPassword"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="app-form-field">
                    <FormLabel>Server Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="app-inline-actions">
              <Button disabled={auth.loading || form.formState.isSubmitting} type="submit">
                {t('REGISTER_BUTTON', { defaultValue: 'Register' })}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/login">{t('LOGIN_SIGN_IN', { defaultValue: 'Sign in' })}</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
