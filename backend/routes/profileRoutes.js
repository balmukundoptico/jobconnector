// backend/routes/profileRoutes.js (partial)
const express = require('express');
const { createSeekerProfile, createProviderProfile, getProfile, updateSeekerProfile, updateProviderProfile } = require('../controllers/profileController');

const router = express.Router();

router.post('/seeker', createSeekerProfile);
router.post('/provider', createProviderProfile);
router.get('/get', getProfile);
router.post('/update-seeker', updateSeekerProfile);   // New route
router.post('/update-provider', updateProviderProfile); // New route

module.exports = router;