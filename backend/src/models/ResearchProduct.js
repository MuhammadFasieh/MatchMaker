const mongoose = require('mongoose');

const ResearchProductSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['peer-reviewed', 'non-peer-reviewed', 'poster', 'oral'],
    required: true
  },
  status: {
    type: String,
    enum: ['published', 'submitted', 'accepted'],
    required: true
  },
  authors: {
    type: String,
    required: true
  },
  journal: {
    type: String,
    default: null
  },
  volume: {
    type: String,
    default: null
  },
  issueNumber: {
    type: String,
    default: null
  },
  pages: {
    type: String,
    default: null
  },
  pmid: {
    type: String,
    default: null
  },
  monthPublished: {
    type: String,
    default: null
  },
  yearPublished: {
    type: String,
    default: null
  },
  pubmedEnriched: {
    type: Boolean,
    default: false
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-update hook
ResearchProductSchema.pre('findOneAndUpdate', function(next) {
  // Update the updatedAt field
  this.set({ updatedAt: Date.now() });
  next();
});

const ResearchProduct = mongoose.model('ResearchProduct', ResearchProductSchema);

module.exports = ResearchProduct; 