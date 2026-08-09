import React from 'react';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { prisma } from '@/lib/prisma';
import { Youtube, Flame } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Tournament | Helian Esports',
  description: 'Watch live Free Fire tournaments and matches on Helian Esports.',
};

export const revalidate = 10; // revalidate every 10 seconds

export default async function LivePage() {
  const liveSetting = await prisma.siteSetting.findUnique({
    where: { key: 'YOUTUBE_LIVE_URL' },
  });

  const savedUrl = liveSetting?.value || '';
  
  let youtubeUrls: string[] = [];
  try {
    const parsed = JSON.parse(savedUrl);
    if (Array.isArray(parsed)) {
      youtubeUrls = parsed;
    } else {
      youtubeUrls = [savedUrl];
    }
  } catch {
    youtubeUrls = savedUrl ? [savedUrl] : [];
  }

  // Extract YouTube ID
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([^&?#]+)/);
    return match && match[1].length === 11 ? match[1] : null;
  };

  const videoIds = youtubeUrls.map(u => getYoutubeId(u)).filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-brand-red/30">
      <Navbar />

      <main className="flex-grow pt-24 pb-20 lg:pt-28 lg:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-brand-red font-bold uppercase tracking-widest text-sm animate-pulse">
            <Flame className="w-4 h-4" />
            <span>Live Broadcast</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white font-heading tracking-tight uppercase">
            Watch our daily Free Fire tournaments live! Join the stream, cheer for your favorite squads, and don't miss the intense action.
          </h1>
        </div>

        <div className={`grid gap-8 ${videoIds.length > 1 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {videoIds.length > 0 ? (
            videoIds.map((id, index) => (
              <div key={index} className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative group shadow-cyber border border-brand-red/20 shadow-brand-red/10">
                {/* Glowing border effect */}
                <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-red via-brand-orange to-brand-red rounded-2xl opacity-20 blur-sm group-hover:opacity-40 transition-opacity duration-500" />
                
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=${index === 0 ? '1' : '0'}`}
                  title={`YouTube video player ${index + 1}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 border-0"
                ></iframe>
              </div>
            ))
          ) : (
            <div className="aspect-video w-full rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center p-6 space-y-4 col-span-full">
              <Youtube className="w-20 h-20 text-gray-700 mx-auto" />
              <div>
                <h3 className="text-2xl font-heading font-bold text-gray-400">OFFLINE</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">There is no live tournament broadcasting at the moment. Please check back later or view our tournament schedule.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
