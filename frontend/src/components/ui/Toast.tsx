import { useEffect } from 'react';

interface ToastProps {
  message: string;
  variant?: 'success' | 'error';
  onClose: () => void;
}

const styleMap = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-rose-600 text-white',
};

export default function Toast({ message, variant = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 4000);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return (
    <div
      className={`fixed right-4 bottom-4 z-50 w-full max-w-sm rounded-3xl px-5 py-4 shadow-2xl ${styleMap[variant]}`}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm leading-6">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 transition hover:text-white"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
