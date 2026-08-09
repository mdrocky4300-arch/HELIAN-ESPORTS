'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, LogOut, LayoutGrid, Trophy, Users, CreditCard, Settings, Menu, ClipboardList, Bell, Youtube } from 'lucide-react';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const session = document.cookie.includes('admin_session=');
    if (!session) {
      router.replace('/admin/login');
    }
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  };

  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const loadPending = async () => {
      try {
        const res = await fetch('/api/admin/registrations', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const count = (data.registrations || []).filter((r: any) => r.status === 'PENDING').length;
          setPendingCount(count);
        }
      } catch {}
    };
    void loadPending();
    const interval = setInterval(() => void loadPending(), 30000);
    return () => clearInterval(interval);
  }, []);

  const links = [
    { href: '/admin', label: 'Overview', icon: LayoutGrid },
    { href: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
    { href: '/admin/registrations', label: 'Registrations', icon: ClipboardList, badge: pendingCount },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/live', label: 'Live Stream', icon: Youtube },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800 bg-slate-950/90 p-4 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-2 text-red-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-red-400">Helian</p>
                <p className="text-sm font-semibold text-white">Admin Console</p>
              </div>
            </div>
            <button className="rounded-xl border border-slate-800 p-2 lg:hidden" onClick={() => setOpen((prev) => !prev)}>
              <Menu className="h-5 w-5" />
            </button>
          </div>

          <nav className={`mt-6 space-y-2 ${open ? 'block' : 'hidden lg:block'}`}>
            {links.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link key={link.href} href={link.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                  active ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white' : 'text-slate-300 hover:bg-slate-900'
                }`}>
                  <Icon className="h-4 w-4" />
                  <span className="flex-1">{link.label}</span>
                  {(link as any).badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500 text-black text-[10px] font-extrabold animate-pulse">
                      {(link as any).badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <button onClick={handleLogout} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:text-white">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
