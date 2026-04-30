const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      default: null,
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true },
        instructions: { type: String, default: '' },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
