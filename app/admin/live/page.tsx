'use client';

import React, { useState, useEffect } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { Save, Youtube, Link as LinkIcon, Loader2, Plus, Trash2 } from 'lucide-react';

export default function AdminLiveSettingsPage() {
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(['']);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const savedUrl = data.settings?.YOUTUBE_LIVE_URL || '';
        try {
          const parsed = JSON.parse(savedUrl);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setYoutubeUrls(parsed);
          } else if (savedUrl && !savedUrl.startsWith('[')) {
             // Fallback for previous single string
             setYoutubeUrls([savedUrl]);
          } else {
            setYoutubeUrls(['']);
          }
        } catch {
          if (savedUrl) setYoutubeUrls([savedUrl]);
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

    const validUrls = youtubeUrls.map(u => u.trim()).filter(u => u !== '');
    const saveValue = validUrls.length > 0 ? JSON.stringify(validUrls) : '';

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'YOUTUBE_LIVE_URL', value: saveValue }),
      });

      if (res.ok) {
        setMessage({ text: 'Live URLs saved successfully!', type: 'success' });
        if (validUrls.length === 0) setYoutubeUrls(['']);
      } else {
        const err = await res.json();
        setMessage({ text: err.message || 'Failed to save', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error occurred.', type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...youtubeUrls];
    newUrls[index] = value;
    setYoutubeUrls(newUrls);
  };

  const addUrl = () => {
    setYoutubeUrls([...youtubeUrls, '']);
  };

  const removeUrl = (index: number) => {
    const newUrls = [...youtubeUrls];
    newUrls.splice(index, 1);
    if (newUrls.length === 0) newUrls.push('');
    setYoutubeUrls(newUrls);
  };

  // Extract YouTube ID for preview
  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|live\/))([^&?#]+)/);
    return match && match[1].length === 11 ? match[1] : null;
  };

  const validVideoIds = youtubeUrls.map(u => getYoutubeId(u)).filter(Boolean) as string[];

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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">YouTube Live/Video URLs</label>
                
                <div className="space-y-3">
                  {youtubeUrls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUrl(index)}
                        className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Remove URL"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addUrl}
                  className="mt-3 flex items-center text-sm text-brand-cyan hover:text-brand-cyan/80 font-bold"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Another Stream
                </button>

                <p className="mt-2 text-xs text-gray-500">
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
    </AdminShell>
  );
}
