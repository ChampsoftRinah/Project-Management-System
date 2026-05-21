import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { title: 'Dashboard', href: '/dashboard' },
  { title: 'Projects', href: '/projects' },
  { title: 'Analytics', href: '/analytics' },
];

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  const { user, logout, tenant_id } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/projects') {
      return router.pathname.startsWith('/projects');
    }
    return router.pathname === path;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="md:flex md:min-h-screen">
        <aside className="hidden w-80 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workspace</p>
              <h1 className="text-2xl font-semibold text-slate-900">ProjectFlow</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-8">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                    isActive(item.href)
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-slate-200 px-6 py-5">
            <div className="text-sm font-medium text-slate-900">
              {user?.first_name ?? user?.email ?? 'User'}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span>{user?.roles?.[0] ?? 'Member'}</span>
              <span className="h-1 w-1 rounded-full bg-slate-400" />
              <span>{tenant_id ? `Tenant ${tenant_id.slice(0, 8)}` : 'Tenant'}</span>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen((prev) => !prev)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 md:hidden"
                  aria-label="Toggle navigation"
                >
                  <span className="text-lg">☰</span>
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Welcome back</p>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {user?.first_name || 'Team member'}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="hidden sm:flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {user?.email}
                </div>
                <button
                  onClick={logout}
                  className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>

          {mobileOpen && (
            <div className="border-b border-slate-200 bg-white px-4 py-4 md:hidden">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-3xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
