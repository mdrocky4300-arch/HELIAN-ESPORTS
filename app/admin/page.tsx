'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Trophy, 
  DollarSign, 
  Users, 
  CreditCard, 
  PlusCircle, 
  TrendingUp, 
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { db } from '@/lib/db';
import { User, Tournament, Payment } from '@/lib/types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
    setTournaments(db.getTournaments());
    setPayments(db.getPayments());
    setUsers(db.getUsers());
  }, []);

  const pendingPayments = payments.filter(p => p.status === 'PENDING');
  const activeTournaments = tournaments.filter(t => t.status === 'LIVE' || t.status === 'UPCOMING');

  const chartData = [
    { day: 'Mon', revenue: 12000, players: 450 },
    { day: 'Tue', revenue: 18000, players: 620 },
    { day: 'Wed', revenue: 15000, players: 590 },
    { day: 'Thu', revenue: 24000, players: 810 },
    { day: 'Fri', revenue: 32000, players: 1100 },
    { day: 'Sat', revenue: 45000, players: 1420 },
    { day: 'Sun', revenue: 38000, players: 1250 },
  ];

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-body">
      <Navbar />

      {/* Admin Header */}
      <div className="bg-surface/80 border-b border-surface-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple/20 text-brand-cyan flex items-center justify-center border border-brand-purple/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-heading font-black text-3xl text-white">ADMIN COMMAND CENTER</h1>
              <div className="text-xs text-gray-400">Managing Helian Tournament Network</div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/tournaments"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-heading font-bold text-xs shadow-neon-red flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>NEW TOURNAMENT</span>
            </Link>
            <Link
              href="/admin/payments"
              className="px-4 py-2.5 rounded-xl bg-brand-purple text-white font-heading font-bold text-xs shadow-neon-cyan relative flex items-center space-x-1.5"
            >
              <CreditCard className="w-4 h-4" />
              <span>PAYMENT QUEUE ({pendingPayments.length})</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Navigation Bar for Admin Sub-Pages */}
        <div className="flex items-center space-x-2 border-b border-surface-border overflow-x-auto pb-1">
          <Link href="/admin" className="px-4 py-2 rounded-xl bg-brand-purple text-white font-heading font-bold text-xs">
            Overview & Analytics
          </Link>
          <Link href="/admin/tournaments" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
            Tournament Manager
          </Link>
          <Link href="/admin/payments" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
            Payment Verification ({pendingPayments.length})
          </Link>
          <Link href="/admin/users" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
            User Manager
          </Link>
          <Link href="/admin/matches" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
            Match Standings Entry
          </Link>
        </div>

        {/* Top Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Total Weekly Revenue</span>
              <DollarSign className="w-4 h-4 text-brand-gold" />
            </div>
            <div className="font-heading font-black text-3xl text-brand-gold">৳ 1,84,000</div>
            <div className="text-[11px] text-green-400 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +24% vs last week
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Active Competitions</span>
              <Trophy className="w-4 h-4 text-brand-orange" />
            </div>
            <div className="font-heading font-black text-3xl text-white">{activeTournaments.length}</div>
            <div className="text-[11px] text-brand-orange font-semibold">
              {tournaments.filter(t => t.status === 'LIVE').length} Live Right Now
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Pending Payments</span>
              <CreditCard className="w-4 h-4 text-brand-cyan" />
            </div>
            <div className="font-heading font-black text-3xl text-brand-cyan">{pendingPayments.length}</div>
            <div className="text-[11px] text-yellow-400 font-semibold">Requires Verification</div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold uppercase">
              <span>Total Registered Players</span>
              <Users className="w-4 h-4 text-brand-red" />
            </div>
            <div className="font-heading font-black text-3xl text-brand-red">{users.length}</div>
            <div className="text-[11px] text-gray-400 font-semibold">Verified Free Fire UIDs</div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Revenue Chart */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-6 border border-surface-border space-y-4">
            <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-gold" /> Weekly Revenue Trend (BDT)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F0F16', borderColor: '#242436', color: '#FFF' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Player Registrations Chart */}
          <div className="lg:col-span-5 glass-card rounded-2xl p-6 border border-surface-border space-y-4">
            <h3 className="font-heading font-extrabold text-xl text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-orange" /> Daily Active Players
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#0F0F16', borderColor: '#242436', color: '#FFF' }} />
                  <Bar dataKey="players" fill="#FF6B00" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
