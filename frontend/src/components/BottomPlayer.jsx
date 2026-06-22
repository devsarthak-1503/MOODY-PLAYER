import React, { useContext, useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Volume2, VolumeX, Heart, ChevronUp, ChevronDown, ListMusic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioPlayerContext } from '../context/AudioPlayerContext';
import axios from 'axios';

const BottomPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    volume,
    isMuted,
    isShuffle,
    isRepeat,
    duration,
    progress,
    changeVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    seekTo
  } = useContext(AudioPlayerContext);

  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); // Mobile expand view

  // Check if currentTrack is liked
  useEffect(() => {
    if (!currentTrack) return;
    const fetchLikedState = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get('/api/library/favorites', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const liked = res.data.some(s => s.id === currentTrack.id);
        setIsLiked(liked);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLikedState();
  }, [currentTrack]);

  const handleLikeToggle = async () => {
    if (!currentTrack) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      if (isLiked) {
        await axios.post('/api/library/favorites/remove', { songId: currentTrack.id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(false);
      } else {
        await axios.post('/api/library/favorites/add', { song: currentTrack }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsLiked(true);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-darkSurface/90 border-t border-white/5 backdrop-blur-md flex items-center justify-center text-textSecondary text-sm z-40">
        <p className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 animate-pulse text-primaryAccent" />
          Select a song or scan your mood to start playing music
        </p>
      </div>
    );
  }

  return (
    <>
      {/* DESKTOP PLAYER */}
      <div className="fixed bottom-0 left-0 md:left-64 right-0 h-24 bg-darkSurface/95 border-t border-white/5 backdrop-blur-lg px-6 py-3 flex items-center justify-between z-40 hidden md:flex">
        {/* Left Section: Cover & Title */}
        <div className="flex items-center gap-4 w-1/4 min-w-[200px]">
          <img
            src={currentTrack.album?.cover || 'https://via.placeholder.com/150'}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-lg object-cover shadow-premium border border-white/5"
          />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate hover:underline cursor-pointer">
              {currentTrack.title}
            </h4>
            <p className="text-xs text-textSecondary truncate hover:underline cursor-pointer">
              {currentTrack.artist?.name}
            </p>
          </div>
          <button
            onClick={handleLikeToggle}
            className="ml-3 text-textSecondary hover:text-white transition-colors focus:outline-none"
          >
            <Heart
              className={`w-5 h-5 ${isLiked ? 'fill-primaryAccent text-primaryAccent' : 'text-textSecondary hover:text-white'}`}
            />
          </button>
        </div>

        {/* Center Section: Controls & Progress */}
        <div className="flex flex-col items-center gap-2 w-2/5">
          <div className="flex items-center gap-6">
            <button
              onClick={toggleShuffle}
              className={`transition-colors ${isShuffle ? 'text-secondaryAccent hover:text-secondaryAccent/80' : 'text-textSecondary hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={playPrev} className="text-textSecondary hover:text-white transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <motion.button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white text-darkBg flex items-center justify-center shadow-premium focus:outline-none"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-[1px]" />}
            </motion.button>
            <button onClick={playNext} className="text-textSecondary hover:text-white transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition-colors ${isRepeat ? 'text-secondaryAccent hover:text-secondaryAccent/80' : 'text-textSecondary hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Slider */}
          <div className="flex items-center gap-3 w-full text-[10px] text-textSecondary">
            <span>{formatTime(progress)}</span>
            <div className="relative flex-1 group py-1.5 cursor-pointer">
              <input
                type="range"
                min="0"
                max={duration || 30}
                value={progress}
                onChange={(e) => seekTo(e.target.value)}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primaryAccent outline-none focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #00E5FF 0%, #00E5FF ${(progress / (duration || 30)) * 100}%, rgba(255,255,255,0.1) ${(progress / (duration || 30)) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />
            </div>
            <span>{formatTime(duration || 30)}</span>
          </div>
        </div>

        {/* Right Section: Volume */}
        <div className="flex items-center gap-3 w-1/4 justify-end">
          <button onClick={toggleMute} className="text-textSecondary hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => changeVolume(e.target.value)}
            className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primaryAccent outline-none"
            style={{
              background: `linear-gradient(to right, #00E5FF 0%, #00E5FF ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.1) 100%)`
            }}
          />
        </div>
      </div>

      {/* MOBILE MINI PLAYER & EXPANDABLE MODAL */}
      <div className="fixed bottom-0 left-0 right-0 bg-darkSurface/95 border-t border-white/5 backdrop-blur-lg px-4 py-2 z-40 md:hidden flex flex-col">
        {/* Progress bar on top of mini-player */}
        <div className="w-full bg-white/10 h-[2px] mb-2 overflow-hidden">
          <div
            className="h-full bg-primaryAccent transition-all duration-300"
            style={{ width: `${(progress / (duration || 30)) * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Cover & Title */}
          <div className="flex items-center gap-3 min-w-0 flex-1" onClick={() => setIsExpanded(true)}>
            <img
              src={currentTrack.album?.cover || 'https://via.placeholder.com/150'}
              alt={currentTrack.title}
              className="w-10 h-10 rounded-md object-cover shadow-premium"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-white truncate">{currentTrack.title}</h4>
              <p className="text-[10px] text-textSecondary truncate">{currentTrack.artist?.name}</p>
            </div>
          </div>

          {/* Mini Play & Like Controls */}
          <div className="flex items-center gap-4 pl-3">
            <button onClick={handleLikeToggle} className="text-textSecondary hover:text-white">
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-primaryAccent text-primaryAccent' : ''}`} />
            </button>
            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-white text-darkBg flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-[0.5px]" />}
            </button>
            <button onClick={() => setIsExpanded(true)} className="text-textSecondary">
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE EXPANDED FULL SCREEN MODAL */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed inset-0 bg-darkBg z-50 px-6 py-8 flex flex-col justify-between md:hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center">
              <button onClick={() => setIsExpanded(false)} className="text-textSecondary hover:text-white p-2">
                <ChevronDown className="w-6 h-6" />
              </button>
              <span className="text-xs uppercase tracking-wider font-semibold text-textSecondary">Now Playing</span>
              <div className="w-10" /> {/* Spacer */}
            </div>

            {/* Album Artwork with Neon Glow */}
            <div className="flex-1 flex flex-col items-center justify-center my-8">
              <motion.div
                className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl relative"
                style={{ boxShadow: '0 20px 50px rgba(0,229,255,0.2)' }}
                animate={{ rotate: isPlaying ? 360 : 0 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              >
                <img
                  src={currentTrack.album?.cover || 'https://via.placeholder.com/300'}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
              </motion.div>

              {/* Title & Artist */}
              <div className="text-center mt-8 w-full max-w-[280px]">
                <h2 className="text-xl font-bold text-white truncate">{currentTrack.title}</h2>
                <p className="text-sm text-textSecondary truncate mt-1">{currentTrack.artist?.name}</p>
              </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col gap-6">
              {/* Progress Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="relative w-full">
                  <input
                    type="range"
                    min="0"
                    max={duration || 30}
                    value={progress}
                    onChange={(e) => seekTo(e.target.value)}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primaryAccent outline-none"
                    style={{
                      background: `linear-gradient(to right, #00E5FF 0%, #00E5FF ${(progress / (duration || 30)) * 100}%, rgba(255,255,255,0.1) ${(progress / (duration || 30)) * 100}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-textSecondary">
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration || 30)}</span>
                </div>
              </div>

              {/* Playback Buttons */}
              <div className="flex justify-between items-center px-4">
                <button
                  onClick={toggleShuffle}
                  className={`p-2 transition-colors ${isShuffle ? 'text-secondaryAccent' : 'text-textSecondary'}`}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                <button onClick={playPrev} className="p-2 text-white">
                  <SkipBack className="w-7 h-7 fill-current" />
                </button>
                <motion.button
                  onClick={togglePlay}
                  className="w-16 h-16 rounded-full bg-white text-darkBg flex items-center justify-center shadow-premium"
                  whileTap={{ scale: 0.9 }}
                >
                  {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current translate-x-[1px]" />}
                </motion.button>
                <button onClick={playNext} className="p-2 text-white">
                  <SkipForward className="w-7 h-7 fill-current" />
                </button>
                <button
                  onClick={toggleRepeat}
                  className={`p-2 transition-colors ${isRepeat ? 'text-secondaryAccent' : 'text-textSecondary'}`}
                >
                  <Repeat className="w-5 h-5" />
                </button>
              </div>

              {/* Like / Mute controls */}
              <div className="flex justify-between items-center px-6 mt-2 pb-6">
                <button onClick={handleLikeToggle} className="text-textSecondary hover:text-white">
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-primaryAccent text-primaryAccent' : ''}`} />
                </button>
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="text-textSecondary">
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => changeVolume(e.target.value)}
                    className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primaryAccent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BottomPlayer;
