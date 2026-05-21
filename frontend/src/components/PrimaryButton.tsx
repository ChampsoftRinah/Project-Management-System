import type { ReactNode } from 'react';

interface PrimaryButtonProps {
  children: ReactNode;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export default function PrimaryButton({
  children,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-sky-500/30 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? (
        <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
      ) : null}
      {loading ? 'Signing in...' : children}
    </button>
  );
}
