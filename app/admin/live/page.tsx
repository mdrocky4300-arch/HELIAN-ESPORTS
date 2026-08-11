'use client';

import React, { useState, useEffect } from 'react';

import { Save, Youtube, Link as LinkIcon, Loader2, Plus, Trash2, Trophy } from 'lucide-react';

interface TournamentBase {
  id: string;
  title: string;
  status: string;
}

interface StreamData {
  url: string;
  tournamentId: string;
}
export default function AdminLiveSettingsPage() {
  const [streams, setStreams] = useState<StreamData[]>([{ url: '', tournamentId: '' }]);
  const [tournaments, setTournaments] = useState<TournamentBase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSettings();
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/admin/tournaments');
      if (res.ok) {
        const data = await res.json();
        setTournaments(data.tournaments || []);
      }
    } catch (error) {
      console.error('Failed to fetch tournaments', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        
        const savedUrl = data.settings?.YOUTUBE_LIVE_URL || '';
        try {
          const parsed = JSON.parse(savedUrl);
          if (Array.isArray(parsed) && parsed.length > 0) {
            if (typeof parsed[0] === 'string') {
              setStreams(parsed.map(u => ({ url: u, tournamentId: '' })));
            } else {
              setStreams(parsed);
            }
          } else if (savedUrl && !savedUrl.startsWith('[')) {
             setStreams([{ url: savedUrl, tournamentId: '' }]);
          } else {
            setStreams([{ url: '', tournamentId: '' }]);
          }
        } catch (err) {
          if (savedUrl) setStreams([{ url: savedUrl, tournamentId: '' }]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    const validStreams = streams.filter(s => s.url.trim() !== '').map(s => ({ ...s, url: s.url.trim() }));
    const saveValue = validStreams.length > 0 ? JSON.stringify(validStreams) : '';

    try {
      const resUrls = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'YOUTUBE_LIVE_URL', value: saveValue }),
      });

      if (resUrls.ok) {
        setMessage({ text: 'Live settings saved successfully!', type: 'success' });
        if (validStreams.length === 0) setStreams([{ url: '', tournamentId: '' }]);
      } else {
        setMessage({ text: 'Failed to save settings', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error occurred.', type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleStreamChange = (index: number, field: keyof StreamData, value: string) => {
    const newStreams = [...streams];
    newStreams[index] = { ...newStreams[index], [field]: value };
    setStreams(newStreams);
  };

  const addStream = () => {
    setStreams([...streams, { url: '', tournamentId: '' }]);
  };

  const removeStream = (index: number) => {
    const newStreams = [...streams];
    newStreams.splice(index, 1);
    if (newStreams.length === 0) newStreams.push({ url: '', tournamentId: '' });
    setStreams(newStreams);
  };

  // Extract YouTube ID for preview
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([^&?#]+)/);
    return match && match[1].length === 11 ? match[1] : null;
  };

  const validVideoIds = streams.map(s => getYoutubeId(s.url)).filter(Boolean) as string[];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Youtube className="w-6 h-6 text-brand-red" /> Live Tournament Streams
          </h1>
          <p className="text-gray-400 text-sm mt-1">Configure YouTube Live stream URLs to display on the public website. You can add multiple videos.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-6">
                {streams.map((stream, index) => (
                  <div key={index} className="p-5 rounded-xl border border-slate-700/50 bg-slate-800/30 space-y-4 relative group">
                    <button
                      type="button"
                      onClick={() => removeStream(index)}
                      className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove Stream"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">YouTube URL</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                          type="url"
                          value={stream.url}
                          onChange={(e) => handleStreamChange(index, 'url', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="block w-full pl-9 pr-12 py-2.5 border border-slate-700 rounded-lg bg-slate-800/80 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1 flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-brand-orange" /> Associated Tournament
                      </label>
                      <select
                        value={stream.tournamentId}
                        onChange={(e) => handleStreamChange(index, 'tournamentId', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2.5 border border-slate-700 rounded-lg bg-slate-800/80 text-white focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm appearance-none"
                      >
                        <option value="">-- None --</option>
                        {tournaments.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title} ({t.status})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addStream}
                  className="flex items-center text-sm text-brand-cyan hover:text-brand-cyan/80 font-bold"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Another Stream
                </button>
                
                <p className="text-xs text-gray-500">
                  Paste the full YouTube link. To stop all streams, clear the inputs and save.
                </p>
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || isFetching}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-brand-red hover:bg-brand-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-red disabled:opacity-50 transition-colors"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Live URLs</>}
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">Preview ({validVideoIds.length})</h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {validVideoIds.length > 0 ? (
                validVideoIds.map((id, index) => (
                  <div key={index} className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center relative">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=0&mute=1`}
                      title={`Preview ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="border-0 absolute inset-0"
                    ></iframe>
                  </div>
                ))
              ) : (
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800 flex flex-col items-center justify-center text-center text-gray-500">
                  <Youtube className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No valid YouTube URLs provided</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
