import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useLang } from '../../../providers/LanguageProvider';
import { useAuth } from '../../providers/AuthProvider';
import { ApiError } from '../../types';

/**
 * Login (figma-spec.md §3.3) + Intro splash (§3.4), combined into one page
 * with a local `step` state rather than two routes — Intro is a
 * transitional, non-interactive greeting with no nav (§3.4), so it isn't a
 * destination a user navigates back to.
 *
 * Wired to the real `POST /api/auth/login/` endpoint via `useAuth()`
 * (CLAUDE.md's Dashboard API section log) — this is real session
 * authentication now, not the UI-only mock this file used to be. On success,
 * `RequireAuth` (App.tsx) lets navigation through and this page hands off to
 * the Intro splash before returning to wherever the admin was trying to go.
 */
export function LoginPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [step, setStep] = useState<'login' | 'intro'>('login');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    setSubmitting(true);
    try {
      await login(name, code);
      setStep('intro');
      window.setTimeout(() => navigate(redirectTo, { replace: true }), 1600);
    } catch (err) {
      submittingRef.current = false;
      setSubmitting(false);
      setError(
        err instanceof ApiError
          ? t('اسم المستخدم أو الرمز غير صحيح.', 'Incorrect name or code.')
          : t('تعذر الاتصال بالخادم. حاول مرة أخرى.', 'Could not reach the server. Please try again.'),
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-dashboard-bg px-dashboard-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute size-[620px] rounded-dashboard-full opacity-70 blur-3xl"
        style={{ background: 'radial-gradient(circle, var(--dashboard-primary) 0%, transparent 70%)', opacity: 0.12 }}
      />

      {step === 'login' ? (
        <form
          onSubmit={handleSubmit}
          className="relative flex w-full max-w-[418px] flex-col gap-dashboard-6 border p-dashboard-10"
          style={{
            borderWidth: 'var(--dashboard-border-glass-width)',
            borderColor: 'var(--dashboard-primary)',
            background: 'rgba(16, 19, 24, 0.55)',
            backdropFilter: `blur(var(--dashboard-blur-glass))`,
            boxShadow: 'var(--dashboard-shadow-modal)',
          }}
        >
          <div className="flex flex-col items-center gap-dashboard-4 text-center">
            <img src="/alsorouh-icon.svg" alt="" className="h-10 w-auto" aria-hidden="true" />
            <div className="flex flex-col gap-dashboard-2">
              <h1 className="text-dashboard-h2 font-dashboard-semibold text-dashboard-foreground">
                {t('لوحة تحكم الصروح', 'Al-Sorouh Dashboard')}
              </h1>
              <p className="text-dashboard-table-body text-dashboard-muted-foreground">
                {t('سجل الى حسابك', 'Sign in to your account')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-dashboard-4">
            <div className="flex flex-col gap-dashboard-2">
              <label
                htmlFor="login-name"
                className="text-dashboard-label-en text-dashboard-foreground-secondary"
              >
                {t('الأسم', 'Name')}
              </label>
              <Input
                id="login-name"
                required
                autoComplete="username"
                placeholder={t('ادخل الأسم', 'Enter your name')}
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-[var(--dashboard-control-height-input)] rounded-none border-dashboard-border bg-dashboard-surface-sunken text-dashboard-foreground placeholder:text-dashboard-placeholder-foreground focus-visible:border-dashboard-primary focus-visible:ring-dashboard-primary/30"
              />
            </div>
            <div className="flex flex-col gap-dashboard-2">
              <label
                htmlFor="login-code"
                className="text-dashboard-label-en text-dashboard-foreground-secondary"
              >
                {t('الرمز', 'Code')}
              </label>
              <Input
                id="login-code"
                type="password"
                required
                autoComplete="current-password"
                placeholder={t('ادخل الرمز', 'Enter your code')}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="h-[var(--dashboard-control-height-input)] rounded-none border-dashboard-border bg-dashboard-surface-sunken text-dashboard-foreground placeholder:text-dashboard-placeholder-foreground focus-visible:border-dashboard-primary focus-visible:ring-dashboard-primary/30"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="text-dashboard-table-body text-dashboard-error">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="dashboard"
            disabled={submitting}
            className="h-[var(--dashboard-control-height-input)] justify-center rounded-none bg-dashboard-primary text-[length:var(--text-dashboard-button-lg)] text-dashboard-primary-foreground hover:bg-dashboard-primary-hover"
          >
            {submitting ? t('جاري تسجيل الدخول...', 'Signing in...') : t('تسجيل الدخول', 'Log in')}
            {!submitting && <span aria-hidden="true">→</span>}
          </Button>
        </form>
      ) : (
        <div className="relative flex flex-col items-center gap-dashboard-4 text-center" role="status">
          <div
            aria-hidden="true"
            className="flex size-20 items-center justify-center rounded-dashboard-full"
            style={{ boxShadow: 'var(--dashboard-shadow-glow)' }}
          >
            <img src="/alsorouh-icon.svg" alt="" className="h-10 w-auto" />
          </div>
          <h1 className="text-dashboard-confirm-heading font-dashboard-medium text-dashboard-foreground">
            {t(`مرحباً بك${name ? `, ${name}` : ''}`, `Welcome${name ? `, ${name}` : ''}`)}
          </h1>
          <p
            dir="ltr"
            lang="en"
            className="text-dashboard-eyebrow-lg uppercase tracking-dashboard-wordmark text-dashboard-accent"
          >
            Al-Sorouh Dashboard
          </p>
        </div>
      )}
    </div>
  );
}
