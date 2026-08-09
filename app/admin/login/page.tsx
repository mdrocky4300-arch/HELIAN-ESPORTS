'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@helian.com');
  const [password, setPassword] = useState('Helian@Admin#2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = document.cookie.split('; ').find((item) => item.startsWith('admin_session='));
    if (stored) {
      router.replace('/admin');
    }
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
