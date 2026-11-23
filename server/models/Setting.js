const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      default: 'SSF PUTHUR SECTOR SAHITYOTSAV & REPRESENTATIVE MEET 2026',
      trim: true,
    },
    eventSubtitle: {
      type: String,
      default: 'Sunni Students Federation - Puthur Sector',
      trim: true,
    },
    eventTheme: {
      type: String,
      default: 'Moral Revolution for Social Reformation',
      trim: true,
    },
    eventDate: {
      type: String,
      default: 'Sunday, 15 December 2026',
      trim: true,
    },
    eventTime: {
      type: String,
      default: '09:00 AM - 05:00 PM',
      trim: true,
    },
    venue: {
      type: String,
      default: 'Town Hall, Puthur, Dakshina Kannada',
      trim: true,
    },
    sectorName: {
      type: String,
      default: 'SSF PUTHUR SECTOR',
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    posterUrl: {
      type: String,
      default: '',
    },
    theme: {
      type: String,
      default: 'white-green',
      enum: ['white-green', 'emerald', 'forest', 'teal'],
    },
    adminPin: {
      type: String,
      default: '7860',
    },
    contactPhone: {
      type: String,
      default: '+91 97400 00000',
    },
    contactEmail: {
      type: String,
      default: 'ssfputhursector@gmail.com',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
