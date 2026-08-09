'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, Save, CheckCircle2, ShieldCheck, Phone, CreditCard } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState('Helian Tournaments');
  const [bkashNo, setBkashNo] = useState('01712-998877');
  const [nagadNo, setNagadNo] = useState('01812-998877');
  const [rocketNo, setRocketNo] = useState('01912-998877');
  const [helpline, setHelpline] = useState('+880 1712-998877');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-body pb-20 lg:pb-0">
      <Navbar />

      <div className="bg-slate-900 border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-black text-3xl text-white">PLATFORM SYSTEM SETTINGS</h1>
          <div className="text-xs text-slate-400">Configure site branding, payment agent numbers, and maintenance controls</div>
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
          <Link href="/admin/notifications" className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold text-xs">
            Notifications
          </Link>
          <Link href="/admin/settings" className="px-4 py-2 rounded-xl bg-brand-purple text-white font-bold text-xs">
            Website Settings
          </Link>
        </div>

        {/* Settings Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/60 space-y-6">
          
          {savedSuccess && (
            <div className="p-4 rounded-2xl bg-green-900/30 border border-green-500/40 text-green-400 font-bold text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>Platform configuration saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6 text-xs">
            
            {/* General Branding */}
            <div className="space-y-4 border-b border-slate-800 pb-6">
              <h3 className="font-heading font-extrabold text-lg text-white">Platform Branding</h3>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Platform Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold"
                />
              </div>
            </div>

            {/* Mobile Banking Agent Numbers */}
            <div className="space-y-4 border-b border-slate-800 pb-6">
              <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-gold" /> Mobile Banking Agent Numbers
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-pink-400 block mb-1">bKash Send Money No.</label>
                  <input
                    type="text"
                    value={bkashNo}
                    onChange={(e) => setBkashNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-orange-400 block mb-1">Nagad Send Money No.</label>
                  <input
                    type="text"
                    value={nagadNo}
                    onChange={(e) => setNagadNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-purple-400 block mb-1">Rocket Send Money No.</label>
                  <input
                    type="text"
                    value={rocketNo}
                    onChange={(e) => setRocketNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Support Helpline */}
            <div className="space-y-4 border-b border-slate-800 pb-6">
              <h3 className="font-heading font-extrabold text-lg text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-cyan" /> 24/7 Helpline & Support
              </h3>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Support Contact Number</label>
                <input
                  type="text"
                  value={helpline}
                  onChange={(e) => setHelpline(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800 border border-slate-700">
              <div>
                <div className="font-bold text-white text-sm">System Maintenance Mode</div>
                <div className="text-[11px] text-slate-400">Temporarily block tournament registrations for maintenance</div>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  maintenanceMode ? 'bg-brand-red text-white' : 'bg-slate-700 text-slate-400'
                }`}
              >
                {maintenanceMode ? 'MAINTENANCE ACTIVE' : 'SYSTEM ONLINE'}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-red via-brand-orange to-brand-gold text-white font-heading font-black text-sm shadow-neon-red flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>SAVE SYSTEM SETTINGS</span>
            </button>

          </form>

        </div>

      </main>

      <Footer />
    </div>
  );
}
