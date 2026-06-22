const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Playlist = require('../models/Playlist');
const Favorites = require('../models/Favorites');
const MoodHistory = require('../models/MoodHistory');
const RecentlyPlayed = require('../models/RecentlyPlayed');

const FALLBACK_FILE = path.join(__dirname, '..', 'db_fallback.json');
let isMongoConnected = false;

// Initialize Fallback JSON database if not exists
const initFallbackDb = () => {
  if (!fs.existsSync(FALLBACK_FILE)) {
    const initialData = {
      users: [],
      playlists: [],
      favorites: [],
      moodHistory: [],
      recentlyPlayed: []
    };
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(initialData, null, 2));
  }
};

initFallbackDb();

// Helper to read fallback database
const readFallback = () => {
  try {
    initFallbackDb();
    const data = fs.readFileSync(FALLBACK_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading fallback DB:', err);
    return { users: [], playlists: [], favorites: [], moodHistory: [], recentlyPlayed: [] };
  }
};

// Helper to write fallback database
const writeFallback = (data) => {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing fallback DB:', err);
  }
};

// Database Connect
const connectDB = (uri) => {
  console.log('Connecting to MongoDB at:', uri);
  mongoose.connect(uri)
    .then(() => {
      console.log('Successfully connected to MongoDB.');
      isMongoConnected = true;
    })
    .catch(err => {
      console.error('Error connecting to MongoDB:', err.message);
      console.warn('MongoDB connection failed. Switching to Local JSON Database Fallback.');
      isMongoConnected = false;
    });
};

// DB API Wrapper
const db = {
  connect: connectDB,
  isConnected: () => isMongoConnected,

  // ==========================================
  // USER OPERATIONS
  // ==========================================
  findUserByEmail: async (email) => {
    if (isMongoConnected) {
      return await User.findOne({ email: email.toLowerCase() });
    } else {
      const data = readFallback();
      const user = data.users.find(u => u.email === email.toLowerCase());
      if (user) {
        return {
          id: user.id,
          _id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          avatar: user.avatar
        };
      }
      return null;
    }
  },

  findUserById: async (id) => {
    if (isMongoConnected) {
      return await User.findById(id).select('-password');
    } else {
      const data = readFallback();
      const user = data.users.find(u => u.id === id);
      if (user) {
        return {
          id: user.id,
          _id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        };
      }
      return null;
    }
  },

  createUser: async ({ name, email, password, avatar }) => {
    if (isMongoConnected) {
      const user = new User({ name, email, password, avatar });
      await user.save();
      return user;
    } else {
      const data = readFallback();
      const newId = new mongoose.Types.ObjectId().toString();
      const newUser = {
        id: newId,
        _id: newId,
        name,
        email: email.toLowerCase(),
        password,
        avatar,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      data.users.push(newUser);
      writeFallback(data);
      return newUser;
    }
  },

  updateUser: async (id, { name, avatar }) => {
    if (isMongoConnected) {
      const user = await User.findById(id);
      if (!user) return null;
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;
      await user.save();
      return user;
    } else {
      const data = readFallback();
      const index = data.users.findIndex(u => u.id === id);
      if (index === -1) return null;
      if (name) data.users[index].name = name;
      if (avatar) data.users[index].avatar = avatar;
      data.users[index].updatedAt = new Date();
      writeFallback(data);
      return data.users[index];
    }
  },

  // ==========================================
  // PLAYLIST OPERATIONS
  // ==========================================
  findPlaylistsByUser: async (userId) => {
    if (isMongoConnected) {
      return await Playlist.find({ user: userId }).sort({ updatedAt: -1 });
    } else {
      const data = readFallback();
      return data.playlists
        .filter(p => p.user === userId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }
  },

  createPlaylist: async ({ name, user }) => {
    if (isMongoConnected) {
      const playlist = new Playlist({ name, songs: [], user });
      return await playlist.save();
    } else {
      const data = readFallback();
      const newId = new mongoose.Types.ObjectId().toString();
      const newPlaylist = {
        _id: newId,
        name,
        songs: [],
        user,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      data.playlists.push(newPlaylist);
      writeFallback(data);
      return newPlaylist;
    }
  },

  renamePlaylist: async (id, name, userId) => {
    if (isMongoConnected) {
      return await Playlist.findOneAndUpdate(
        { _id: id, user: userId },
        { name },
        { new: true }
      );
    } else {
      const data = readFallback();
      const index = data.playlists.findIndex(p => p._id === id && p.user === userId);
      if (index === -1) return null;
      data.playlists[index].name = name;
      data.playlists[index].updatedAt = new Date();
      writeFallback(data);
      return data.playlists[index];
    }
  },

  deletePlaylist: async (id, userId) => {
    if (isMongoConnected) {
      return await Playlist.findOneAndDelete({ _id: id, user: userId });
    } else {
      const data = readFallback();
      const index = data.playlists.findIndex(p => p._id === id && p.user === userId);
      if (index === -1) return null;
      const deleted = data.playlists.splice(index, 1)[0];
      writeFallback(data);
      return deleted;
    }
  },

  addSongToPlaylist: async (playlistId, song, userId) => {
    if (isMongoConnected) {
      const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
      if (!playlist) return null;
      
      const exists = playlist.songs.some(s => s.id === song.id);
      if (exists) throw new Error('Song already in playlist');
      
      playlist.songs.push(song);
      return await playlist.save();
    } else {
      const data = readFallback();
      const index = data.playlists.findIndex(p => p._id === playlistId && p.user === userId);
      if (index === -1) return null;
      
      const exists = data.playlists[index].songs.some(s => s.id === song.id);
      if (exists) throw new Error('Song already in playlist');
      
      data.playlists[index].songs.push(song);
      data.playlists[index].updatedAt = new Date();
      writeFallback(data);
      return data.playlists[index];
    }
  },

  removeSongFromPlaylist: async (playlistId, songId, userId) => {
    if (isMongoConnected) {
      const playlist = await Playlist.findOne({ _id: playlistId, user: userId });
      if (!playlist) return null;
      playlist.songs = playlist.songs.filter(s => s.id !== Number(songId));
      return await playlist.save();
    } else {
      const data = readFallback();
      const index = data.playlists.findIndex(p => p._id === playlistId && p.user === userId);
      if (index === -1) return null;
      
      data.playlists[index].songs = data.playlists[index].songs.filter(s => s.id !== Number(songId));
      data.playlists[index].updatedAt = new Date();
      writeFallback(data);
      return data.playlists[index];
    }
  },

  // ==========================================
  // FAVORITES OPERATIONS
  // ==========================================
  getFavorites: async (userId) => {
    if (isMongoConnected) {
      let favorites = await Favorites.findOne({ user: userId });
      if (!favorites) {
        favorites = new Favorites({ user: userId, songs: [] });
        await favorites.save();
      }
      return favorites.songs;
    } else {
      const data = readFallback();
      let fav = data.favorites.find(f => f.user === userId);
      if (!fav) {
        fav = { user: userId, songs: [] };
        data.favorites.push(fav);
        writeFallback(data);
      }
      return fav.songs;
    }
  },

  addFavorite: async (userId, song) => {
    if (isMongoConnected) {
      let favorites = await Favorites.findOne({ user: userId });
      if (!favorites) {
        favorites = new Favorites({ user: userId, songs: [] });
      }
      const exists = favorites.songs.some(s => s.id === song.id);
      if (!exists) {
        favorites.songs.unshift(song);
        await favorites.save();
      }
      return favorites.songs;
    } else {
      const data = readFallback();
      let index = data.favorites.findIndex(f => f.user === userId);
      if (index === -1) {
        data.favorites.push({ user: userId, songs: [song] });
      } else {
        const exists = data.favorites[index].songs.some(s => s.id === song.id);
        if (!exists) {
          data.favorites[index].songs.unshift(song);
        }
      }
      writeFallback(data);
      const fav = data.favorites.find(f => f.user === userId);
      return fav.songs;
    }
  },

  removeFavorite: async (userId, songId) => {
    if (isMongoConnected) {
      let favorites = await Favorites.findOne({ user: userId });
      if (favorites) {
        favorites.songs = favorites.songs.filter(s => s.id !== Number(songId));
        await favorites.save();
      }
      return favorites ? favorites.songs : [];
    } else {
      const data = readFallback();
      const index = data.favorites.findIndex(f => f.user === userId);
      if (index !== -1) {
        data.favorites[index].songs = data.favorites[index].songs.filter(s => s.id !== Number(songId));
        writeFallback(data);
        return data.favorites[index].songs;
      }
      return [];
    }
  },

  // ==========================================
  // MOOD HISTORY OPERATIONS
  // ==========================================
  getMoodHistory: async (userId) => {
    if (isMongoConnected) {
      return await MoodHistory.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    } else {
      const data = readFallback();
      return data.moodHistory
        .filter(m => m.user === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50);
    }
  },

  createMoodLog: async ({ user, mood, confidence }) => {
    if (isMongoConnected) {
      const newHistory = new MoodHistory({ user, mood, confidence });
      return await newHistory.save();
    } else {
      const data = readFallback();
      const newId = new mongoose.Types.ObjectId().toString();
      const newLog = {
        _id: newId,
        user,
        mood,
        confidence,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      data.moodHistory.push(newLog);
      writeFallback(data);
      return newLog;
    }
  },

  // ==========================================
  // RECENTLY PLAYED OPERATIONS
  // ==========================================
  getRecentlyPlayed: async (userId) => {
    if (isMongoConnected) {
      const recentlyPlayed = await RecentlyPlayed.find({ user: userId })
        .sort({ updatedAt: -1 })
        .limit(20);
      return recentlyPlayed.map(item => item.song);
    } else {
      const data = readFallback();
      return data.recentlyPlayed
        .filter(r => r.user === userId)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 20)
        .map(item => item.song);
    }
  },

  createRecentlyPlayedLog: async (userId, song) => {
    if (isMongoConnected) {
      let existingItem = await RecentlyPlayed.findOne({ user: userId, 'song.id': song.id });
      if (existingItem) {
        existingItem.changed = new Date();
        await existingItem.save();
        return;
      }
      const newItem = new RecentlyPlayed({ user: userId, song });
      await newItem.save();

      const count = await RecentlyPlayed.countDocuments({ user: userId });
      if (count > 30) {
        const oldestItems = await RecentlyPlayed.find({ user: userId })
          .sort({ updatedAt: 1 })
          .limit(count - 30);
        const idsToDelete = oldestItems.map(item => item._id);
        await RecentlyPlayed.deleteMany({ _id: { $in: idsToDelete } });
      }
    } else {
      const data = readFallback();
      const existingIndex = data.recentlyPlayed.findIndex(r => r.user === userId && r.song.id === song.id);
      
      if (existingIndex !== -1) {
        data.recentlyPlayed[existingIndex].updatedAt = new Date();
      } else {
        const newId = new mongoose.Types.ObjectId().toString();
        const newItem = {
          _id: newId,
          user: userId,
          song,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        data.recentlyPlayed.push(newItem);
      }

      // Enforce 30 items size limit
      let userLogs = data.recentlyPlayed.filter(r => r.user === userId);
      if (userLogs.length > 30) {
        userLogs.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        const itemsToRemove = userLogs.slice(0, userLogs.length - 30).map(item => item._id);
        data.recentlyPlayed = data.recentlyPlayed.filter(r => !itemsToRemove.includes(r._id));
      }
      
      writeFallback(data);
    }
  }
};

module.exports = db;
