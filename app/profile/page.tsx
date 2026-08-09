'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  User as UserIcon, 
  Wallet, 
  Trophy, 
  Flame, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Edit3, 
  Copy, 
  Check, 
  CheckCircle2, 
  PlusCircle, 
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { db } from '@/lib/db';
import { User, Tournament, Team, Payment } from '@/lib/types';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <ProfilePageContent />
    </Suspense>
  );
}

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'teams' ? 'TEAMS' : 'OVERVIEW';

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TOURNAMENTS' | 'TEAMS' | 'TRANSACTIONS'>(initialTab as any);
  const [copiedRef, setCopiedRef] = useState(false);
  
  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ffUid, setFfUid] = useState('');
  const [ign, setIgn] = useState('');
  const [avatar, setAvatar] = useState('');
  
  // Create Team Modal State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');

  const [teams, setTeams] = useState<Team[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const curUser = db.getCurrentUser();
    if (curUser) {
      setUser(curUser);
      setFfUid(curUser.freeFireUid || '');
      setIgn(curUser.inGameName || '');
      setAvatar(curUser.avatar || '');
    }
    setTeams(db.getTeams());
    setPayments(db.getPayments());
  }, []);

  if (!user) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(user.referralCode || 'HELIAN99');
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = db.updateUser(user.id, {
      freeFireUid: ffUid,
      inGameName: ign,
      avatar: avatar || user.avatar,
    });
    if (updated) {
      setUser({ ...updated });
      setIsEditModalOpen(false);
    }
  };

  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !teamTag) return;
    db.createTeam(teamName, teamTag);
    setTeams([...db.getTeams()]);
    setIsTeamModalOpen(false);
    setTeamName('');
    setTeamTag('');
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-body">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* User Hero Passport Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-brand-orange/30 shadow-cyber relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-red/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            
            {/* User Avatar & Info */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-orange shadow-neon-orange"
                />
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg bg-brand-red text-white text-[10px] font-black uppercase shadow-neon-red">
                  {user.role}
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="font-heading font-black text-3xl text-white flex items-center gap-2 justify-center sm:justify-start">
                  <span>{user.inGameName || user.name}</span>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="p-1.5 rounded-lg bg-surface-light hover:bg-surface-border text-gray-400 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4 text-brand-orange" />
                  </button>
                </h1>

                <div className="text-xs text-gray-400 font-mono flex items-center gap-2 justify-center sm:justify-start">
                  <span>FF UID: <strong className="text-brand-cyan">{user.freeFireUid || 'Not Verified'}</strong></span>
                  {user.freeFireUid && (
                    <span className="flex items-center text-green-400 text-[10px] font-bold gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-400">{user.email}</div>
              </div>
            </div>

            {/* Wallet & Referral Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              
              {/* Wallet Box */}
              <div className="bg-surface-light p-4 rounded-2xl border border-surface-border text-center sm:text-right min-w-[160px]">
                <div className="text-[10px] text-gray-400 font-bold uppercase">Wallet Balance</div>
                <div className="text-2xl font-heading font-black text-brand-gold">
                  ৳ {user.walletBalance.toLocaleString()}
                </div>
                <div className="text-[10px] text-brand-cyan font-semibold mt-0.5">
                  Earnings: ৳{user.earnings.toLocaleString()}
                </div>
              </div>

              {/* Referral Code Box */}
              <div className="bg-surface-light p-4 rounded-2xl border border-surface-border text-center sm:text-left">
                <div className="text-[10px] text-gray-400 font-bold uppercase">Referral Code</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="font-mono font-extrabold text-brand-orange text-sm">{user.referralCode}</span>
                  <button
                    onClick={handleCopyRef}
                    className="p-1 rounded bg-surface border border-surface-border text-gray-300 hover:text-white text-xs"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center space-x-2 border-b border-surface-border overflow-x-auto pb-1">
          {(['OVERVIEW', 'TOURNAMENTS', 'TEAMS', 'TRANSACTIONS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl font-heading font-bold text-sm transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-neon-red'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview Stats */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="glass-card p-5 rounded-2xl border border-surface-border space-y-1">
              <div className="text-xs text-gray-400 font-bold uppercase">Total Kills</div>
              <div className="font-heading font-black text-3xl text-brand-red">{user.totalKills}</div>
              <div className="text-[11px] text-gray-500">Career Frags</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-surface-border space-y-1">
              <div className="text-xs text-gray-400 font-bold uppercase">Booyah Wins</div>
              <div className="font-heading font-black text-3xl text-brand-gold">{user.totalWins}</div>
              <div className="text-[11px] text-gray-500">Championship Titles</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-surface-border space-y-1">
              <div className="text-xs text-gray-400 font-bold uppercase">Total Cash Won</div>
              <div className="font-heading font-black text-3xl text-brand-orange">৳ {user.earnings}</div>
              <div className="text-[11px] text-gray-500">Withdrawn Payouts</div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-surface-border space-y-1">
              <div className="text-xs text-gray-400 font-bold uppercase">Win Rate</div>
              <div className="font-heading font-black text-3xl text-brand-cyan">38.4%</div>
              <div className="text-[11px] text-gray-500">Competitive Efficiency</div>
            </div>

          </div>
        )}

        {/* Tab 2: Joined Tournaments */}
        {activeTab === 'TOURNAMENTS' && (
          <div className="glass-card rounded-2xl p-6 border border-surface-border space-y-4">
            <h3 className="font-heading font-bold text-xl text-white">Joined Matches</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-surface-light border border-surface-border flex items-center justify-between">
                <div>
                  <div className="font-bold text-white text-sm">Free Fire Grand BR Squad Championship #42</div>
                  <div className="text-xs text-gray-400">Status: Registered • Room ID Unlocked</div>
                </div>
                <span className="px-3 py-1 rounded-lg bg-green-900/30 text-green-400 border border-green-500/30 text-xs font-bold">
                  VERIFIED
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Squad & Team System */}
        {activeTab === 'TEAMS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-xl text-white">My Gaming Clans</h3>
              <button
                onClick={() => setIsTeamModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-heading font-bold text-xs shadow-neon-red flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>CREATE CLAN</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((team) => (
                <div key={team.id} className="glass-card p-5 rounded-2xl border border-surface-border space-y-3">
                  <div className="flex items-center space-x-4">
                    <img src={team.logo} alt={team.name} className="w-12 h-12 rounded-xl object-cover border border-brand-orange" />
                    <div>
                      <div className="font-heading font-bold text-lg text-white flex items-center gap-2">
                        <span>{team.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-brand-red/20 text-brand-red font-mono font-bold">[{team.tag}]</span>
                      </div>
                      <div className="text-xs text-gray-400">Captain: {team.captainName}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-surface-border text-xs">
                    <span className="text-gray-400 font-mono">Invite Code: <strong className="text-brand-gold">{team.inviteCode}</strong></span>
                    <span className="text-brand-cyan font-bold">{team.membersCount} Roster Members</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Transactions */}
        {activeTab === 'TRANSACTIONS' && (
          <div className="glass-card rounded-2xl overflow-hidden border border-surface-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-light text-xs font-bold uppercase text-gray-400">
                <tr>
                  <th className="p-4">TrxID</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-light/50">
                    <td className="p-4 font-mono text-xs text-brand-cyan">{p.trxId}</td>
                    <td className="p-4 font-bold text-white">{p.method}</td>
                    <td className="p-4 font-bold text-brand-gold">৳ {p.amount}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        p.status === 'VERIFIED' ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                        p.status === 'PENDING' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                        'bg-red-900/30 text-red-400 border border-red-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full border border-surface-border space-y-4">
            <h3 className="font-heading font-black text-2xl text-white">EDIT GAMING PROFILE</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Free Fire In-Game UID *</label>
                <input
                  type="text"
                  value={ffUid}
                  onChange={(e) => setFfUid(e.target.value)}
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-white font-mono"
                  placeholder="e.g. 1029384756"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">In-Game Name (IGN) *</label>
                <input
                  type="text"
                  value={ign}
                  onChange={(e) => setIgn(e.target.value)}
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-white"
                  placeholder="e.g. HELIAN_DEVIL"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-light text-gray-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card rounded-3xl p-6 max-w-md w-full border border-surface-border space-y-4">
            <h3 className="font-heading font-black text-2xl text-white">CREATE NEW CLAN / SQUAD</h3>
            
            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-300 block mb-1">Clan Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                  placeholder="e.g. Apex Predators"
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-white"
                />
              </div>

              <div>
                <label className="font-bold text-gray-300 block mb-1">Clan Tag (3-5 letters) *</label>
                <input
                  type="text"
                  value={teamTag}
                  onChange={(e) => setTeamTag(e.target.value)}
                  required
                  placeholder="e.g. APEX"
                  className="w-full bg-surface-light border border-surface-border rounded-xl px-4 py-2.5 text-white font-mono uppercase"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-surface-light text-gray-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-bold"
                >
                  Create Clan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
