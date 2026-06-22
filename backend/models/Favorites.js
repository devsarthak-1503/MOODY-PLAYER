const mongoose = require('mongoose');

const FavoritesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
    preview: { type: String }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Favorites', FavoritesSchema);
