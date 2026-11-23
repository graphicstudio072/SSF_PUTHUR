const mongoose = require('mongoose');

const ROLES = [
  'President',
  'General Secretary',
  'Executive Secretary',
  'QD',
  'GD',
  "Let's Smile",
  'Wefi',
  'Smart Core',
  'Public Relation',
  'Secretariat Member',
];

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Candidate full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    unit: {
      type: String,
      required: [true, 'Unit selection is required'],
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Role selection is required'],
      trim: true,
      enum: {
        values: ROLES,
        message: 'Please select a valid role',
      },
      index: true,
    },
    ticketId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    attended: {
      type: Boolean,
      default: false,
      index: true,
    },
    checkInTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Candidate', candidateSchema);
module.exports.ROLES = ROLES;
