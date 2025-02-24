// backend/controllers/authController.js
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const JobSeeker = require('../models/JobSeeker');
const JobProvider = require('../models/JobProvider');
const Admin = require('../models/Admin');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendWhatsAppOTP = async (whatsappNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your Job Connector OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `whatsapp:${whatsappNumber}`,
    });
  } catch (error) {
    console.error('Twilio Error:', error.message);
    throw new Error('Failed to send WhatsApp OTP');
  }
};

const sendEmailOTP = async (email, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Job Connector OTP',
      text: `Your OTP is: ${otp}`,
    });
  } catch (error) {
    console.error('Nodemailer Error:', error.message);
    throw new Error('Failed to send Email OTP');
  }
};

exports.requestOTP = async (req, res) => {
  const { whatsappNumber, email, role } = req.body;
  const otp = generateOTP();

  try {
    if (!whatsappNumber && !email) {
      return res.status(400).json({ message: 'WhatsApp number or email is required' });
    }

    if (whatsappNumber) {
      await sendWhatsAppOTP(whatsappNumber, otp);
      return res.json({ message: 'OTP sent on WhatsApp', otp }); // For testing
    } else if (email) {
      await sendEmailOTP(email, otp);
      return res.json({ message: 'OTP sent on email', otp }); // For testing
    }
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ message: error.message || 'Error sending OTP' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { whatsappNumber, email, otp, role, bypass } = req.body;

  try {
    let user;
    let isNewUser = false;

    if (role === 'seeker') {
      user = await JobSeeker.findOne({ $or: [{ whatsappNumber }, { email }] });
      if (!user) {
        isNewUser = true;
        console.log('New seeker detected:', { whatsappNumber, email });
      } else {
        console.log('Existing seeker found:', user);
      }
    } else if (role === 'provider') {
      user = await JobProvider.findOne({ $or: [{ hrWhatsappNumber: whatsappNumber }, { email }] });
      if (!user) {
        isNewUser = true;
        console.log('New provider detected:', { whatsappNumber, email });
      } else {
        console.log('Existing provider found:', user);
      }
    } else if (role === 'admin') {
      user = await Admin.findOne({ $or: [{ whatsappNumber }, { email }] });
      if (!user) {
        isNewUser = true;
        console.log('New admin detected:', { whatsappNumber, email });
      } else {
        console.log('Existing admin found:', user);
      }
    }

    if (!user && !bypass) {
      console.log('No user found for OTP login:', { whatsappNumber, email, role });
      return res.status(400).json({ message: 'User not found' });
    }

    if (bypass) {
      console.log('Bypass response:', { message: 'Bypass successful', user, isNewUser });
      return res.json({
        message: 'Bypass successful',
        user, // null for new users, object for existing
        isNewUser, // true for new, false for existing
      });
    }

    console.log('OTP login successful for:', user);
    res.json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Error verifying OTP:', error.message || error);
    res.status(500).json({ message: 'Error verifying OTP' });
  }
};