// backend/routes/jobRoutes.js
const express = require('express');
const { 
  postJob, 
  searchJobs, 
  sendWhatsAppMessage, 
  getTrendingSkills, 
  sendMassEmail, 
  searchSeekers, 
  uploadExcel 
} = require('../controllers/jobController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/post', postJob);
router.get('/search', searchJobs);
router.post('/whatsapp', sendWhatsAppMessage);
router.get('/trending-skills', getTrendingSkills);
router.post('/mass-email', sendMassEmail);
router.get('/seekers', searchSeekers); // Fixed by importing searchSeekers
router.post('/upload-excel', upload.single('file'), uploadExcel);

module.exports = router;