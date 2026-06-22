const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  songs: [{
    id: { type: Number, required: true },
    title: { type: String, required: true },
    artist: {
      id: { type: Number },
      name: { type: String, required: true },
      picture: { type: String }
    },
    album: {
      id: { type: Number },
      title: { type: String },
      cover: { type: String }
    },
    duration: { type: Number },
    preview: { type: String } // Audio preview URL
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);
