import Link from 'next/link';
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import apiClient from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import AuthInput from '../../components/AuthInput';
import PrimaryButton from '../../components/PrimaryButton';

const recentTenants = ['acme-corp', 'nova-enterprise', 'slate-studio'];
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', tenantId: '' });
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validate = () => {
    const nextErrors = {
      email:
        email.trim() === ''
          ? 'Email is required'
          : !emailRegex.test(email)
            ? 'Enter a valid email address'
            : '',
      password: password.trim() === '' ? 'Password is required' : '',
      tenantId: tenantId.trim() === '' ? 'Tenant ID is required' : '',
    };
    setErrors(nextErrors);
    return !nextErrors.email && !nextErrors.password && !nextErrors.tenantId;
  };

  const handleChange =
    (setter: (value: string) => void, key: 'email' | 'password' | 'tenantId') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
      setErrors((prev) => ({ ...prev, [key]: '' }));
      setServerError('');
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password,
        tenant_name: tenantId.trim(),
      });

      const payload = response.data.data;
      login(payload.token, payload.user);
      router.push('/dashboard');
    } catch (err: any) {
      setServerError(
        err.response?.data?.error?.message ||
          'Sign in failed. Please verify your credentials and tenant ID.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formIsValid =
    email.trim() !== '' &&
    password.trim() !== '' &&
    tenantId.trim() !== '' &&
    emailRegex.test(email);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-slate-900 via-slate-900/80 to-transparent opacity-90" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="hidden flex-col justify-center rounded-[28px] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/40 lg:flex">
              <div className="mb-8 rounded-3xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-700 p-8 text-white shadow-xl shadow-slate-950/30">
                <p className="text-xs uppercase tracking-[0.4em] text-sky-300/80">PM System</p>
                <h2 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-white">
                  Organize teams.
                  <br /> Deliver faster.
                </h2>
                <p className="mt-4 max-w-md text-sm text-slate-300/90">
                  Secure multi-tenant project workflows with enterprise-grade role controls and
                  analytics.
                </p>
              </div>
              <div className="space-y-6 rounded-[28px] border border-white/10 bg-white/5 p-8 shadow-inner shadow-slate-950/10">
                <div className="rounded-3xl bg-slate-950/80 p-6 text-slate-100 shadow-lg shadow-slate-950/20">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    Workspace ready
                  </p>
                  <p className="mt-4 text-xl font-semibold">Fast onboarding for every tenant</p>
                </div>
                <ul className="space-y-4 text-sm text-slate-300">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
                      ✓
                    </span>
                    <span>Tenant-aware user access and project isolation.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
                      ✓
                    </span>
                    <span>Modern SaaS workflow for teams and stakeholders.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
                      ✓
                    </span>
                    <span>Analytics and audit trail built for scale.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mx-auto w-full max-w-xl rounded-[32px] border border-slate-200/10 bg-white/95 p-8 shadow-2xl shadow-slate-950/10 backdrop-blur-xl sm:p-10">
              <div className="mb-8 flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-sky-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-sky-700 shadow-sm shadow-sky-500/10">
                  PM System
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    Welcome Back
                  </h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                    Sign in with your email, password, and tenant workspace ID to access your
                    projects.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <AuthInput
                  id="email"
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange(setEmail, 'email')}
                  placeholder="you@company.com"
                  autoComplete="email"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M2.25 6.75A2.25 2.25 0 014.5 4.5h15a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 17.25V6.75z" />
                      <path
                        d="M3.75 6.75l8.25 5.25 8.25-5.25"
                        stroke="#f8fafc"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </svg>
                  }
                  helperText="Use the email associated with your organization"
                  error={errors.email}
                />

                <AuthInput
                  id="password"
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={handleChange(setPassword, 'password')}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M6 10V8a6 6 0 1112 0v2" />
                      <rect x="5" y="10" width="14" height="10" rx="2" />
                    </svg>
                  }
                  helperText="Keep this private and secure"
                  error={errors.password}
                  showPasswordToggle
                  onTogglePassword={() => setShowPassword((current) => !current)}
                  showPassword={showPassword}
                />

                <AuthInput
                  id="tenantId"
                  label="Tenant workspace ID"
                  name="tenantId"
                  type="text"
                  value={tenantId}
                  onChange={handleChange(setTenantId, 'tenantId')}
                  placeholder="company-xyz"
                  autoComplete="organization"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M5.25 4.5h13.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V5.25a.75.75 0 01.75-.75z" />
                      <path
                        d="M8.25 9.75h7.5"
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  }
                  helperText="Your organization workspace ID"
                  error={errors.tenantId}
                  list="recent-tenants"
                />
                <datalist id="recent-tenants">
                  {recentTenants.map((tenant) => (
                    <option key={tenant} value={tenant} />
                  ))}
                </datalist>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href="/auth/forgot"
                    className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                  >
                    Forgot password?
                  </Link>
                  <span className="text-sm text-slate-500">
                    New to PM System?{' '}
                    <Link
                      href="/auth/signup"
                      className="font-semibold text-sky-600 hover:text-sky-800"
                    >
                      Create account
                    </Link>
                  </span>
                </div>

                {serverError ? (
                  <div className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {serverError}
                  </div>
                ) : null}

                <PrimaryButton type="submit" disabled={!formIsValid} loading={loading}>
                  Sign in
                </PrimaryButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
