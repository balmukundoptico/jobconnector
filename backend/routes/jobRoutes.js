// backend/routes/jobRoutes.js
const express = require('express');
const { 
  postJob, 
  searchJobs, 
  sendWhatsAppMessage, 
  getTrendingSkills, 
  sendMassEmail, 
  searchSeekers, 
  uploadExcel,
  deleteSeeker,
  deleteJob,
  saveSearch,
  applyToJob, 
  getApplicants
} = require('../controllers/jobController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.post('/post', postJob);
router.get('/search', searchJobs);
router.post('/whatsapp', sendWhatsAppMessage);
router.get('/trending-skills', getTrendingSkills);
router.post('/mass-email', sendMassEmail);
router.get('/seekers', searchSeekers);
router.post('/upload-excel', upload.single('file'), uploadExcel);
router.post('/delete-seeker', deleteSeeker); // New route
router.post('/delete-job', deleteJob);       // New route
router.post('/save-search', saveSearch); // New route
// backend/routes/jobRoutes.js (partial)
router.post('/apply', applyToJob); // New route
router.get('/applicants/:providerId', getApplicants); // New route

module.exports = router;