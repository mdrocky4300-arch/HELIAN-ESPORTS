'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

const DEFAULT_ADMIN_EMAIL = 'admin@helian.gg';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/admin/session', { credentials: 'include' });
        if (res.ok) {
          router.replace('/admin');
        }
      } catch {
        // Ignore and allow the user to log in manually.
      }
    };

    void verifySession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.message || 'Authentication failed.');
      return;
    }

    router.replace('/admin');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,30,66,0.2),_transparent_40%),linear-gradient(135deg,#020617,#111827)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-red-500/30 bg-slate-950/80 p-8 shadow-2xl shadow-red-950/40 backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-red-400">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-400">Secure Admin Access</p>
            <h1 className="text-2xl font-semibold text-white">HELIAN ADMIN</h1>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-slate-200">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-red-300">Demo admin credentials</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/60 px-3 py-2">
              <span className="text-slate-400">Username</span>
              <span className="font-semibold text-white">{DEFAULT_ADMIN_EMAIL}</span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-950/60 px-3 py-2">
              <span className="text-slate-400">Password</span>
              <span className="font-semibold text-white">{DEFAULT_ADMIN_PASSWORD}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail(DEFAULT_ADMIN_EMAIL);
              setPassword(DEFAULT_ADMIN_PASSWORD);
            }}
            className="mt-3 text-xs font-semibold text-red-300 underline underline-offset-4"
          >
            Use these credentials
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-slate-300">Admin Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-white outline-none ring-0"
              type="email"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
                type={showPassword ? 'text' : 'password'}
                required
              />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="ml-2 text-slate-400">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error ? <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p> : null}

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-70">
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">Only authorized super admins may access this console.</p>
      </div>
    </div>
  );
}
