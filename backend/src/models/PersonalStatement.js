const mongoose = require('mongoose');

const PersonalStatementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialties: {
    type: [String],
    required: true
  },
  motivation: {
    type: String,
    required: true
  },
  characteristics: {
    type: [String],
    required: true,
    validate: {
      validator: function(val) {
        return val.length <= 3;
      },
      message: 'You can select a maximum of 3 characteristics'
    }
  },
  characteristicStories: [
    {
      characteristic: {
        type: String,
        required: true
      },
      story: {
        type: String,
        required: true
      }
    }
  ],
  thesisStatements: {
    type: [String],
    default: []
  },
  selectedThesisStatement: {
    type: String,
    default: null
  },
  finalStatement: {
    type: String,
    default: null
  },
  wordCount: {
    type: Number,
    default: 0
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
PersonalStatementSchema.pre('findOneAndUpdate', function(next) {
  // Update the updatedAt field
  this.set({ updatedAt: Date.now() });
  next();
});

const PersonalStatement = mongoose.model('PersonalStatement', PersonalStatementSchema);

module.exports = PersonalStatement; 