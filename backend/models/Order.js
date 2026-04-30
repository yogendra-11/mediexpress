const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'delivered',
        'cancelled',
      ],
      default: 'pending',
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    directMedicines: [
      {
        name: { type: String },
        qty: { type: Number },
        price: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
