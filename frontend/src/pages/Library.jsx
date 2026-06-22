import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Library as LibraryIcon, ListMusic, Heart, History, Sparkles, Plus, FolderHeart, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { AudioPlayerContext } from '../context/AudioPlayerContext';

const Library = () => {
  const navigate = useNavigate();
  const { playTrack } = useContext(AudioPlayerContext);
  const [activeTab, setActiveTab] = useState('playlists'); // playlists | favorites | mood | history
  
  // Data states
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [moodHistory, setMoodHistory] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Playlist creation state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const fetchLibraryData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [playlistsRes, favoritesRes, moodRes, recentRes] = await Promise.all([
        axios.get('/api/library/playlists', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/library/favorites', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/library/mood-history', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/library/recently-played', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setPlaylists(playlistsRes.data);
      setFavorites(favoritesRes.data);
      setMoodHistory(moodRes.data);
      setRecentlyPlayed(recentRes.data);
    } catch (err) {
      console.error('Error fetching library details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, [activeTab]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('/api/library/playlists', { name: newPlaylistName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists([res.data, ...playlists]);
      setNewPlaylistName('');
      setShowCreateModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (playlistId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/library/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylists(playlists.filter(pl => pl._id !== playlistId));
    } catch (err) {
      console.error(err);
    }
  };

  const selectPlaylist = (playlistId) => {
    navigate(`/playlist/${playlistId}`);
  };

  const tabs = [
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'mood', label: 'Mood Logs', icon: Sparkles },
    { id: 'history', label: 'History', icon: History }
  ];

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="pb-32 pt-6 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* Header with quick creation bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LibraryIcon className="text-primaryAccent w-7 h-7" />
            My Space
          </h2>
          <p className="text-textSecondary text-sm mt-1">Manage playlists, view scanned metrics, and stream recently played tracks.</p>
        </div>

        {activeTab === 'playlists' && (
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="self-start sm:self-auto px-5 py-2.5 bg-accent-gradient hover:opacity-95 text-darkBg font-bold text-xs uppercase tracking-wider rounded-full shadow-premium hover:shadow-accent-glow transition-all flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </motion.button>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-2 mb-8 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primaryAccent text-primaryAccent bg-white/5 rounded-t-xl'
                  : 'border-transparent text-textSecondary hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* PLAYLISTS TAB */}
          {activeTab === 'playlists' && (
            <motion.div
              key="playlists"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {playlists.length > 0 ? (
                playlists.map(pl => (
                  <div
                    key={pl._id}
                    onClick={() => selectPlaylist(pl._id)}
                    className="glass-card p-5 rounded-2xl border border-white/5 cursor-pointer relative group flex flex-col justify-between aspect-square"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-xl bg-primaryAccent/10 flex items-center justify-center text-primaryAccent">
                        <FolderHeart className="w-6 h-6" />
                      </div>
                      <button
                        onClick={(e) => handleDeletePlaylist(pl._id, e)}
                        className="opacity-0 group-hover:opacity-100 text-textSecondary hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-opacity"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div className="mt-8">
                      <h4 className="text-base font-bold text-white group-hover:text-primaryAccent transition-colors truncate">
                        {pl.name}
                      </h4>
                      <p className="text-xs text-textSecondary mt-1">
                        {pl.songs?.length || 0} tracks
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center glass-panel rounded-2xl border border-white/5">
                  <ListMusic className="w-12 h-12 text-textSecondary mx-auto mb-4 opacity-50" />
                  <h4 className="text-white font-bold text-base mb-1">Create Your First Playlist</h4>
                  <p className="text-xs text-textSecondary mb-6">Group your favorite emotional tracks together.</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold rounded-full"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* FAVORITES TAB */}
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {favorites.length > 0 ? (
                favorites.map(track => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, favorites)}
                    className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={track.album?.cover || 'https://via.placeholder.com/150'}
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                        <p className="text-xs text-textSecondary truncate">{track.artist?.name}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white text-white group-hover:text-darkBg flex items-center justify-center transition-colors">
                      <Heart className="w-4 h-4 fill-primaryAccent text-primaryAccent" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center glass-panel rounded-2xl border border-white/5">
                  <Heart className="w-12 h-12 text-textSecondary mx-auto mb-4 opacity-50" />
                  <h4 className="text-white font-bold text-base mb-1">No Liked Songs Yet</h4>
                  <p className="text-xs text-textSecondary">Click the heart button on any player or track card to save songs here.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* MOOD HISTORY LOGS TAB */}
          {activeTab === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4 max-w-xl mx-auto"
            >
              {moodHistory.length > 0 ? (
                moodHistory.map(log => (
                  <div
                    key={log._id}
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">
                        {log.mood === 'Happy' && '☀️'}
                        {log.mood === 'Sad' && '🌧️'}
                        {log.mood === 'Angry' && '⚡'}
                        {log.mood === 'Calm' && '🍃'}
                        {log.mood === 'Excited' && '🎉'}
                        {log.mood === 'Relaxed' && '🧘'}
                        {log.mood === 'Focused' && '🧠'}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-white">{log.mood}</h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-textSecondary">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-primaryAccent bg-primaryAccent/10 border border-primaryAccent/20 px-2.5 py-1 rounded-full">
                      {log.confidence}% Conf.
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center glass-panel rounded-2xl border border-white/5">
                  <Sparkles className="w-12 h-12 text-textSecondary mx-auto mb-4 opacity-50" />
                  <h4 className="text-white font-bold text-base mb-1">No Mood History Captured</h4>
                  <p className="text-xs text-textSecondary">Trigger the AI Mood Radar camera scanner to start logging metrics.</p>
                </div>
              )}
            </motion.div>
          )}

          {/* RECENTLY PLAYED TAB */}
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {recentlyPlayed.length > 0 ? (
                recentlyPlayed.map((track, idx) => (
                  <div
                    key={`${track.id}-${idx}`}
                    onClick={() => playTrack(track, recentlyPlayed)}
                    className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl cursor-pointer group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <img
                        src={track.album?.cover || 'https://via.placeholder.com/150'}
                        alt={track.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                        <p className="text-xs text-textSecondary truncate">{track.artist?.name}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white text-white group-hover:text-darkBg flex items-center justify-center transition-colors">
                      <Play className="w-4 h-4 fill-current translate-x-[0.5px]" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center glass-panel rounded-2xl border border-white/5">
                  <History className="w-12 h-12 text-textSecondary mx-auto mb-4 opacity-50" />
                  <h4 className="text-white font-bold text-base mb-1">No Listening History</h4>
                  <p className="text-xs text-textSecondary">Your recently played tracks will display here automatically.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* CREATE PLAYLIST DIALOG MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm glass-panel p-6 rounded-2xl border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-4">Create Playlist</h3>
              <form onSubmit={handleCreatePlaylist} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="My Chill Hits"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/5 focus:border-primaryAccent rounded-xl text-sm text-white placeholder-textSecondary outline-none transition-all"
                />

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewPlaylistName('');
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-accent-gradient text-darkBg rounded-lg text-xs font-bold transition-all shadow-premium"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Library;
