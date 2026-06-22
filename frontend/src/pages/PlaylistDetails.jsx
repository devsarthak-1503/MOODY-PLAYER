import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListMusic, Play, Pencil, Trash2, Plus, Clock, Search, Trash, Check, X, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { AudioPlayerContext } from '../context/AudioPlayerContext';

const PlaylistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playTrack } = useContext(AudioPlayerContext);
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rename states
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState('');

  // Add songs search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchPlaylistDetails = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get('/api/library/playlists', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const pl = res.data.find(p => p._id === id);
      if (!pl) {
        navigate('/library');
        return;
      }
      setPlaylist(pl);
      setEditName(pl.name);
    } catch (err) {
      console.error(err);
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const handleRename = async (e) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await axios.put(`/api/library/playlists/${id}`, { name: editName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylist(res.data);
      setIsEditingName(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error renaming playlist');
    }
  };

  const handleDeletePlaylist = async () => {
    if (!window.confirm('Delete this playlist permanently?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`/api/library/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/library');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveTrack = async (songId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`/api/library/playlists/${id}/remove`, { songId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylist(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSongs = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    try {
      const res = await axios.get(`/api/music/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearchSongs();
      } else {
        setSearchResults([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddSong = async (song) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`/api/library/playlists/${id}/add`, { song }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlaylist(res.data);
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Song already in playlist');
    }
  };

  const handlePlayAll = () => {
    if (!playlist || playlist.songs.length === 0) return;
    playTrack(playlist.songs[0], playlist.songs);
  };

  const formatDuration = (sec) => {
    const m = Math.floor(sec / 60);
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  if (loading) {
    return (
      <div className="pb-32 pt-20 px-8 max-w-7xl mx-auto flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primaryAccent" />
      </div>
    );
  }

  if (!playlist) return null;

  return (
    <div className="pb-32 pt-6 px-4 md:px-8 max-w-7xl mx-auto overflow-hidden">
      
      {/* Back to Library link */}
      <button
        onClick={() => navigate('/library')}
        className="flex items-center gap-2 text-textSecondary hover:text-white mb-6 text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Library
      </button>

      {/* Playlist Banner Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
        <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl relative">
          <ListMusic className="w-20 h-20" />
        </div>

        <div className="text-center md:text-left flex-1 min-w-0">
          <span className="text-xs uppercase font-bold tracking-widest text-primaryAccent">Playlist</span>
          
          {/* Editable Name Form */}
          {isEditingName ? (
            <form onSubmit={handleRename} className="flex items-center gap-3 justify-center md:justify-start mt-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-white/5 border border-white/10 focus:border-primaryAccent rounded-xl text-xl md:text-3xl font-extrabold text-white px-4 py-1.5 outline-none max-w-sm"
                autoFocus
              />
              <button type="submit" className="p-2 text-secondaryAccent hover:bg-white/5 rounded-full">
                <Check className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => setIsEditingName(false)} className="p-2 text-red-400 hover:bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-3 justify-center md:justify-start mt-1">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white truncate max-w-md">{playlist.name}</h2>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-2 text-textSecondary hover:text-white rounded-full hover:bg-white/5"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-sm text-textSecondary mt-4">
            {playlist.songs?.length || 0} premium tracks saved to playlist
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
            <motion.button
              disabled={playlist.songs?.length === 0}
              onClick={handlePlayAll}
              className="px-6 py-3 bg-accent-gradient hover:opacity-95 text-darkBg font-bold text-sm rounded-full shadow-premium hover:shadow-accent-glow transition-all flex items-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-4.5 h-4.5 fill-current" />
              Play Queue
            </motion.button>
            <button
              onClick={handleDeletePlaylist}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-full border border-red-500/20 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4.5 h-4.5" />
              Delete Playlist
            </button>
          </div>
        </div>
      </div>

      {/* Playlist lineup list */}
      <section className="mb-12">
        <h3 className="text-base font-bold text-white mb-6">Playlist Track Lineup</h3>

        {playlist.songs?.length > 0 ? (
          <div className="space-y-3">
            {playlist.songs.map((track, idx) => (
              <div
                key={track.id}
                onClick={() => playTrack(track, playlist.songs)}
                className="flex items-center justify-between p-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl cursor-pointer group transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-xs font-bold text-textSecondary w-4 text-center">
                    {idx + 1}
                  </span>
                  <img
                    src={track.album?.cover || 'https://via.placeholder.com/150'}
                    alt={track.title}
                    className="w-10 h-10 rounded-md object-cover"
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
                    className="p-2 text-textSecondary hover:text-red-400 rounded-full hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-14 text-center glass-panel rounded-2xl border border-white/5">
            <p className="text-xs text-textSecondary">This playlist has no tracks yet. Use search below to append songs!</p>
          </div>
        )}
      </section>

      {/* Recommended add song segment */}
      <section className="glass-panel p-6 rounded-2xl border border-white/5 max-w-2xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primaryAccent" />
          Add Tracks to Playlist
        </h3>
        
        <div className="relative mb-6">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-textSecondary" />
          <input
            type="text"
            placeholder="Search tracks by artist or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/5 focus:border-primaryAccent rounded-xl text-xs text-white placeholder-textSecondary outline-none transition-all"
          />
        </div>

        {searchLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.album?.cover || 'https://via.placeholder.com/150'}
                    alt={item.title}
                    className="w-9 h-9 rounded object-cover"
                  />
                  <div className="min-w-0 text-xs">
                    <h4 className="font-semibold text-white truncate">{item.title}</h4>
                    <p className="text-textSecondary truncate">{item.artist?.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddSong(item)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-primaryAccent hover:text-darkBg text-white text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            ))}
          </div>
        ) : searchQuery ? (
          <p className="text-xs text-textSecondary text-center py-4">No matching songs found</p>
        ) : null}
      </section>
    </div>
  );
};

export default PlaylistDetails;
