import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { readApiErrorCode, useAuth } from '@/lib/auth-context';
import { env } from '@/lib/env';
import { isValidLoginName, isValidPassword } from '@/lib/validators';

type RedirectState = {
  redirectTo?: string;
};

const loginSchema = z.object({
  name: z.string().refine(isValidLoginName, 'Username must be 3-32 characters.'),
  password: z.string().refine(value => isValidPassword(value, 1), 'Password is required.'),
  remember: z.boolean(),
  apiUrl: z.string()
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage(): JSX.Element {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as RedirectState | null)?.redirectTo || '/games';

  const [showServerField, setShowServerField] = useState(false);
  const [error, setError] = useState('');
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      password: '',
      remember: true,
      apiUrl: auth.apiUrl
    }
  });

  if (auth.isLoggedIn) {
    return <Navigate replace to={redirectTo} />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    setError('');

    try {
      if (showServerField && values.apiUrl.trim() && values.apiUrl.trim() !== auth.apiUrl) {
        await auth.setApiUrl(values.apiUrl, true);
      }

      await auth.login(values.name.trim(), values.password, values.remember);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      const code = readApiErrorCode(e);
      if (code !== undefined) {
        setError(`Login failed (${String(code)}).`);
      } else {
        setError((e as Error).message || 'Login failed.');
      }
    }
  };

  return (
    <Card className="mx-auto w-full max-w-[600px]">
      <CardHeader>
        <CardTitle>{t('LOGIN_SIGN_IN', { defaultValue: 'Sign in' })}</CardTitle>
        <CardDescription>{t('LOGIN_USERNAME', { defaultValue: 'Username' })}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="app-form" onSubmit={form.handleSubmit(values => void onSubmit(values))}>
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem className="app-form-field">
                  <FormLabel>{t('LOGIN_USERNAME', { defaultValue: 'Username' })}</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={32} />
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
                  <FormLabel>{t('LOGIN_PASSWORD', { defaultValue: 'Password' })}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" maxLength={32} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {env.allowServerChange && (
              <div className="app-form-field">
                <button type="button" className="text-left text-sm underline" onClick={() => setShowServerField(v => !v)}>
                  {t('LOGIN_CHANGE_SERVER', { defaultValue: 'Change server' })}
                </button>
                {showServerField && (
                  <FormField
                    name="apiUrl"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            <FormField
              name="remember"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <label className="text-sm">
                    <input
                      checked={field.value}
                      onChange={event => field.onChange(event.target.checked)}
                      type="checkbox"
                    />
                    {' '}
                    {t('LOGIN_REMEMBER_ME', { defaultValue: 'Remember me' })}
                  </label>
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="app-inline-actions">
              <Button disabled={auth.loading || form.formState.isSubmitting} type="submit">
                {t('LOGIN_SIGN_IN', { defaultValue: 'Sign in' })}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/register">{t('LOGIN_CREATE_ACCOUNT', { defaultValue: 'Create account' })}</Link>
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/reset-password">{t('LOGIN_RESET_PASSWORD', { defaultValue: 'Reset password' })}</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
