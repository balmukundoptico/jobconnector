// backend/routes/profileRoutes.js
const express = require('express');
const { createSeekerProfile, createProviderProfile, getProfile } = require('../controllers/profileController');

const router = express.Router();

router.post('/seeker', createSeekerProfile);
router.post('/provider', createProviderProfile);
router.get('/get', getProfile);

module.exports = router;