const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Path where files will be saved: ./uploads/
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExt = path.extname(file.originalname); // Extract extension (e.g., .pdf, .docx)
    cb(null, `${uniqueSuffix}${fileExt}`); // e.g., 1634567890123-456789123.pdf
  },
});
const upload = multer({ storage: storage });

// const upload = multer({ dest: 'uploads/' });

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files statically

// MongoDB connection using local instance
// mongoose.connect('mongodb://localhost:27017/jobconnector', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected locally'))
//   .catch((err) => console.log('MongoDB connection error:', err));

// Comment out MongoDB Atlas connection for later use
mongoose.connect('mongodb+srv://balmukundoptico:lets12help@job-connector.exb7v.mongodb.net', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.log('MongoDB Atlas connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Job Connector Backend is running');
});

app.set('upload', upload);

// Import and mount routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const jobRoutes = require('./routes/jobRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

