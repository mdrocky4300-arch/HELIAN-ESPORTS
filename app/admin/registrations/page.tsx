'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Users, Search, Loader2, ChevronDown, ChevronRight,
  Download, RefreshCw, Trophy, Phone, User, Shield,
  CheckCircle2, XCircle, Clock, Wallet, AlertTriangle
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

interface Registration {
  id: string;
  registrationId: string;
  teamId: string;
  tournamentId: string;
  tournamentTitle: string;
  entryFee: number;
  userId: string;
  userName: string;
  userEmail: string;
  squadName: string;
  iglName: string;
  captainWhatsApp: string;
  player1Name: string;
  player2Name: string;
  player3Name: string;
  player4Name: string;
  backupPlayerName: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  joinedAt: string;
}

const STATUS_CONFIG = {
  PENDING: {
    label: 'PENDING',
    icon: 'clock',
    badgeClass: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
    rowBorderClass: 'border-yellow-500/40',
  },
  VERIFIED: {
    label: 'CONFIRMED',
    icon: 'check',
    badgeClass: 'bg-green-900/30 text-green-400 border-green-500/30',
    rowBorderClass: 'border-slate-700/50',
  },
  REJECTED: {
    label: 'REJECTED',
    icon: 'x',
    badgeClass: 'bg-red-900/30 text-red-400 border-red-500/30',
    rowBorderClass: 'border-red-500/20',
  },
};

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tournamentFilter, setTournamentFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadRegistrations = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/admin/registrations', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setRegistrations(data.registrations || []);
        setLastRefresh(new Date());
      }
    } catch {}
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    void loadRegistrations();
    const interval = setInterval(() => void loadRegistrations(true), 30000);
    return () => clearInterval(interval);
  }, [loadRegistrations]);

  const handleAction = async (regId: string, action: 'APPROVE' | 'REJECT', entryFee: number) => {
    const confirmMsg = action === 'APPROVE'
      ? `Approve this registration? Entry fee of BDT ${entryFee} will be deducted from the player wallet.`
      : `Reject this registration? No wallet deduction will be made.`;
    if (!confirm(confirmMsg)) return;

    setActionLoading(regId);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Action successful!', 'success');
        await loadRegistrations(true);
      } else {
        showToast(data.message || 'Something went wrong.', 'error');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Registration ID', 'Tournament', 'Squad Name', 'IGL', 'Player 1', 'Player 2', 'Player 3', 'Player 4', 'Backup', 'Captain', 'WhatsApp', 'Entry Fee', 'Status', 'Registered At'].join(','),
      ...registrations.map((r) => [
        r.registrationId, `"${r.tournamentTitle}"`, `"${r.squadName}"`,
        r.iglName, r.player1Name, r.player2Name, r.player3Name, r.player4Name,
        r.backupPlayerName || '-', r.userName, r.captainWhatsApp,
        r.entryFee, r.status, new Date(r.joinedAt).toLocaleString()
      ].join(','))
    ].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `registrations_${Date.now()}.csv`;
    a.click();
  };

  const pendingCount = registrations.filter(r => r.status === 'PENDING').length;
  const verifiedCount = registrations.filter(r => r.status === 'VERIFIED').length;
  const rejectedCount = registrations.filter(r => r.status === 'REJECTED').length;

  const tournaments = ['ALL', ...Array.from(new Set(registrations.map((r) => r.tournamentTitle)))];

  const filtered = registrations.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || `${r.squadName} ${r.iglName} ${r.userName} ${r.captainWhatsApp} ${r.registrationId} ${r.player1Name} ${r.player2Name} ${r.player3Name} ${r.player4Name}`
      .toLowerCase().includes(q);
    const matchTournament = tournamentFilter === 'ALL' || r.tournamentTitle === tournamentFilter;
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchTournament && matchStatus;
  });

  const grouped = filtered.reduce<Record<string, Registration[]>>((acc, r) => {
    if (!acc[r.tournamentTitle]) acc[r.tournamentTitle] = [];
    acc[r.tournamentTitle].push(r);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-body pb-20 lg:pb-0">
      <Navbar />

      {/* Toast */}
      {toast && (
        <div style={{position:'fixed',top:'24px',right:'24px',zIndex:9999,display:'flex',alignItems:'center',gap:'8px'}}
          className={`px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-brand-purple/20 border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center">
                <Users className="w-4 h-4 text-brand-purple" />
              </div>
              <h1 className="font-heading font-black text-2xl text-white">REGISTERED TEAMS</h1>
              <span className="px-2.5 py-1 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-extrabold border border-brand-cyan/30">
                {registrations.length} Total
              </span>
              {pendingCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-extrabold border border-yellow-500/30">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              All tournament registrations &bull; Last updated: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void loadRegistrations()} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-colors">
              <RefreshCw className="w-3.5 h-3.5 text-brand-cyan" /> Refresh
            </button>
            <button onClick={handleExport} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-colors">
              <Download className="w-3.5 h-3.5 text-brand-gold" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {/* Sub-Nav */}
        <div className="flex items-center space-x-2 border-b border-slate-800 overflow-x-auto pb-1">
          {[
            { href: '/admin', label: 'Overview & Analytics' },
            { href: '/admin/tournaments', label: 'Tournament Manager' },
            { href: '/admin/registrations', label: `Registered Teams (${registrations.length})`, active: true },
            { href: '/admin/payments', label: 'Wallet & Payments' },
            { href: '/admin/users', label: 'User Manager' },
            { href: '/admin/notifications', label: 'Notifications' },
            { href: '/admin/settings', label: 'Settings' },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-4 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-colors ${item.active ? 'bg-brand-purple text-white' : 'bg-slate-800 text-slate-300 hover:text-white'}`}>
              {item.label}
            </Link>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Teams', value: registrations.length, color: 'text-brand-cyan', bg: 'from-brand-cyan/10 to-brand-cyan/5', border: 'border-brand-cyan/20' },
            { label: 'Pending', value: pendingCount, color: 'text-yellow-400', bg: 'from-yellow-500/10 to-yellow-500/5', border: 'border-yellow-500/20' },
            { label: 'Approved', value: verifiedCount, color: 'text-green-400', bg: 'from-green-500/10 to-green-500/5', border: 'border-green-500/20' },
            { label: 'Rejected', value: rejectedCount, color: 'text-red-400', bg: 'from-red-500/10 to-red-500/5', border: 'border-red-500/20' },
            { label: 'Confirmed Fees', value: `BDT ${registrations.filter(r => r.status === 'VERIFIED').reduce((a, r) => a + r.entryFee, 0).toLocaleString()}`, color: 'text-brand-gold', bg: 'from-brand-gold/10 to-brand-gold/5', border: 'border-brand-gold/20' },
          ].map((s) => (
            <div key={s.label} className={`glass-card rounded-2xl p-4 border ${s.border} bg-gradient-to-br ${s.bg} text-center`}>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1">{s.label}</div>
              <div className={`text-2xl font-heading font-extrabold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search squad, IGL, player name, WhatsApp, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-orange"
            />
          </div>
          <select
            value={tournamentFilter}
            onChange={(e) => setTournamentFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-orange min-w-[200px]"
          >
            {tournaments.map((t) => (
              <option key={t} value={t}>{t === 'ALL' ? 'All Tournaments' : t}</option>
            ))}
          </select>
          {/* Status Filter Tabs */}
          <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
            {[
              { value: 'ALL', label: 'All' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'VERIFIED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === opt.value
                    ? 'bg-brand-purple text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
                {opt.value === 'PENDING' && pendingCount > 0 && (
                  <span className="ml-1 bg-yellow-500 text-black rounded-full text-[9px] px-1.5 py-0.5">{pendingCount}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading registrations...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <div className="font-heading font-bold text-lg">No registrations found</div>
            <div className="text-sm mt-1">When players register for tournaments, they will appear here.</div>
          </div>
        ) : tournamentFilter === 'ALL' ? (
          <div className="space-y-8">
            {Object.entries(grouped).map(([tournamentTitle, regs]) => (
              <div key={tournamentTitle}>
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <div className="w-8 h-8 rounded-xl bg-brand-orange/20 border border-brand-orange/40 flex items-center justify-center shrink-0">
                    <Trophy className="w-4 h-4 text-brand-orange" />
                  </div>
                  <div>
                    <div className="font-heading font-extrabold text-white text-base">{tournamentTitle}</div>
                    <div className="text-xs text-slate-400">{regs.length} team{regs.length > 1 ? 's' : ''} &bull; Entry Fee: BDT {regs[0].entryFee}</div>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    {regs.filter(r => r.status === 'PENDING').length > 0 && (
                      <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">
                        {regs.filter(r => r.status === 'PENDING').length} Pending
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-bold border border-brand-orange/30">
                      {regs.length} Teams
                    </span>
                  </div>
                </div>
                <RegistrationTable
                  regs={regs}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  actionLoading={actionLoading}
                  onAction={handleAction}
                />
              </div>
            ))}
          </div>
        ) : (
          <RegistrationTable
            regs={filtered}
            expandedId={expandedId}
            setExpandedId={setExpandedId}
            actionLoading={actionLoading}
            onAction={handleAction}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

function RegistrationTable({
  regs,
  expandedId,
  setExpandedId,
  actionLoading,
  onAction,
}: {
  regs: Registration[];
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  actionLoading: string | null;
  onAction: (id: string, action: 'APPROVE' | 'REJECT', fee: number) => void;
}) {
  return (
    <div className="space-y-2">
      {regs.map((reg, idx) => {
        const cfg = STATUS_CONFIG[reg.status];
        const isPending = reg.status === 'PENDING';
        const isActing = actionLoading === reg.id;

        return (
          <div key={reg.id} className={`glass-card rounded-2xl border overflow-hidden transition-all ${isPending ? 'border-yellow-500/40 shadow-lg shadow-yellow-500/5' : reg.status === 'REJECTED' ? 'border-red-500/20' : 'border-slate-700/50'} hover:border-brand-orange/30`}>
            {/* Main Row */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-800/40"
              onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                <span className="text-xs font-extrabold text-brand-gold">#{idx + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-heading font-extrabold text-white text-sm">{reg.squadName}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${cfg.badgeClass}`}>
                    {reg.status === 'PENDING' ? 'PENDING APPROVAL' : reg.status === 'VERIFIED' ? 'APPROVED' : 'REJECTED'}
                  </span>
                  {isPending && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 text-[10px] font-bold">
                      BDT {reg.entryFee} pending
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  IGL: <span className="text-brand-cyan font-semibold">{reg.iglName}</span>
                  {' '}&bull;{' '}
                  <span className="text-slate-300">{reg.player1Name}, {reg.player2Name}, {reg.player3Name}, {reg.player4Name}</span>
                  {reg.backupPlayerName && <span className="text-slate-500"> (Backup: {reg.backupPlayerName})</span>}
                </div>
              </div>

              {/* Action buttons - only for PENDING */}
              {isPending && (
                <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    disabled={isActing}
                    onClick={() => onAction(reg.id, 'APPROVE', reg.entryFee)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/40 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    Approve
                  </button>
                  <button
                    disabled={isActing}
                    onClick={() => onAction(reg.id, 'REJECT', reg.entryFee)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/40 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Reject
                  </button>
                </div>
              )}

              <div className="hidden sm:flex flex-col items-end text-right shrink-0">
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {reg.captainWhatsApp}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(reg.joinedAt).toLocaleDateString()} {new Date(reg.joinedAt).toLocaleTimeString()}
                </div>
              </div>

              <div className="shrink-0 ml-1">
                {expandedId === reg.id
                  ? <ChevronDown className="w-4 h-4 text-slate-400" />
                  : <ChevronRight className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {/* Expanded Detail */}
            {expandedId === reg.id && (
              <div className="border-t border-slate-700/50 bg-slate-900/50 p-5 space-y-4">

                {/* Pending Action Banner */}
                {isPending && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400 shrink-0" />
                      <div>
                        <div className="text-yellow-400 font-bold text-sm">Awaiting Admin Approval</div>
                        <div className="text-yellow-300/70 text-xs">BDT {reg.entryFee} will be deducted from wallet on approval. Rejecting will not charge the player.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        disabled={!!actionLoading}
                        onClick={() => onAction(reg.id, 'APPROVE', reg.entryFee)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white border border-green-400/40 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {actionLoading === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        disabled={!!actionLoading}
                        onClick={() => onAction(reg.id, 'REJECT', reg.entryFee)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-400/40 text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {actionLoading === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Squad Identity */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-orange font-bold mb-3 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Squad Identity
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { label: 'Squad Name', value: reg.squadName, highlight: true },
                      { label: 'Registration ID', value: reg.registrationId, mono: true },
                      { label: 'Team ID', value: reg.teamId, mono: true },
                      { label: 'Registered On', value: new Date(reg.joinedAt).toLocaleString() },
                      { label: 'Entry Fee', value: `BDT ${reg.entryFee}` },
                      { label: 'Status', value: isPending ? 'Pending Approval' : reg.status === 'VERIFIED' ? 'Approved' : 'Rejected' },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/40">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{item.label}</div>
                        <div className={`text-sm font-semibold break-all ${(item as any).mono ? 'font-mono text-brand-cyan text-xs' : (item as any).highlight ? 'text-brand-gold' : 'text-white'}`}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Player Lineup */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-brand-cyan font-bold mb-3 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Player Lineup
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {[
                      { role: 'IGL / Captain', name: reg.iglName, color: 'text-brand-gold', border: 'border-brand-gold/30 bg-brand-gold/5' },
                      { role: 'Player 1', name: reg.player1Name, color: 'text-white', border: 'border-slate-700/50 bg-slate-800/50' },
                      { role: 'Player 2', name: reg.player2Name, color: 'text-white', border: 'border-slate-700/50 bg-slate-800/50' },
                      { role: 'Player 3', name: reg.player3Name, color: 'text-white', border: 'border-slate-700/50 bg-slate-800/50' },
                      { role: 'Player 4', name: reg.player4Name, color: 'text-white', border: 'border-slate-700/50 bg-slate-800/50' },
                      ...(reg.backupPlayerName ? [{ role: 'Backup', name: reg.backupPlayerName, color: 'text-slate-400', border: 'border-slate-700/30 bg-slate-900/40' }] : []),
                    ].map((p) => (
                      <div key={p.role} className={`p-3 rounded-xl border ${p.border} text-center`}>
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-2">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{p.role}</div>
                        <div className={`text-xs font-bold ${p.color}`}>{p.name || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-green-400 font-bold mb-3 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> Contact Info
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {[
                      { label: 'Registered User', value: reg.userName },
                      { label: 'Email', value: reg.userEmail },
                      { label: 'Captain WhatsApp', value: reg.captainWhatsApp },
                    ].map((item) => (
                      <div key={item.label} className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/40">
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{item.label}</div>
                        <div className="text-sm font-semibold text-white break-all">{item.value || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}