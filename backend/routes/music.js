const express = require('express');
const router = express.Router();
const axios = require('axios');

const DEEZER_BASE_URL = 'https://api.deezer.com';

// Fallback high-quality royalty-free mock tracks (for offline testing or ISP block fallbacks)
const MOCK_TRACKS = [
  {
    id: 101,
    title: "Lofi Study Session",
    artist: { id: 901, name: "Chillhop Beats", picture: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150" },
    album: { id: 801, title: "Midnight Focus", cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150" },
    duration: 372,
    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 102,
    title: "Deep Coffee Study",
    artist: { id: 901, name: "Chillhop Beats", picture: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150" },
    album: { id: 801, title: "Midnight Focus", cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=150" },
    duration: 420,
    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 103,
    title: "Ambient Sunset Flow",
    artist: { id: 902, name: "Acoustic Dreams", picture: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150" },
    album: { id: 802, title: "Golden Hour", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150" },
    duration: 310,
    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  },
  {
    id: 104,
    title: "Summer Electro Hype",
    artist: { id: 903, name: "Synthesizer Wave", picture: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150" },
    album: { id: 803, title: "Neon Skyline", cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150" },
    duration: 290,
    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
  },
  {
    id: 105,
    title: "Contemplative Acoustics",
    artist: { id: 902, name: "Acoustic Dreams", picture: "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=150" },
    album: { id: 804, title: "Wood Cabin Session", cover: "https://images.unsplash.com/photo-1446057032654-9d8885db76c6?w=150" },
    duration: 250,
    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
  },
  {
    id: 106,
    title: "Aggressive Heavy Distortion",
    artist: { id: 904, name: "Gravel & Grunge", picture: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150" },
    album: { id: 805, title: "Riot Control", cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=150" },
    duration: 280,
    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3"
  },
  {
    id: 107,
    title: "Acoustic Whispers",
    artist: { id: 902, name: "Acoustic Dreams", picture: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150" },
    album: { id: 802, title: "Golden Hour", cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150" },
    duration: 240,
    preview: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3"
  }
];

// Helper function to map track object to uniform structure
const formatTrack = (track) => ({
  id: track.id,
  title: track.title,
  artist: {
    id: track.artist?.id,
    name: track.artist?.name,
    picture: track.artist?.picture_medium || track.artist?.picture
  },
  album: {
    id: track.album?.id,
    title: track.album?.title,
    cover: track.album?.cover_medium || track.album?.cover
  },
  duration: track.duration,
  preview: track.preview
});

// @route   GET api/music/chart
// @desc    Get top tracks (Deezer charts)
// @access  Public
router.get('/chart', async (req, res) => {
  try {
    const response = await axios.get(`${DEEZER_BASE_URL}/chart`, { timeout: 3500 });
    const tracks = response.data.tracks?.data || [];
    if (tracks.length === 0) {
      throw new Error('No tracks returned from Deezer');
    }
    res.json(tracks.map(formatTrack));
  } catch (err) {
    console.warn('Deezer Chart API Error (Using mock fallback):', err.message);
    res.json(MOCK_TRACKS);
  }
});

// @route   GET api/music/search
// @desc    Search tracks, artists, albums
// @access  Public
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ message: 'Search query parameter (q) is required' });
  }

  try {
    const response = await axios.get(`${DEEZER_BASE_URL}/search?q=${encodeURIComponent(q)}`, { timeout: 3500 });
    const tracks = response.data.data || [];
    if (tracks.length === 0) {
      throw new Error('No tracks returned from Deezer');
    }
    res.json(tracks.map(formatTrack));
  } catch (err) {
    console.warn('Deezer Search API Error (Using query-matched mock fallback):', err.message);
    
    // Simple filter matching based on search string
    const queryLower = q.toLowerCase();
    const matched = MOCK_TRACKS.filter(t => 
      t.title.toLowerCase().includes(queryLower) || 
      t.artist.name.toLowerCase().includes(queryLower) ||
      t.album.title.toLowerCase().includes(queryLower) ||
      (queryLower.includes('lofi') && t.title.toLowerCase().includes('lofi')) ||
      (queryLower.includes('study') && t.title.toLowerCase().includes('study')) ||
      (queryLower.includes('focus') && t.title.toLowerCase().includes('focus')) ||
      (queryLower.includes('acoustic') && t.artist.name.toLowerCase().includes('acoustic')) ||
      (queryLower.includes('electro') && t.title.toLowerCase().includes('electro')) ||
      (queryLower.includes('hype') && t.title.toLowerCase().includes('hype')) ||
      (queryLower.includes('aggressive') && t.title.toLowerCase().includes('aggressive'))
    );

    res.json(matched.length > 0 ? matched : MOCK_TRACKS);
  }
});

// @route   GET api/music/mood/:mood
// @desc    Get recommended tracks for a specific mood
// @access  Public
router.get('/mood/:mood', async (req, res) => {
  const { mood } = req.params;
  const moodQueries = {
    happy: 'happy upbeat pop feel good',
    sad: 'sad melancholic emotional acoustic',
    angry: 'rock metal punk aggressive alternative',
    calm: 'ambient lofi calm chillout peaceful',
    excited: 'dance edm house party hype electro',
    relaxed: 'indie folk acoustic soft chill acoustic',
    focused: 'classical instrumental study focus deep lofi'
  };

  const query = moodQueries[mood.toLowerCase()] || 'pop';

  try {
    const response = await axios.get(`${DEEZER_BASE_URL}/search?q=${encodeURIComponent(query)}&limit=25`, { timeout: 3500 });
    const tracks = response.data.data || [];
    if (tracks.length === 0) {
      throw new Error('No tracks returned from Deezer');
    }
    res.json(tracks.map(formatTrack));
  } catch (err) {
    console.warn('Deezer Mood Recommendations API Error (Using mock fallback):', err.message);
    
    // Sort mock tracks to align with selected mood
    const m = mood.toLowerCase();
    let sortedMock = [...MOCK_TRACKS];
    if (m === 'focused' || m === 'calm') {
      sortedMock = MOCK_TRACKS.filter(t => t.id === 101 || t.id === 102 || t.id === 103);
    } else if (m === 'excited' || m === 'happy') {
      sortedMock = MOCK_TRACKS.filter(t => t.id === 104);
    } else if (m === 'sad' || m === 'relaxed') {
      sortedMock = MOCK_TRACKS.filter(t => t.id === 105 || t.id === 107 || t.id === 103);
    } else if (m === 'angry') {
      sortedMock = MOCK_TRACKS.filter(t => t.id === 106);
    }
    
    res.json(sortedMock);
  }
});

// @route   GET api/music/artist/:id
// @desc    Get artist info and top tracks
// @access  Public
router.get('/artist/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [artistRes, topTracksRes] = await Promise.all([
      axios.get(`${DEEZER_BASE_URL}/artist/${id}`, { timeout: 3500 }),
      axios.get(`${DEEZER_BASE_URL}/artist/${id}/top?limit=10`, { timeout: 3500 })
    ]);

    const artist = {
      id: artistRes.data.id,
      name: artistRes.data.name,
      picture: artistRes.data.picture_xl || artistRes.data.picture_medium,
      nb_fan: artistRes.data.nb_fan
    };

    const tracks = (topTracksRes.data.data || []).map(formatTrack);
    if (tracks.length === 0) {
      throw new Error('No tracks returned from Deezer');
    }

    res.json({ artist, tracks });
  } catch (err) {
    console.warn('Deezer Artist API Error (Using mock fallback):', err.message);
    
    // Filter mocks for artist
    const dummyArtist = {
      id: Number(id),
      name: "Chillhop Beats",
      picture: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300",
      nb_fan: 450000
    };

    res.json({ artist: dummyArtist, tracks: MOCK_TRACKS.filter(t => t.artist.id === 901) });
  }
});

// @route   GET api/music/album/:id
// @desc    Get album details and tracks
// @access  Public
router.get('/album/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axios.get(`${DEEZER_BASE_URL}/album/${id}`, { timeout: 3500 });
    const albumData = response.data;

    const album = {
      id: albumData.id,
      title: albumData.title,
      cover: albumData.cover_xl || albumData.cover_medium,
      artist: {
        id: albumData.artist?.id,
        name: albumData.artist?.name,
        picture: albumData.artist?.picture_medium
      },
      release_date: albumData.release_date
    };

    const tracks = (albumData.tracks?.data || []).map(track => ({
      ...formatTrack(track),
      album: {
        id: album.id,
        title: album.title,
        cover: album.cover
      }
    }));
    if (tracks.length === 0) {
      throw new Error('No tracks returned from Deezer');
    }

    res.json({ album, tracks });
  } catch (err) {
    console.warn('Deezer Album API Error (Using mock fallback):', err.message);
    
    const dummyAlbum = {
      id: Number(id),
      title: "Midnight Focus",
      cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300",
      artist: { id: 901, name: "Chillhop Beats", picture: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=150" },
      release_date: "2024-01-01"
    };

    res.json({ album: dummyAlbum, tracks: MOCK_TRACKS.filter(t => t.album.id === 801) });
  }
});

module.exports = router;
