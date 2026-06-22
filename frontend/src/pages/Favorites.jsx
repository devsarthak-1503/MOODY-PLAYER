import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Play, Shuffle, ArrowDownAZ, ArrowUpAZ, Clock, Trash2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AudioPlayerContext } from '../context/AudioPlayerContext';

const Favorites = () => {
  const navigate = useNavigate();
  const { playTrack, playlist, isShuffle, toggleShuffle } = useContext(AudioPlayerContext);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('newest'); // newest | alphabetical | duration

  const fetchFavorites = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('/api/library/favorites', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSongs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handlePlayAll = () => {
    if (songs.length === 0) return;
    playTrack(songs[0], songs);
  };

  const handleShufflePlay = () => {
    if (songs.length === 0) return;
    if (!isShuffle) {
      toggleShuffle();
    }
    // Pick a random track index
    const randomIndex = Math.floor(Math.random() * songs.length);
    playTrack(songs[randomIndex], songs);
  };

  const handleRemoveTrack = async (songId) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.post('/api/library/favorites/remove', { songId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSongs(res.data);
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  const getSortedSongs = () => {
    const songsCopy = [...songs];
    if (sortOrder === 'alphabetical') {
      return songsCopy.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sortOrder === 'duration') {
      return songsCopy.sort((a, b) => b.duration - a.duration);
    }
    return songsCopy; // newest is default server order
  };

  const sortedSongs = getSortedSongs();

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="pb-32 pt-6 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        {/* Large Heart Graphic Banner */}
        <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-700 flex items-center justify-center text-white shadow-2xl relative">
          <Heart className="w-20 h-20 fill-white" />
        </div>

        <div className="text-center md:text-left flex-1">
          <span className="text-xs uppercase font-bold tracking-widest text-primaryAccent">Playlist</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-1">Liked Songs</h2>
          <p className="text-sm text-textSecondary mt-3">
            {songs.length} premium tracks saved to your space
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
            <motion.button
              disabled={songs.length === 0}
              onClick={handlePlayAll}
              className="px-6 py-3 bg-accent-gradient hover:opacity-95 text-darkBg font-bold text-sm rounded-full shadow-premium hover:shadow-accent-glow transition-all flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4.5 h-4.5 fill-current" />
              Play All
            </motion.button>
            <button
              disabled={songs.length === 0}
              onClick={handleShufflePlay}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle Play
            </button>
          </div>
        </div>
      </div>

      {/* Sorting bar */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
        <h3 className="text-base font-bold text-white">Tracks Lineup</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-textSecondary hidden sm:inline">Sort by:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="bg-white/5 border border-white/5 focus:border-primaryAccent rounded-lg text-xs text-white p-2 outline-none cursor-pointer"
          >
            <option value="newest" className="bg-darkCard">Recently Added</option>
            <option value="alphabetical" className="bg-darkCard">Alphabetical</option>
            <option value="duration" className="bg-darkCard">Duration</option>
          </select>
        </div>
      </div>

      {/* Songs Table */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : sortedSongs.length > 0 ? (
        <div className="space-y-3">
          {sortedSongs.map((track, idx) => (
            <div
              key={track.id}
              onClick={() => playTrack(track, sortedSongs)}
              className="flex items-center justify-between p-3.5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl cursor-pointer group transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <span className="text-xs font-bold text-textSecondary w-4 text-center">
                  {idx + 1}
                </span>
                <img
                  src={track.album?.cover || 'https://via.placeholder.com/150'}
                  alt={track.title}
                  className="w-11 h-11 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{track.title}</h4>
                  <p className="text-xs text-textSecondary truncate">{track.artist?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <span className="text-xs text-textSecondary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {formatDuration(track.duration)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTrack(track.id);
                  }}
                  className="p-2 text-textSecondary hover:text-red-400 rounded-full hover:bg-white/5 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-2xl border border-white/5">
          <Heart className="w-12 h-12 text-textSecondary mx-auto mb-4 opacity-50" />
          <h4 className="text-white font-bold text-base mb-1">Your Favorites is Empty</h4>
          <p className="text-xs text-textSecondary mb-6">Start browsing track recommendations to add them here.</p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold rounded-full"
          >
            Find Music
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
