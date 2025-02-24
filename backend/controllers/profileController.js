// backend/controllers/profileController.js
const JobSeeker = require('../models/JobSeeker');
const JobProvider = require('../models/JobProvider');

// Create or update Job Seeker profile
exports.createSeekerProfile = async (req, res) => {
  const {
    fullName, whatsappNumber, email, skillType, skills, experience, location,
    currentCTC, expectedCTC, noticePeriod, lastWorkingDate, resume, bio
  } = req.body;

  try {
    let seeker = await JobSeeker.findOne({ $or: [{ whatsappNumber }, { email }] });
    if (seeker) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    seeker = new JobSeeker({
      fullName, whatsappNumber, email, skillType, skills: skills.split(','), // Convert skills to array
      experience: Number(experience), location, currentCTC: Number(currentCTC),
      expectedCTC: Number(expectedCTC), noticePeriod, lastWorkingDate, resume, bio
    });

    await seeker.save();
    res.json({ message: 'Profile created successfully', seeker });
  } catch (error) {
    console.error('Error creating seeker profile:', error);
    res.status(500).json({ message: 'Error creating profile' });
  }
};

// Create or update Job Provider profile
exports.createProviderProfile = async (req, res) => {
  const { companyName, hrName, hrWhatsappNumber, email } = req.body;

  try {
    let provider = await JobProvider.findOne({ $or: [{ hrWhatsappNumber }, { email }] });
    if (provider) {
      return res.status(400).json({ message: 'Provider already exists. Please login.' });
    }

    provider = new JobProvider({ companyName, hrName, hrWhatsappNumber, email });
    await provider.save();
    res.json({ message: 'Profile created successfully', provider });
  } catch (error) {
    console.error('Error creating provider profile:', error);
    res.status(500).json({ message: 'Error creating profile' });
  }
};

// Get user profile (for dashboards)
exports.getProfile = async (req, res) => {
  const { role, whatsappNumber, email } = req.query;

  try {
    let user;
    if (role === 'seeker') {
      user = await JobSeeker.findOne({ $or: [{ whatsappNumber }, { email }] });
    } else if (role === 'provider') {
      user = await JobProvider.findOne({ $or: [{ hrWhatsappNumber: whatsappNumber }, { email }] });
    } else if (role === 'admin') {
      user = await JobProvider.findOne({ $or: [{ hrWhatsappNumber: whatsappNumber }, { email }] });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};