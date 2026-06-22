const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../utils/db');

// ==========================================
// FAVORITES ROUTES
// ==========================================

// @route   GET api/library/favorites
// @desc    Get user's favorite tracks
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const songs = await db.getFavorites(req.user.id);
    res.json(songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/library/favorites/add
// @desc    Add track to favorites
// @access  Private
router.post('/favorites/add', auth, async (req, res) => {
  const { song } = req.body;
  if (!song || !song.id) {
    return res.status(400).json({ message: 'Song metadata is required' });
  }

  try {
    const songs = await db.addFavorite(req.user.id, song);
    res.json(songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/library/favorites/remove
// @desc    Remove track from favorites
// @access  Private
router.post('/favorites/remove', auth, async (req, res) => {
  const { songId } = req.body;
  if (!songId) {
    return res.status(400).json({ message: 'Song ID is required' });
  }

  try {
    const songs = await db.removeFavorite(req.user.id, songId);
    res.json(songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// ==========================================
// PLAYLISTS ROUTES
// ==========================================

// @route   GET api/library/playlists
// @desc    Get user's playlists
// @access  Private
router.get('/playlists', auth, async (req, res) => {
  try {
    const playlists = await db.findPlaylistsByUser(req.user.id);
    res.json(playlists);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/library/playlists
// @desc    Create a playlist
// @access  Private
router.post('/playlists', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Playlist name is required' });
  }

  try {
    const playlist = await db.createPlaylist({ name, user: req.user.id });
    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/library/playlists/:id
// @desc    Rename playlist
// @access  Private
router.put('/playlists/:id', auth, async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Playlist name is required' });
  }

  try {
    const playlist = await db.renamePlaylist(req.params.id, name, req.user.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/library/playlists/:id
// @desc    Delete playlist
// @access  Private
router.delete('/playlists/:id', auth, async (req, res) => {
  try {
    const playlist = await db.deletePlaylist(req.params.id, req.user.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json({ message: 'Playlist deleted successfully', id: req.params.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/library/playlists/:id/add
// @desc    Add track to playlist
// @access  Private
router.post('/playlists/:id/add', auth, async (req, res) => {
  const { song } = req.body;
  if (!song || !song.id) {
    return res.status(400).json({ message: 'Song metadata is required' });
  }

  try {
    const playlist = await db.addSongToPlaylist(req.params.id, song, req.user.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (err) {
    if (err.message === 'Song already in playlist') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/library/playlists/:id/remove
// @desc    Remove track from playlist
// @access  Private
router.post('/playlists/:id/remove', auth, async (req, res) => {
  const { songId } = req.body;
  if (!songId) {
    return res.status(400).json({ message: 'Song ID is required' });
  }

  try {
    const playlist = await db.removeSongFromPlaylist(req.params.id, songId, req.user.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// ==========================================
// MOOD HISTORY ROUTES
// ==========================================

// @route   GET api/library/mood-history
// @desc    Get user's mood history logs
// @access  Private
router.get('/mood-history', auth, async (req, res) => {
  try {
    const history = await db.getMoodHistory(req.user.id);
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/library/mood-history
// @desc    Log a new detected mood
// @access  Private
router.post('/mood-history', auth, async (req, res) => {
  const { mood, confidence } = req.body;
  if (!mood || confidence === undefined) {
    return res.status(400).json({ message: 'Mood and confidence score are required' });
  }

  try {
    const history = await db.createMoodLog({
      user: req.user.id,
      mood,
      confidence
    });
    res.json(history);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});


// ==========================================
// RECENTLY PLAYED ROUTES
// ==========================================

// @route   GET api/library/recently-played
// @desc    Get user's recently played tracks
// @access  Private
router.get('/recently-played', auth, async (req, res) => {
  try {
    const tracks = await db.getRecentlyPlayed(req.user.id);
    res.json(tracks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/library/recently-played
// @desc    Record a track play (recently played)
// @access  Private
router.post('/recently-played', auth, async (req, res) => {
  const { song } = req.body;
  if (!song || !song.id) {
    return res.status(400).json({ message: 'Song metadata is required' });
  }

  try {
    await db.createRecentlyPlayedLog(req.user.id, song);
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
