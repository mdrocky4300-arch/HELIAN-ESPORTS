'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Users, Clock, Flame, ShieldAlert, Award } from 'lucide-react';
import { Tournament, TournamentStatus } from '@/lib/types';
import { getDynamicTournamentStatus } from '@/lib/tournament-utils';

interface TournamentCardProps {
  tournament: Tournament;
}

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const isFree = tournament.entryFee === 0;
  const isFull = tournament.registeredCount >= tournament.maxTeams;

  // Use dynamic status computed on frontend
  const [currentStatus, setCurrentStatus] = useState<TournamentStatus>(
    getDynamicTournamentStatus(tournament)
  );
  
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    // If it's overridden or finished, no need to tick
    if (tournament.status === 'CANCELLED' || tournament.status === 'DRAFT' || tournament.isPaused) {
      setCurrentStatus(tournament.isPaused ? 'DRAFT' : tournament.status);
      return;
    }

    const startTimeStr = tournament.tournamentStart || tournament.matchTime;
    const startTime = startTimeStr ? new Date(startTimeStr).getTime() : 0;
    
    if (startTime === 0) return;

    const intervalId = setInterval(() => {
      const newStatus = getDynamicTournamentStatus(tournament);
      if (newStatus !== currentStatus) {
        setCurrentStatus(newStatus);
      }

      if (newStatus === 'UPCOMING') {
        const now = Date.now();
        const diff = startTime - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / 1000 / 60) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setCountdown(
            `${days}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`
          );
        }
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [tournament, currentStatus]);

  const isLive = currentStatus === 'LIVE';
  const isCompleted = currentStatus === 'FINISHED' || currentStatus === 'CANCELLED';
  const isUpcoming = currentStatus === 'UPCOMING';

  const progressPercent = Math.min(100, Math.round((tournament.registeredCount / tournament.maxTeams) * 100));

  const formatMatchTime = (isoString: string) => {
    if (!isoString) return 'TBA';
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const displayTime = tournament.tournamentStart || tournament.matchTime;


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between relative group border border-surface-border hover:border-brand-orange/50 transition-all duration-300"
    >
      {/* Banner & Badges Overlay */}
      <div className="relative h-44 w-full overflow-hidden bg-surface-light">
        <img
          src={tournament.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'}
          alt={tournament.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-surface/90 backdrop-blur-md text-[11px] font-bold text-white uppercase border border-surface-border">
            {tournament.mode}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-brand-purple/90 backdrop-blur-md text-[11px] font-bold text-white uppercase shadow-neon-cyan">
            {tournament.format.replace('_', ' ')}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isLive && (
            <span className="px-3 py-1 rounded-full bg-brand-red text-white text-[11px] font-extrabold uppercase animate-pulse flex items-center gap-1.5 shadow-neon-red">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              🔴 LIVE NOW
            </span>
          )}
          {isUpcoming && (
            <div className="flex flex-col items-end gap-1">
              <span className="px-2.5 py-1 rounded-lg bg-brand-orange/90 text-white text-[11px] font-bold uppercase shadow-neon-orange">
                UPCOMING
              </span>
              {countdown && (
                <span className="px-2 py-1 rounded bg-black/60 backdrop-blur text-brand-gold text-[10px] font-bold tracking-wider border border-brand-gold/30">
                  Starts in: {countdown}
                </span>
              )}
            </div>
          )}
          {isCompleted && (
            <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 text-[11px] font-bold uppercase border border-gray-700">
              Tournament Finished
            </span>
          )}
        </div>

        {/* Bottom Banner Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-[11px] uppercase font-bold text-gray-400">Total Prize Pool</div>
            <div className="text-2xl font-heading font-black text-brand-gold drop-shadow-md">
              ৳ {tournament.prizePool.toLocaleString()}
            </div>
          </div>
          {tournament.perKillPrize > 0 && (
            <div className="text-right bg-brand-red/20 backdrop-blur-md px-2.5 py-1 rounded-lg border border-brand-red/40">
              <div className="text-[10px] uppercase font-bold text-brand-red">Per Kill</div>
              <div className="text-xs font-bold text-white">৳ {tournament.perKillPrize}</div>
            </div>
          )}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-heading font-extrabold text-xl text-white group-hover:text-brand-orange transition-colors line-clamp-1">
            {tournament.title}
          </h3>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
            {tournament.description}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-surface-light/60 p-3 rounded-xl border border-surface-border">
          <div className="flex items-center space-x-2 text-gray-300">
            <Clock className="w-4 h-4 text-brand-orange shrink-0" />
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">Match Time</div>
              <div className="font-semibold text-white">{displayTime ? formatMatchTime(displayTime.toString()) : "TBA"}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-gray-300">
            <Trophy className="w-4 h-4 text-brand-gold shrink-0" />
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase">Entry Fee</div>
              <div className="font-bold text-brand-gold">
                {isFree ? 'FREE ENTRY' : `৳ ${tournament.entryFee}`}
              </div>
            </div>
          </div>
        </div>

        {/* Registration Capacity Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-semibold">
            <span className="text-gray-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-brand-cyan" /> Registered Teams
            </span>
            <span className={isFull ? 'text-brand-red font-bold' : 'text-brand-cyan'}>
              {tournament.registeredCount} / {tournament.maxTeams}
            </span>
          </div>
          <div className="w-full bg-surface-light h-2 rounded-full overflow-hidden p-0.5 border border-surface-border">
            <div
              className="h-full bg-gradient-to-r from-brand-red via-brand-orange to-brand-gold rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/tournaments/${tournament.id}`} className="block w-full">
          {isLive ? (
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-orange text-white font-heading font-bold text-sm shadow-neon-red hover:brightness-110 transition-all flex items-center justify-center space-x-2">
              <Flame className="w-4 h-4" />
              <span>WATCH / SPECTATE MATCH</span>
            </button>
          ) : isFull ? (
            <button className="w-full py-2.5 rounded-xl bg-surface-light text-gray-400 font-heading font-bold text-sm border border-surface-border cursor-not-allowed">
              SLOTS FULL - VIEW DETAILS
            </button>
          ) : (
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-red via-brand-orange to-brand-gold text-white font-heading font-bold text-sm shadow-neon-orange hover:shadow-neon-red transition-all flex items-center justify-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>JOIN TOURNAMENT</span>
            </button>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
