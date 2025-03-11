const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  createSeekerProfile,
  createProviderProfile,
  updateSeekerProfile,
  updateProviderProfile,
  getProfile,
} = require('../controllers/profileController'); // Path: ./controllers/profileController.js

const router = express.Router();

// Multer setup with custom storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Path where files are saved: ./uploads/ (relative to server.js or wherever this runs)
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with the original name and extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname); // e.g., .pdf, .docx
    cb(null, `${uniqueSuffix}-${file.originalname}`); // e.g., 1741685196166-Nikhil laxman gavval.pdf
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Restrict to PDF and DOC/DOCX files
    const filetypes = /pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC/DOCX files are allowed!'));
    }
  },
});

// Routes
// Get profile (unchanged)
router.get('/get-profile', getProfile);

// Create Seeker Profile with resume upload (unchanged)
router.post('/seeker', upload.single('resume'), (req, res, next) => {
  console.log('Creating seeker profile with file:', req.file); // Debug log
  createSeekerProfile(req, res, next);
});

// Create Provider Profile (unchanged, no resume upload)
router.post('/provider', createProviderProfile);

// --- Change 1: Update Seeker Profile with resume upload ---
router.post('/seeker/update', upload.single('resume'), (req, res, next) => {
  console.log('Updating seeker profile with file:', req.file); // Debug log to verify file upload
  if (!req.file && !req.body.resume) {
    console.log('No new resume provided, retaining existing resume');
  }
  updateSeekerProfile(req, res, next);
});

// Update Provider Profile (unchanged, no resume upload)
router.post('/provider/update', updateProviderProfile);

// --- Change 2: Error handling middleware for multer ---
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: 'Multer error', error: err.message });
  } else if (err) {
    return res.status(400).json({ message: 'File upload error', error: err.message });
  }
  next();
});

module.exports = router;