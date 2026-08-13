'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Search, ShieldAlert, CheckCircle2, Ban, Edit3 } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { db } from '@/lib/db';
import { User, Role } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorForm, setVendorForm] = useState({ name: '', email: '', password: '', inGameName: '' });
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);
  const [vendorMessage, setVendorMessage] = useState('');

  useEffect(() => {
    setUsers([...db.getUsers()]);
  }, []);

  const refreshUsers = () => setUsers([...db.getUsers()]);

  const handleBanToggle = (id: string) => {
    db.toggleBanUser(id);
    refreshUsers();
  };

  const handleRoleChange = (id: string, role: Role) => {
    db.updateUser(id, { role });
    refreshUsers();
  };

  const handleVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const name = vendorForm.name.trim();
    const email = vendorForm.email.trim();
    const password = vendorForm.password.trim();

    if (!name || !email || !password) {
      setVendorMessage('Vendor name, email and password are required.');
      return;
    }

    if (editingVendorId) {
      const updated = db.updateUser(editingVendorId, {
        name,
        email,
        password,
        inGameName: vendorForm.inGameName.trim() || name,
      });
      if (!updated) {
        setVendorMessage('Unable to update this vendor.');
        return;
      }
      setVendorMessage('Vendor account updated successfully.');
    } else {
      const created = db.createVendor({
        name,
        email,
        password,
        inGameName: vendorForm.inGameName.trim() || name,
      });
      if (!created) {
        setVendorMessage('This vendor email already exists.');
        return;
      }
      setVendorMessage('New vendor account created successfully.');
    }

    setVendorForm({ name: '', email: '', password: '', inGameName: '' });
    setEditingVendorId(null);
    refreshUsers();
  };

  const startVendorEdit = (vendor: User) => {
    setEditingVendorId(vendor.id);
    setVendorForm({
      name: vendor.name,
      email: vendor.email,
      password: vendor.password || '',
      inGameName: vendor.inGameName,
    });
    setVendorMessage('Editing vendor account.');
  };

  const vendorUsers = users.filter((u) => u.role === 'VENDOR');

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.freeFireUid && u.freeFireUid.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-body">
      <Navbar />

      <div className="bg-surface/80 border-b border-surface-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-black text-3xl text-white">USER & PLAYER MANAGEMENT</h1>
          <div className="text-xs text-gray-400">Manage user roles, ban toxic players, and inspect Free Fire UIDs</div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 border-b border-surface-border overflow-x-auto pb-1">
            <Link href="/admin" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
              Overview & Analytics
            </Link>
            <Link href="/admin/tournaments" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
              Tournament Manager
            </Link>
            <Link href="/admin/payments" className="px-4 py-2 rounded-xl bg-surface-light text-gray-300 hover:text-white font-heading font-bold text-xs">
              Payment Verification
            </Link>
            <Link href="/admin/users" className="px-4 py-2 rounded-xl bg-brand-purple text-white font-heading font-bold text-xs">
              User Manager ({users.length})
            </Link>
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search user, email, or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-light border border-surface-border rounded-xl pl-11 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
            />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-surface-border">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-300">Vendor Management</p>
              <h2 className="mt-2 text-2xl font-black text-white">Create or update vendor access</h2>
            </div>
          </div>

          <form onSubmit={handleVendorSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">Vendor Name</label>
              <input
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface-light px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                placeholder="Vendor Alpha"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">In-game Name</label>
              <input
                value={vendorForm.inGameName}
                onChange={(e) => setVendorForm({ ...vendorForm, inGameName: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface-light px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                placeholder="VENDOR_ALPHA"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">Vendor Email</label>
              <input
                type="email"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface-light px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                placeholder="vendor@helian.gg"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-300">Password</label>
              <input
                type="text"
                value={vendorForm.password}
                onChange={(e) => setVendorForm({ ...vendorForm, password: e.target.value })}
                className="w-full rounded-xl border border-surface-border bg-surface-light px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                placeholder="vendor123"
              />
            </div>

            <div className="md:col-span-4 flex items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-bold text-white"
              >
                {editingVendorId ? 'Update Vendor' : 'Create Vendor'}
              </button>

              {editingVendorId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingVendorId(null);
                    setVendorForm({ name: '', email: '', password: '', inGameName: '' });
                    setVendorMessage('');
                  }}
                  className="rounded-xl border border-surface-border bg-surface-light px-4 py-2.5 text-sm font-bold text-gray-300"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {vendorMessage && (
            <div className="mt-4 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-sm text-violet-200">
              {vendorMessage}
            </div>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {vendorUsers.map((vendor) => (
              <div key={vendor.id} className="rounded-2xl border border-surface-border bg-surface-light p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-white">{vendor.name}</p>
                    <p className="text-xs text-gray-400">{vendor.email}</p>
                  </div>
                  <button
                    onClick={() => startVendorEdit(vendor)}
                    className="rounded-lg bg-violet-500/10 px-2.5 py-1.5 text-xs font-bold text-violet-200"
                  >
                    Edit
                  </button>
                </div>

                <div className="mt-3 rounded-xl bg-slate-950/60 p-3 text-xs text-gray-300">
                  <div className="flex justify-between gap-3 py-1">
                    <span className="text-gray-400">Password</span>
                    <span className="font-semibold text-white">{vendor.password || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between gap-3 py-1">
                    <span className="text-gray-400">In-game</span>
                    <span className="font-semibold text-white">{vendor.inGameName || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl overflow-hidden border border-surface-border">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-light text-xs font-bold uppercase text-gray-400 border-b border-surface-border">
                <tr>
                  <th className="p-4">Player Details</th>
                  <th className="p-4">Free Fire UID</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Wallet Balance</th>
                  <th className="p-4">Kills / Wins</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-light/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-xl object-cover border border-surface-border" />
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.inGameName && <span className="text-[10px] text-brand-orange font-mono">({u.inGameName})</span>}
                          </div>
                          <div className="text-[10px] text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-xs text-brand-cyan">{u.freeFireUid || 'Not Set'}</td>

                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="bg-surface-light border border-surface-border rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="VENDOR">VENDOR</option>
                      </select>
                    </td>

                    <td className="p-4 font-heading font-extrabold text-brand-gold text-base">৳ {u.walletBalance}</td>

                    <td className="p-4 text-xs font-bold text-gray-300">{u.totalKills} Kills • {u.totalWins} Wins</td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleBanToggle(u.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          u.isBanned
                            ? 'bg-green-700 text-white hover:bg-green-600'
                            : 'bg-brand-red/20 text-brand-red border border-brand-red/30 hover:bg-brand-red hover:text-white'
                        }`}
                      >
                        {u.isBanned ? 'UNBAN USER' : 'BAN PLAYER'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
