import React, { createContext, useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = "https://moody-player-1-snw9.onrender.com";

export const AudioPlayerContext = createContext();

export const AudioPlayerProvider = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef(new Audio());
  const prevVolumeRef = useRef(0.5);

  // Synchronize volume
  useEffect(() => {
    if (isMuted) {
      audioRef.current.volume = 0;
    } else {
      audioRef.current.volume = volume;
    }
  }, [volume, isMuted]);

  // Set up event listeners on audio object
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play().catch(err => console.log('Audio replay block:', err));
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [playlist, currentTrackIndex, isRepeat, isShuffle]);

  // Effect to load and play when currentTrack changes
  useEffect(() => {
    const audio = audioRef.current;
    if (currentTrack) {
      // Deezer API tracks sometimes have preview urls. If no preview is available, we mock playing.
      if (currentTrack.preview) {
        audio.src = currentTrack.preview;
        audio.load();

        if (isPlaying) {
          audio.play()
            .catch(err => {
              console.warn('Auto-play blocked by browser. Setting play state to false.', err);
              setIsPlaying(false);
            });
        }

        // Record recently played track
        recordRecentlyPlayed(currentTrack);
      } else {
        console.warn('Track preview URL missing for:', currentTrack.title);
      }
    } else {
      audio.src = '';
    }
  }, [currentTrack]);

  // Effect to toggle play/pause
  useEffect(() => {
    if (currentTrack?.preview) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Record recently played song on server
  const recordRecentlyPlayed = async (track) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post(`${API_URL}/api/library/recently-played`, { song: track }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error logging recently played:', err);
    }
  };

  const playTrack = (track, queue = []) => {
    if (!track) return;

    // Find index in queue
    const index = queue.findIndex(t => t.id === track.id);
    if (index !== -1) {
      setPlaylist(queue);
      setCurrentTrackIndex(index);
    } else {
      // Insert track into current playlist and play it
      const newQueue = [...playlist];
      if (currentTrackIndex !== -1) {
        newQueue.splice(currentTrackIndex + 1, 0, track);
        setPlaylist(newQueue);
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setPlaylist([track]);
        setCurrentTrackIndex(0);
      }
    }

    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying(!isPlaying);
  };

  const playNext = () => {
    if (playlist.length === 0) return;

    let nextIndex = currentTrackIndex + 1;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else if (nextIndex >= playlist.length) {
      nextIndex = 0; // Wrap around
    }

    setCurrentTrackIndex(nextIndex);
    setCurrentTrack(playlist[nextIndex]);
    setIsPlaying(true);
  };

  const playPrev = () => {
    if (playlist.length === 0) return;

    let prevIndex = currentTrackIndex - 1;

    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else if (prevIndex < 0) {
      prevIndex = playlist.length - 1; // Wrap to end
    }

    setCurrentTrackIndex(prevIndex);
    setCurrentTrack(playlist[prevIndex]);
    setIsPlaying(true);
  };

  const changeVolume = (val) => {
    const vol = parseFloat(val);
    setVolume(vol);
    if (vol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolumeRef.current);
      setIsMuted(false);
    } else {
      prevVolumeRef.current = volume;
      setVolume(0);
      setIsMuted(true);
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
  };

  const seekTo = (seconds) => {
    const time = parseFloat(seconds);
    audioRef.current.currentTime = time;
    setProgress(time);
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playlist,
        currentTrackIndex,
        volume,
        isMuted,
        isShuffle,
        isRepeat,
        duration,
        progress,
        playTrack,
        togglePlay,
        playNext,
        playPrev,
        changeVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        seekTo
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};