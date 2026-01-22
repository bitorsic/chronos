const mongoose = require('mongoose');

const stockMetadataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  exchange: {
    type: String,
    trim: true
  },
  assetType: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster lookups
stockMetadataSchema.index({ symbol: 1 });

const stockMetadataModel = mongoose.model('stockmetadata', stockMetadataSchema);

module.exports = stockMetadataModel;
