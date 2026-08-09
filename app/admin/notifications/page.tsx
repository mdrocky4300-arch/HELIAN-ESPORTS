'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bell, Send, CheckCircle2, MessageSquare, ShieldAlert } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetGroup, setTargetGroup] = useState<'ALL' | 'TOURNAMENT_PLAYERS'>('ALL');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSentSuccess(true);
    setTimeout(() => {
      setTitle('');
      setMessage('');
      setSentSuccess(false);
    }, 3000);
  };

  const handlePreset = (presetTitle: string, presetMsg: string) => {
    setTitle(presetTitle);
    setMessage(presetMsg);
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-body pb-20 lg:pb-0">
      <Navbar />

      <div className="bg-slate-900 border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-black text-3xl text-white">PUSH & SYSTEM NOTIFICATIONS</h1>
          <div className="text-xs text-slate-400">Broadcast match reminders, room credential alerts, and news to players</div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {/* Sub-Nav Bar */}
        <div className="flex items-center space-x-2 border-b border-slate-800 overflow-x-auto pb-1">
          <Link href="/admin" className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs">
            Overview & Analytics
          </Link>
          <Link href="/admin/tournaments" className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs">
            Tournament Manager
          </Link>
          <Link href="/admin/registrations" className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs">
            Registration Manager
          </Link>
          <Link href="/admin/notifications" className="px-4 py-2 rounded-xl bg-brand-purple text-white font-bold text-xs">
            Notifications & Alerts
          </Link>
          <Link href="/admin/settings" className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs">
            Website Settings
          </Link>
        </div>

        {/* Preset Quick Buttons */}
        <div className="glass-card rounded-2xl p-4 border border-slate-700/60 space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Quick Presets:</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handlePreset('🎮 Custom Room ID Published!', 'Room ID and Password for your registered match are now live on your match detail tab.')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-brand-cyan border border-slate-700"
            >
              Room ID Alert
            </button>
            <button
              onClick={() => handlePreset('💰 Tournament Winnings Deposited', 'Congratulations! Your Booyah prize money has been credited to your Helian Wallet.')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-brand-gold border border-slate-700"
            >
              Payout Notice
            </button>
            <button
              onClick={() => handlePreset('⚠️ Anti-Cheat Warning', 'Using third-party script tools or modified APKs will result in permanent hardware ban.')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-brand-red border border-slate-700"
            >
              Anti-Cheat Warning
            </button>
          </div>
        </div>

        {/* Broadcast Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-6">
          
          {sentSuccess && (
            <div className="p-4 rounded-2xl bg-green-900/30 border border-green-500/40 text-green-400 font-bold text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Broadcast notification successfully dispatched to players!</span>
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-300 block mb-1">Target Audience</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold"
              >
                <option value="ALL">All Registered Players (Global Broadcast)</option>
                <option value="TOURNAMENT_PLAYERS">Active Tournament Joined Players</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Notification Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. 🎮 Room Credentials Live!"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Message Content *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="Type your message to be pushed to user dashboards..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-red via-brand-orange to-brand-gold text-white font-heading font-black text-sm shadow-neon-red flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>SEND BROADCAST NOTIFICATION</span>
            </button>
          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
}
