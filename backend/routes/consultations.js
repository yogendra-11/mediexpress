const express = require('express');
const Consultation = require('../models/Consultation');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /api/consultations - Book a consultation (user)
router.post('/', protect, authorize('user'), async (req, res) => {
  try {
    const { doctorId, scheduledAt } = req.body;

    const consultation = await Consultation.create({
      userId: req.user._id,
      doctorId,
      scheduledAt,
    });

    const populated = await Consultation.findById(consultation._id)
      .populate('userId', 'name email')
      .populate('doctorId', 'name email specialization');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/consultations - List consultations (role-filtered)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'user') {
      filter = { userId: req.user._id };
    } else if (req.user.role === 'doctor') {
      filter = { doctorId: req.user._id };
    }

    const consultations = await Consultation.find(filter)
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name email specialization')
      .sort({ scheduledAt: -1 });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/consultations/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name email specialization');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/consultations/:id/status - Update consultation status
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('doctorId', 'name email specialization');

    if (!consultation) {
      return res.status(404).json({ message: 'Consultation not found' });
    }

    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
