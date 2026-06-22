import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Flame, History, Award, Sparkles, Play, Plus, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AudioPlayerContext } from '../context/AudioPlayerContext';
const API_URL = "https://moody-player-1-snw9.onrender.com";

const Home = () => {
  const navigate = useNavigate();
  const { playTrack } = useContext(AudioPlayerContext);
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const moods = [
    { name: 'Happy', color: 'from-amber-400 to-orange-500', icon: '☀️' },
    { name: 'Sad', color: 'from-blue-600 to-indigo-800', icon: '🌧️' },
    { name: 'Angry', color: 'from-red-600 to-rose-800', icon: '⚡' },
    { name: 'Calm', color: 'from-teal-400 to-emerald-600', icon: '🍃' },
    { name: 'Excited', color: 'from-fuchsia-500 to-pink-600', icon: '🎉' },
    { name: 'Relaxed', color: 'from-violet-500 to-purple-700', icon: '🧘' },
    { name: 'Focused', color: 'from-cyan-500 to-blue-600', icon: '🧠' }
  ];

  const popularArtists = [
    { id: 27, name: 'Daft Punk', picture: 'https://api.deezer.com/artist/27/image' },
    { id: 413, name: 'Coldplay', picture: 'https://api.deezer.com/artist/413/image' },
    { id: 13, name: 'Eminem', picture: 'https://api.deezer.com/artist/13/image' },
    { id: 3824, name: 'The Weeknd', picture: 'https://api.deezer.com/artist/3824/image' },
    { id: 254, name: 'Billie Eilish', picture: 'https://api.deezer.com/artist/254/image' },
    { id: 4099, name: 'Taylor Swift', picture: 'https://api.deezer.com/artist/4099/image' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        // Fetch trending
        const trendingRes = await axios.get(`${API_URL}/api/music/chart`);
        setTrendingTracks(trendingRes.data.slice(0, 8));

        if (token) {
          // Fetch recently played
          const recentRes = await axios.get(`${API_URL}/api/library/recently-played`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRecentlyPlayed(recentRes.data.slice(0, 6));

          // Fetch user playlists
          const playlistRes = await axios.get(`${API_URL}/api/library/playlists`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUserPlaylists(playlistRes.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMoodClick = (moodName) => {
    navigate(`/mood?select=${moodName.toLowerCase()}`);
  };

  const handleArtistClick = (artistId) => {
    navigate(`/search?artist=${artistId}`);
  };

  const handleAddToPlaylist = async (song, playlistId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(`${API_URL}/api/library/playlists/${playlistId}/add`, { song }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Song added to playlist!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding song.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } }
  };

  return (
    <div className="pb-32 pt-6 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      {/* Animated Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl p-6 md:p-10 mb-10 overflow-hidden bg-hero-gradient border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6"
      >
        <div className="flex-1 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-primaryAccent/15 text-primaryAccent px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-primaryAccent/20"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Introducing Emotional Soundtracks
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            How are you feeling <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-accent-gradient">right now?</span>
          </h2>
          <p className="text-textSecondary text-sm md:text-base mt-4 max-w-md">
            Scan your face using our high-tech AI sensor to detect your current mood, and let us recommend a highly polished track lineup.
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
            <motion.button
              onClick={() => navigate('/mood')}
              className="px-6 py-3 bg-accent-gradient hover:opacity-95 text-darkBg font-bold text-sm rounded-full shadow-premium hover:shadow-accent-glow transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Camera className="w-4 h-4 fill-current" />
              Scan My Mood
            </motion.button>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm font-semibold rounded-full transition-colors"
            >
              Browse Library
            </button>
          </div>
        </div>

        {/* Hero Visual Block */}
        <div className="w-64 h-64 md:w-80 md:h-80 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primaryAccent/10 blur-[50px] animate-pulse" />
          <motion.div
            className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-darkSurface border border-white/10 flex items-center justify-center relative shadow-premium"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute inset-2 rounded-full border border-dashed border-white/10" />
            <div className="absolute inset-6 rounded-full border border-primaryAccent/20" />
            <div className="w-24 h-24 rounded-full bg-accent-gradient flex items-center justify-center shadow-accent-glow text-darkBg text-2xl font-bold">
              AI 🎧
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Mood playlists shortcuts */}
      <section className="mb-12">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="text-primaryAccent w-5 h-5" />
          Quick Mood Selectors
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {moods.map((mood) => (
            <motion.button
              key={mood.name}
              onClick={() => handleMoodClick(mood.name)}
              className={`p-4 rounded-2xl bg-gradient-to-br ${mood.color} text-white flex flex-col items-center justify-center gap-2 shadow-premium hover:shadow-lg relative overflow-hidden group`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-2xl">{mood.icon}</span>
              <span className="font-bold text-xs uppercase tracking-wider">{mood.name}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Trending & Recommendations */}
        <div className="lg:col-span-2">
          <section className="mb-10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Flame className="text-orange-500 w-5 h-5 fill-orange-500" />
              Trending Now
            </h3>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {trendingTracks.map((track) => (
                  <motion.div
                    key={track.id}
                    variants={itemVariants}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group relative cursor-pointer"
                    onClick={() => playTrack(track, trendingTracks)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg overflow-hidden relative flex-shrink-0">
                        <img
                          src={track.album?.cover || 'https://via.placeholder.com/150'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-5 h-5 fill-white text-white" />
                        </div>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                        <p className="text-xs text-textSecondary truncate">{track.artist?.name}</p>
                      </div>
                    </div>

                    {/* Quick Playlist Add */}
                    {userPlaylists.length > 0 && (
                      <div className="relative group/add opacity-0 group-hover:opacity-100 transition-opacity px-2 z-10" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 text-textSecondary hover:text-white rounded-full hover:bg-white/5">
                          <Plus className="w-4 h-4" />
                        </button>
                        {/* Dropdown for playlists */}
                        <div className="absolute right-0 bottom-full mb-1 bg-darkCard border border-white/10 rounded-lg p-1 shadow-2xl hidden group-hover/add:block w-36">
                          <p className="text-[10px] text-textSecondary px-2 py-1 font-bold">Add to Playlist</p>
                          {userPlaylists.map(pl => (
                            <button
                              key={pl._id}
                              onClick={() => handleAddToPlaylist(track, pl._id)}
                              className="w-full text-left text-xs text-white hover:bg-primaryAccent/20 px-2 py-1 rounded transition-colors truncate"
                            >
                              {pl.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>
        </div>

        {/* Right Column: Recently Played & Popular Artists */}
        <div className="space-y-10">
          {/* Recently Played */}
          {recentlyPlayed.length > 0 && (
            <section>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <History className="text-primaryAccent w-5 h-5" />
                Recently Played
              </h3>
              <div className="space-y-3">
                {recentlyPlayed.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, recentlyPlayed)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <img
                      src={track.album?.cover || 'https://via.placeholder.com/150'}
                      alt={track.title}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-white truncate">{track.title}</h4>
                      <p className="text-[10px] text-textSecondary truncate">{track.artist?.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Popular Artists */}
          <section>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Award className="text-secondaryAccent w-5 h-5" />
              Popular Artists
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {popularArtists.map((artist) => (
                <div
                  key={artist.id}
                  onClick={() => handleArtistClick(artist.id)}
                  className="flex flex-col items-center cursor-pointer group"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border border-white/5 relative mb-2">
                    <img
                      src={artist.picture}
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <span className="text-xs text-white group-hover:text-primaryAccent transition-colors text-center truncate w-full px-1">
                    {artist.name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Home;