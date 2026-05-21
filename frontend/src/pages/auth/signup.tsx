import Link from 'next/link';
import { useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../services/api';

interface ApiErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    admin_first_name: '',
    admin_last_name: '',
    tenant_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    setError('');

    if (!form.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!form.password.trim()) {
      setError('Password is required');
      return false;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (!form.admin_first_name.trim()) {
      setError('First name is required');
      return false;
    }

    if (!form.tenant_name.trim()) {
      setError('Tenant name is required');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/signup', {
        email: form.email.trim(),
        password: form.password,
        admin_first_name: form.admin_first_name.trim(),
        admin_last_name: form.admin_last_name.trim(),
        tenant_name: form.tenant_name.trim(),
      });

      const responsePayload = response.data?.data ?? response.data;
      const { token, user } = responsePayload;

      if (!token || !user) {
        setError('Invalid response from server: missing token or user data');
        setLoading(false);
        return;
      }

      // Login updates auth context and stores in localStorage
      login(token, user);

      // Redirect to tenant dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);

      let errorMessage = 'Signup failed. Please try again.';

      if (err.response?.data) {
        const apiError = err.response.data as ApiErrorResponse;
        errorMessage = apiError.error?.message || apiError.message || errorMessage;
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error: unable to reach the server. Please check your connection.';
      } else if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout: server took too long to respond.';
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  // Show loading state while auth context is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-white mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 opacity-95" />
        <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl ring-1 ring-slate-200/60 sm:p-10">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">
              Project Suite
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Create your workspace account
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Start collaborating with secure tenant-aware access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Admin first name
                  <input
                    type="text"
                    name="admin_first_name"
                    value={form.admin_first_name}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="mt-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition disabled:opacity-60 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="John"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Admin last name
                  <input
                    type="text"
                    name="admin_last_name"
                    value={form.admin_last_name}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition disabled:opacity-60 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="Doe"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Email
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="mt-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition disabled:opacity-60 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="you@example.com"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Password
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="mt-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition disabled:opacity-60 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="Create a password (min. 6 characters)"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
                  Tenant workspace name
                  <input
                    type="text"
                    name="tenant_name"
                    value={form.tenant_name}
                    onChange={handleChange}
                    disabled={loading}
                    required
                    className="mt-3 block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 shadow-sm outline-none transition disabled:opacity-60 focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    placeholder="company-xyz"
                  />
                  <p className="mt-2 text-xs text-slate-500">Your organization's workspace ID</p>
                </label>
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500">
                Fill in your details to create your account.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-slate-950 hover:text-slate-700">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
