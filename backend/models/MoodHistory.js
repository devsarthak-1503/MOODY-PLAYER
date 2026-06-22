const mongoose = require('mongoose');

const MoodHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['Happy', 'Sad', 'Angry', 'Calm', 'Excited', 'Relaxed', 'Focused']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('MoodHistory', MoodHistorySchema);
