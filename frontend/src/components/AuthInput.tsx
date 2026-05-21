import type { ChangeEvent, ReactNode } from 'react';

interface AuthInputProps {
  id: string;
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon: ReactNode;
  helperText?: string;
  error?: string;
  autoComplete?: string;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  showPassword?: boolean;
  disabled?: boolean;
  list?: string;
}

export default function AuthInput({
  id,
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  helperText,
  error,
  autoComplete,
  showPasswordToggle = false,
  onTogglePassword,
  showPassword = false,
  disabled = false,
  list,
}: AuthInputProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
        {helperText ? <span className="text-xs text-slate-400">{helperText}</span> : null}
      </div>
      <div className="relative rounded-3xl border border-slate-200 bg-white px-4 py-2 shadow-sm transition focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          list={list}
          className="w-full rounded-3xl border-none bg-transparent py-3 pl-12 pr-12 text-sm text-slate-950 placeholder:text-slate-400 outline-none transition disabled:cursor-not-allowed disabled:opacity-70"
        />
        {showPasswordToggle && onTogglePassword ? (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        ) : null}
      </div>
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}
