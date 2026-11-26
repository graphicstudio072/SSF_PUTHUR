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
    headingColor: {
      type: String,
      default: '#111827',
      trim: true,
    },
    ticketTemplateUrl: {
      type: String,
      default: '',
    },
    ticketTemplateConfig: {
      qr: {
        x: { type: Number, default: 74 },
        y: { type: Number, default: 58 },
        size: { type: Number, default: 22 }, // width % of template
      },
      name: {
        x: { type: Number, default: 8 },
        y: { type: Number, default: 42 },
        fontSize: { type: Number, default: 28 },
        color: { type: String, default: '#111827' },
        align: { type: String, default: 'left', enum: ['left', 'center', 'right'] },
        fontWeight: { type: String, default: '700' },
      },
      ticketId: {
        x: { type: Number, default: 8 },
        y: { type: Number, default: 54 },
        fontSize: { type: Number, default: 20 },
        color: { type: String, default: '#0F5132' },
        align: { type: String, default: 'left', enum: ['left', 'center', 'right'] },
        fontWeight: { type: String, default: '700' },
      },
      unit: {
        x: { type: Number, default: 8 },
        y: { type: Number, default: 65 },
        fontSize: { type: Number, default: 20 },
        color: { type: String, default: '#374151' },
        align: { type: String, default: 'left', enum: ['left', 'center', 'right'] },
        fontWeight: { type: String, default: '600' },
      },
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
