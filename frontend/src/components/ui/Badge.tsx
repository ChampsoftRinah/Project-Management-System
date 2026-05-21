interface BadgeProps {
  label: string;
  variant?: 'neutral' | 'success' | 'danger' | 'info';
}

const badgeStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-100 text-emerald-800',
  danger: 'bg-rose-100 text-rose-800',
  info: 'bg-blue-100 text-blue-800',
};

export default function Badge({ label, variant = 'neutral' }: BadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeStyles[variant]}`}
    >
      {label}
    </span>
  );
}
