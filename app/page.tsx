'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Trophy, 
  Award, 
  ShieldCheck, 
  Zap, 
  Users, 
  Sparkles, 
  ChevronRight, 
  Gamepad2, 
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Lock,
  Wallet
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import TournamentCard from '@/components/tournaments/TournamentCard';
import { Tournament, LeaderboardEntry } from '@/lib/types';
import { playerLeaderboard } from '@/lib/mock-data';

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'SQUAD' | 'SOLO' | 'CS_RANKED'>('ALL');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const loadTournaments = async () => {
      try {
        const response = await fetch('/api/tournaments');
        if (!response.ok) return;
        const payload = await response.json();
        setTournaments(payload.tournaments || []);
      } catch {
        setTournaments([]);
      }
    };

    void loadTournaments();
  }, []);

  const filteredTournaments = tournaments.filter(t => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'SQUAD') return t.mode === 'SQUAD';
    if (activeTab === 'SOLO') return t.mode === 'SOLO';
    if (activeTab === 'CS_RANKED') return t.format === 'CS_RANKED';
    return true;
  });

  const faqs = [
    {
      q: 'How do I join a Free Fire tournament on Helian?',
      a: 'Create an account, verify your Free Fire UID in your profile, select any open tournament, pay the entry fee using bKash/Nagad/Rocket (or join FREE tournaments), and copy your Room ID & Password 15 minutes before match start.'
    },
    {
      q: 'When and where will I get the Custom Room ID and Password?',
      a: 'The Room ID and Password will be automatically unlocked inside your joined tournament details page 15 to 20 minutes before the scheduled match time.'
    },
    {
      q: 'How are prize payouts calculated and distributed?',
      a: 'After match completion, admins verify kill points and Booyah standings. Winnings are directly deposited to your Helian Wallet, which you can withdraw anytime to your bKash or Nagad account.'
    },
    {
      q: 'Are emulators or modified APKs allowed?',
      a: 'No modified APKs, scripts, or auto-headshot hacks are permitted. Emulator slots are limited per tournament rules. Using cheats will result in a permanent hardware ban.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-gray-100 flex flex-col font-body">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden border-b border-surface-border">
        {/* Background Gradients & Particle Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-brand-red/20 via-brand-orange/20 to-brand-purple/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Text */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-surface-light border border-brand-orange/40 backdrop-blur-md">
                <Flame className="w-4 h-4 text-brand-red animate-pulse" />
                <span className="text-xs font-bold text-gray-200 uppercase tracking-widest">
                  Season 5 Bangladesh Championship Live
                </span>
              </div>

              <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none">
                DOMINATE THE <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-brand-orange to-brand-gold text-glow-red">
                  FREE FIRE ARENA
                </span>
              </h1>

              <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                Join Bangladesh's premier automated Free Fire esports platform. Compete in daily BR Squad, Duo & CS 4v4 tournaments, earn instant bKash payouts per kill, and claim the championship trophy.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/tournaments"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-red via-brand-orange to-brand-gold text-white font-heading font-black text-lg shadow-neon-red hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-3"
                >
                  <Trophy className="w-5 h-5 text-white" />
                  <span>BROWSE TOURNAMENTS</span>
                </Link>

                <Link
                  href="/rewards"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel text-white font-heading font-bold text-lg border border-surface-border hover:border-brand-orange/60 hover:bg-surface-light transition-all flex items-center justify-center space-x-3"
                >
                  <Sparkles className="w-5 h-5 text-brand-gold" />
                  <span>CLAIM FREE REWARDS</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-surface-border/60 max-w-md mx-auto lg:mx-0 text-center lg:text-left">
                <div>
                  <div className="font-heading font-extrabold text-2xl text-brand-gold">৳ 2.5 Lakh+</div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Prize Pool Paid</div>
                </div>
                <div>
                  <div className="font-heading font-extrabold text-2xl text-brand-cyan">15,000+</div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Active Players</div>
                </div>
                <div>
                  <div className="font-heading font-extrabold text-2xl text-brand-red">100%</div>
                  <div className="text-[11px] font-semibold text-gray-400 uppercase">Anti-Cheat Safe</div>
                </div>
              </div>

            </motion.div>

            {/* Right Hero Graphic Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="glass-card rounded-3xl p-6 border-2 border-brand-red/30 shadow-cyber relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/20 rounded-full blur-2xl"></div>

                {/* Hero Featured Tournament Preview */}
                <div className="relative rounded-2xl overflow-hidden h-64 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800"
                    alt="Free Fire Hero Tournament"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand-red text-white text-xs font-black uppercase shadow-neon-red animate-pulse">
                    FEATURED LEAGUE
                  </span>
                </div>

                <h3 className="font-heading font-black text-2xl text-white">
                  Grand Free Fire BR Squad League #42
                </h3>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border">
                  <div>
                    <div className="text-xs text-gray-400">Total Prize Pool</div>
                    <div className="text-2xl font-heading font-extrabold text-brand-gold">৳ 4,000 CASH</div>
                  </div>
                  <Link
                    href="/tournaments/tour_01"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-heading font-bold text-sm shadow-neon-orange hover:brightness-110 transition-all flex items-center gap-1.5"
                  >
                    <span>ENTRY ৳100</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Featured Tournaments Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-brand-orange text-xs font-bold uppercase tracking-widest mb-1">
              <Gamepad2 className="w-4 h-4" />
              <span>Active Competitions</span>
            </div>
            <h2 className="font-heading font-black text-4xl text-white">
              FEATURED TOURNAMENTS
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center space-x-1 bg-surface-light p-1.5 rounded-2xl border border-surface-border overflow-x-auto">
            {(['ALL', 'SQUAD', 'SOLO', 'CS_RANKED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-brand-red to-brand-orange text-white shadow-neon-red'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tournament Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/tournaments"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-xl bg-surface-light border border-surface-border hover:border-brand-orange text-white font-heading font-bold text-sm transition-all"
          >
            <span>VIEW ALL TOURNAMENTS ({tournaments.length})</span>
            <ChevronRight className="w-4 h-4 text-brand-orange" />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-surface/50 border-y border-surface-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-brand-cyan uppercase tracking-widest">
              Simple 4-Step Process
            </span>
            <h2 className="font-heading font-black text-4xl text-white mt-1">
              HOW TO COMPETE & WIN CASH
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="glass-card p-6 rounded-2xl relative border border-surface-border text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-red/20 text-brand-red font-heading font-black text-xl flex items-center justify-center mx-auto border border-brand-red/30">
                01
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Create Account</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Sign up with Google or Email and enter your official Free Fire In-Game UID & Name.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl relative border border-surface-border text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-orange/20 text-brand-orange font-heading font-black text-xl flex items-center justify-center mx-auto border border-brand-orange/30">
                02
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Pay & Register</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Deposit entry fees via bKash, Nagad, or Rocket with fast manual screenshot approval.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl relative border border-surface-border text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 text-brand-cyan font-heading font-black text-xl flex items-center justify-center mx-auto border border-brand-cyan/30">
                03
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Get Room Pass</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Custom Room ID & Password auto-reveals on your dashboard 15 mins before match start.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl relative border border-surface-border text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 text-brand-gold font-heading font-black text-xl flex items-center justify-center mx-auto border border-brand-gold/30">
                04
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Booyah & Payout</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                Score kills, claim Booyah, and withdraw winnings directly to your mobile bank account.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Global Leaderboard Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold text-brand-gold uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-gold" />
              <span>Hall of Champions</span>
            </span>
            <h2 className="font-heading font-black text-4xl text-white">
              GLOBAL PLAYER LEADERBOARD
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Top fraggers and legendary clan captains commanding the highest win rates and earnings this season.
            </p>

            <Link
              href="/leaderboard"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-heading font-bold text-sm shadow-neon-red hover:scale-105 transition-all"
            >
              <span>VIEW FULL RANKINGS</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:col-span-7">
            <div className="glass-card rounded-2xl p-4 border border-surface-border space-y-2">
              {playerLeaderboard.slice(0, 4).map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-light/80 hover:bg-surface-border border border-surface-border transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-heading font-black text-sm ${
                      player.rank === 1 ? 'bg-brand-gold text-black shadow-neon-gold' :
                      player.rank === 2 ? 'bg-gray-300 text-black' :
                      player.rank === 3 ? 'bg-amber-700 text-white' :
                      'bg-surface text-gray-400'
                    }`}>
                      #{player.rank}
                    </div>

                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-10 h-10 rounded-xl object-cover border border-brand-orange/40"
                    />

                    <div>
                      <div className="font-heading font-bold text-white text-base leading-tight flex items-center gap-2">
                        <span>{player.name}</span>
                        {player.tag && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-brand-red/20 text-brand-red font-extrabold uppercase">
                            [{player.tag}]
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">FF UID: {player.ffUid}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-heading font-black text-brand-gold text-lg">
                      ৳ {player.earnings.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-gray-400 font-semibold">
                      {player.kills} Kills • {player.wins} Booyahs
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-brand-orange uppercase tracking-widest flex items-center justify-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-brand-orange" />
            <span>Got Questions?</span>
          </span>
          <h2 className="font-heading font-black text-4xl text-white mt-1">
            FREQUENTLY ASKED QUESTIONS
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl overflow-hidden border border-surface-border transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left font-heading font-bold text-lg text-white flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-5 h-5 text-brand-orange transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 text-sm text-gray-300 leading-relaxed border-t border-surface-border/40 mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
