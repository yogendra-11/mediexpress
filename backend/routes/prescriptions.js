const express = require('express');
const multer = require('multer');
const path = require('path');
const Prescription = require('../models/Prescription');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Multer config for prescription file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and PDF files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/prescriptions - Doctor creates a prescription
router.post('/', protect, authorize('doctor'), async (req, res) => {
  try {
    const { userId, consultationId, medicines, notes } = req.body;

    const prescription = await Prescription.create({
      userId,
      doctorId: req.user._id,
      consultationId: consultationId || null,
      medicines,
      notes,
      status: 'submitted',
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('userId', 'name email')
      .populate('doctorId', 'name email specialization');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/prescriptions/upload - User uploads prescription file
router.post(
  '/upload',
  protect,
  authorize('user'),
  upload.single('prescription'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
      }

      const prescription = await Prescription.create({
        userId: req.user._id,
        fileUrl: `/uploads/${req.file.filename}`,
        status: 'submitted',
        medicines: [],
      });

      res.status(201).json(prescription);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET /api/prescriptions - List prescriptions (role-filtered)
router.get('/', protect, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'user') {
      filter = { userId: req.user._id };
    } else if (req.user.role === 'doctor') {
      filter = { doctorId: req.user._id };
    }
    // pharmacy sees all submitted prescriptions
    if (req.user.role === 'pharmacy') {
      filter = { status: { $in: ['submitted', 'accepted', 'rejected'] } };
    }

    const prescriptions = await Prescription.find(filter)
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name email specialization')
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/prescriptions/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('doctorId', 'name email specialization');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /api/prescriptions/:id/status - Update prescription status (pharmacy)
router.patch('/:id/status', protect, authorize('pharmacy'), async (req, res) => {
  try {
    const { status } = req.body;
    const prescription = await Prescription.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('userId', 'name email')
      .populate('doctorId', 'name email specialization');

    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
