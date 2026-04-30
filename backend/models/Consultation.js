const mongoose = require('mongoose');
const crypto = require('crypto');

const consultationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    jitsiRoomId: {
      type: String,
      default: () => `mediexpress-${crypto.randomBytes(6).toString('hex')}`,
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed'],
      default: 'scheduled',
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Consultation', consultationSchema);
