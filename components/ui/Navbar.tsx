'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Trophy, 
  Award, 
  Users, 
  Wallet, 
  Bell, 
  User, 
  ShieldCheck, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown,
  Gift,
  Radio
} from 'lucide-react';
import { db } from '@/lib/db';
import { User as UserType } from '@/lib/types';

export default function Navbar() {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(db.getCurrentUser());
  }, []);

  const handleRoleSwitch = (role: 'ADMIN' | 'MODERATOR' | 'USER') => {
    if (!currentUser) return;
    const updated = db.updateUser(currentUser.id, { role });
    if (updated) {
      setCurrentUser({ ...updated });
      setIsProfileOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Flame },
    { name: 'Tournaments', href: '/tournaments', icon: Trophy },
    { name: 'Live', href: '/live', icon: Radio, isLive: true },
    { name: 'Leaderboard', href: '/leaderboard', icon: Award },
    { name: 'Community', href: '/community', icon: Users },
  ];

  const isAdminOrMod = currentUser?.role === 'ADMIN' || currentUser?.role === 'MODERATOR';

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-700/60 backdrop-blur-2xl bg-slate-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-red via-brand-orange to-brand-gold p-0.5 shadow-neon-red group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-brand-red animate-pulse" />
              </div>
            </div>
            <div>
              <span className="font-heading font-black text-2xl tracking-wider text-white flex items-center gap-1.5">
                HELIAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-orange">ESPORTS</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-semibold uppercase tracking-widest">
                Free Fire Championship Hub
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-800/70 p-1.5 rounded-2xl border border-slate-700/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-neon-red font-black'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <div className="relative flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-brand-orange'} ${link.isLive ? 'animate-pulse' : ''}`} />
                    {link.isLive && (
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                      </span>
                    )}
                  </div>
                  <span className={link.isLive ? 'text-brand-red' : ''}>{link.name}</span>
                </Link>
              );
            })}


          </div>

          {/* User Right Action Panel */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Wallet Balance Badge inside Navbar */}
            {currentUser && (
              <Link 
                href="/profile" 
                className="flex items-center space-x-2.5 bg-slate-800/90 hover:bg-slate-700/80 px-4 py-2 rounded-2xl border border-brand-orange/40 transition-all group shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-brand-orange/20 flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
                  <Wallet className="w-4 h-4 text-brand-orange" />
                </div>
                <div className="text-left">
                  <div className="text-[9px] text-slate-400 font-bold uppercase leading-none">Wallet</div>
                  <div className="text-sm font-heading font-black text-brand-gold">
                    ৳ {currentUser.walletBalance.toLocaleString()}
                  </div>
                </div>
              </Link>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:border-brand-red transition-all relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-red text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce shadow-neon-red">
                  2
                </span>
              </button>

              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 glass-card rounded-2xl p-4 z-50 border border-slate-700 shadow-cyber"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 mb-3">
                      <h4 className="font-heading font-bold text-lg text-white">Notifications</h4>
                      <span className="text-xs text-brand-orange font-semibold cursor-pointer">Mark all as read</span>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-xl bg-slate-800/80 border-l-4 border-brand-red text-xs space-y-0.5">
                        <div className="font-bold text-white">🎮 Room Credentials Unlocked</div>
                        <div className="text-slate-300">BR Squad Championship #42 Room ID is live in your joined match tab.</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-800/80 border-l-4 border-brand-gold text-xs space-y-0.5">
                        <div className="font-bold text-white">💰 Deposit Verified</div>
                        <div className="text-slate-300">Your bKash deposit of ৳100 has been verified by Admin.</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Dropdown */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 bg-slate-800/90 p-1.5 pr-3 rounded-2xl border border-slate-700 hover:border-brand-red/50 transition-all"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-9 h-9 rounded-xl object-cover border border-brand-orange/50"
                  />
                  <div className="text-left hidden xl:block">
                    <div className="text-xs font-bold text-white truncate max-w-[110px]">
                      {currentUser.inGameName || currentUser.name}
                    </div>
                    <div className="text-[10px] font-bold text-brand-orange uppercase flex items-center gap-1">
                      <span>{currentUser.role}</span>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-64 glass-card rounded-2xl p-3 z-50 border border-slate-700 shadow-cyber"
                    >
                      <div className="p-3 border-b border-slate-700/60 mb-2 bg-slate-800/60 rounded-xl">
                        <div className="font-bold text-white text-sm">{currentUser.name}</div>
                        <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
                        <div className="text-xs font-mono text-brand-cyan mt-1">
                          FF UID: {currentUser.freeFireUid || 'Not Set'}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors"
                        >
                          <User className="w-4 h-4 text-brand-orange" />
                          <span>My Gaming Profile</span>
                        </Link>

                        <Link
                          href="/profile?tab=teams"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700/60 hover:text-white transition-colors"
                        >
                          <Users className="w-4 h-4 text-brand-cyan" />
                          <span>My Roster / Clan</span>
                        </Link>

                        {/* Demo Role Switcher */}
                        <div className="pt-2 mt-2 border-t border-slate-700/60">
                          <div className="text-[10px] uppercase font-bold text-slate-500 px-3 mb-1">
                            Switch Role (Preview)
                          </div>
                          <div className="grid grid-cols-3 gap-1 px-1">
                            <button
                              onClick={() => handleRoleSwitch('ADMIN')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                currentUser.role === 'ADMIN'
                                  ? 'bg-brand-red text-white'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              Admin
                            </button>
                            <button
                              onClick={() => handleRoleSwitch('MODERATOR')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                currentUser.role === 'MODERATOR'
                                  ? 'bg-brand-orange text-white'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              Mod
                            </button>
                            <button
                              onClick={() => handleRoleSwitch('USER')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                currentUser.role === 'USER'
                                  ? 'bg-brand-cyan text-black'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              User
                            </button>
                          </div>
                        </div>

                        <Link
                          href="/login"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-brand-red hover:bg-brand-red/10 transition-colors mt-2"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-heading font-black text-xs shadow-neon-red hover:brightness-110 transition-all"
              >
                LOGIN / REGISTER
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex lg:hidden items-center space-x-3">
            {currentUser && (
              <div className="text-sm font-heading font-black text-brand-gold">
                ৳ {currentUser.walletBalance}
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-semibold text-slate-200 hover:bg-slate-800"
                >
                  <Icon className="w-5 h-5 text-brand-orange" />
                  <span>{link.name}</span>
                </Link>
              );
            })}



            {currentUser ? (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-3 rounded-2xl bg-slate-800 text-white font-semibold"
                >
                  <User className="w-5 h-5 text-brand-orange" />
                  <span>Profile ({currentUser.inGameName || currentUser.name})</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center py-3 rounded-2xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-black"
              >
                LOGIN / REGISTER
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
