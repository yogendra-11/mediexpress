const express = require('express');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/orders - Create order from prescription OR direct medicine purchase
router.post('/', protect, async (req, res) => {
  try {
    const { prescriptionId, deliveryAddress, totalAmount, directMedicines } = req.body;

    let userId = req.user._id;

    // If prescription-based order
    if (prescriptionId) {
      const prescription = await Prescription.findById(prescriptionId);
      if (!prescription) {
        return res.status(404).json({ message: 'Prescription not found' });
      }
      userId = prescription.userId;
    }

    const order = await Order.create({
      prescriptionId: prescriptionId || null,
      userId,
      pharmacyId: req.user.role === 'pharmacy' ? req.user._id : null,
      deliveryAddress: deliveryAddress || '',
      totalAmount: totalAmount || 0,
      directMedicines: directMedicines || [],
      status: 'pending',
    });

    const populated = await Order.findById(order._id)
      .populate('prescriptionId')
      .populate('userId', 'name email phone')
      .populate('pharmacyId', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders - List orders (role-filtered)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'user') {
      filter = { userId: req.user._id };
    } else if (req.user.role === 'pharmacy') {
      // Pharmacy sees orders assigned to them or unassigned
      filter = {
        $or: [{ pharmacyId: req.user._id }, { pharmacyId: null }],
      };
    } else if (req.user.role === 'delivery') {
      filter = { deliveryPartnerId: req.user._id };
    }

    const orders = await Order.find(filter)
      .populate({
        path: 'prescriptionId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'doctorId', select: 'name email specialization' },
        ],
      })
      .populate('userId', 'name email phone')
      .populate('pharmacyId', 'name email')
      .populate('deliveryPartnerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'prescriptionId',
        populate: [
          { path: 'userId', select: 'name email phone' },
          { path: 'doctorId', select: 'name email specialization' },
        ],
      })
      .populate('userId', 'name email phone')
      .populate('pharmacyId', 'name email')
      .populate('deliveryPartnerId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };

    // Auto-assign pharmacy when confirming
    if (status === 'confirmed' && req.user.role === 'pharmacy') {
      update.pharmacyId = req.user._id;
    }

    // Auto-assign delivery partner when order is ready
    if (status === 'ready') {
      const User = require('../models/User');
      const deliveryPartner = await User.findOne({ role: 'delivery' });
      if (deliveryPartner) {
        update.deliveryPartnerId = deliveryPartner._id;
      }
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    )
      .populate('prescriptionId')
      .populate('userId', 'name email')
      .populate('pharmacyId', 'name email')
      .populate('deliveryPartnerId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/orders/:id/assign - Assign delivery partner or pharmacy
router.patch('/:id/assign', protect, async (req, res) => {
  try {
    const { deliveryPartnerId, pharmacyId } = req.body;
    const update = {};
    if (deliveryPartnerId) update.deliveryPartnerId = deliveryPartnerId;
    if (pharmacyId) update.pharmacyId = pharmacyId;

    const order = await Order.findByIdAndUpdate(req.params.id, update, {
      new: true,
    })
      .populate('prescriptionId')
      .populate('userId', 'name email')
      .populate('pharmacyId', 'name email')
      .populate('deliveryPartnerId', 'name email phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
