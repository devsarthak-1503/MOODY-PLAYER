import React, { useState, useEffect } from 'react';
import { User, Mail, Sparkles, FolderHeart, Heart, Cpu, BarChart3, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Profile = () => {
  const userName = localStorage.getItem('userName') || 'Premium Listener';
  const userEmail = localStorage.getItem('userEmail') || 'member@moodyplayer.com';
  const userAvatar = localStorage.getItem('userAvatar') || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userName}`;

  // Counts
  const [playlistCount, setPlaylistCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [historyCount, setHistoryCount] = useState(0);
  
  // Mood metrics
  const [moodBreakdown, setMoodBreakdown] = useState({});
  const [favoriteMood, setFavoriteMood] = useState('Neutral');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const [playlistsRes, favoritesRes, moodRes] = await Promise.all([
          axios.get('/api/library/playlists', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/library/favorites', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/library/mood-history', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setPlaylistCount(playlistsRes.data.length);
        setFavoriteCount(favoritesRes.data.length);
        setHistoryCount(moodRes.data.length);

        // Compute mood distribution frequency
        const logs = moodRes.data;
        if (logs.length > 0) {
          const counts = {};
          logs.forEach(log => {
            counts[log.mood] = (counts[log.mood] || 0) + 1;
          });

          // Convert to percentage
          const percentages = {};
          let topMood = 'Neutral';
          let maxCount = 0;

          Object.entries(counts).forEach(([mood, count]) => {
            percentages[mood] = Math.round((count / logs.length) * 100);
            if (count > maxCount) {
              maxCount = count;
              topMood = mood;
            }
          });

          setMoodBreakdown(percentages);
          setFavoriteMood(topMood);
        }

      } catch (err) {
        console.error('Error fetching profile stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Playlists Created', value: playlistCount, icon: FolderHeart, color: 'text-primaryAccent bg-primaryAccent/10 border-primaryAccent/20' },
    { label: 'Liked Songs', value: favoriteCount, icon: Heart, color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
    { label: 'Webcam Sessions', value: historyCount, icon: Cpu, color: 'text-secondaryAccent bg-secondaryAccent/10 border-secondaryAccent/20' }
  ];

  return (
    <div className="pb-32 pt-6 px-4 md:px-8 max-w-6xl mx-auto overflow-hidden">
      
      {/* Profile Header Dashboard Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-6 md:p-8 mb-10 overflow-hidden bg-hero-gradient border border-white/5 flex flex-col md:flex-row items-center gap-6"
      >
        <img
          src={userAvatar}
          alt={userName}
          className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-primaryAccent/40 shadow-premium bg-darkBg"
        />

        <div className="text-center md:text-left flex-grow">
          <span className="text-[10px] uppercase font-bold tracking-widest text-primaryAccent px-3 py-1 bg-primaryAccent/10 border border-primaryAccent/20 rounded-full">
            Premium Member
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-4">{userName}</h2>
          <div className="flex items-center justify-center md:justify-start gap-2 text-textSecondary text-sm mt-1">
            <Mail className="w-4 h-4" />
            <span>{userEmail}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center min-w-[140px]">
          <p className="text-[10px] text-textSecondary uppercase tracking-widest font-semibold">Primary Emotion</p>
          <p className="text-xl font-extrabold text-transparent bg-clip-text bg-accent-gradient mt-1">
            {favoriteMood}
          </p>
        </div>
      </motion.div>

      {/* Grid for metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-5 rounded-2xl border border-white/5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-textSecondary uppercase tracking-wider font-semibold">{stat.label}</p>
                <p className="text-3xl font-extrabold text-white mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics chart panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="text-primaryAccent w-5 h-5" />
            Weekly Mood Distribution
          </h3>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : Object.keys(moodBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(moodBreakdown)
                .sort((a, b) => b[1] - a[1])
                .map(([mood, val]) => (
                  <div key={mood} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white flex items-center gap-2">
                        <span>
                          {mood === 'Happy' && '☀️'}
                          {mood === 'Sad' && '🌧️'}
                          {mood === 'Angry' && '⚡'}
                          {mood === 'Calm' && '🍃'}
                          {mood === 'Excited' && '🎉'}
                          {mood === 'Relaxed' && '🧘'}
                          {mood === 'Focused' && '🧠'}
                        </span>
                        {mood}
                      </span>
                      <span className="text-textSecondary">{val}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-gradient rounded-full transition-all duration-500"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-textSecondary text-xs py-14">
              Scan your face on the radar to load emotional metrics.
            </p>
          )}
        </div>

        {/* Insight card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="text-primaryAccent w-5 h-5" />
              Listener Insights
            </h3>
            
            {historyCount > 0 ? (
              <div className="space-y-4 mt-2">
                <div className="p-4 rounded-xl bg-primaryAccent/5 border border-primaryAccent/10 text-sm text-textSecondary leading-relaxed">
                  Based on your last <strong className="text-white">{historyCount}</strong> facial scans, your primary emotional valence matches <strong className="text-white">{favoriteMood}</strong>.
                </div>
                <div className="text-xs text-textSecondary leading-relaxed">
                  We've adjusted your Home recommend banners. Moody Player suggests streaming <strong className="text-white">{favoriteMood.toLowerCase()}</strong> genres to enhance or balance your current vibe.
                </div>
              </div>
            ) : (
              <p className="text-xs text-textSecondary leading-relaxed py-10 text-center">
                Awaiting scanning sessions. Insights automatically compile on successful scans.
              </p>
            )}
          </div>

          <div className="border-t border-white/5 pt-4 mt-6 flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-textSecondary flex-shrink-0" />
            <span className="text-[10px] text-textSecondary leading-normal">
              Need help resetting credentials or updating premium metrics? Please contact support@moodyplayer.com.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
