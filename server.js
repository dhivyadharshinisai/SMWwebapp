const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// CORS options
const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend URL
  methods: ['GET', 'POST'],
};

app.use(cors(corsOptions));

// MongoDB Connection
mongoose.connect(
  'mongodb+srv://karthikroshan3456:VDdkjED7YcVPcPda@cluster0.u3lsm.mongodb.net/',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'SmartMindWatch',
  }
)
  .then(async () => {
    console.log('MongoDB connected');
    const users = await User.find();
    console.log('All Users:', users);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// User schema + model
const userSchema = new mongoose.Schema({
  email: String,
  password: String, // Hashed password
});

const User = mongoose.model('User', userSchema);

// SearchHistory schema + model
const searchHistorySchema = new mongoose.Schema({
  userId: String,
  query: String,
  totalTimeSpent: String,
  dateAndTime: String,
  websites: [{
    url: String,
    time: String,
  }],
  isHarmful: Boolean,
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

// Routes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET, // Make sure to define this in your .env file
      { expiresIn: '1d' }
    );

    res.json({
      token,
      email: user.email,
      userId: user._id,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all search histories
app.get('/api/searchhistories', async (req, res) => {
  try {
    const histories = await SearchHistory.find();
    res.json(histories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch search histories' });
  }
});




// Get all users (debug route)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // Only for testing
    res.json(users);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

app.delete('/api/searchhistories/:userId', async (req, res) => {
  const { userId } = req.params;
  const { filter } = req.query;

  const now = new Date();
  let filterDate;

  if (filter === 'today') {
    filterDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (filter === 'this_week') {
    const day = now.getDay(); // 0 = Sunday
    filterDate = new Date(now.setDate(now.getDate() - day));
    filterDate.setHours(0, 0, 0, 0);
  } else if (filter === 'this_month') {
    filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  try {
    // Fetch user's histories
    let histories = await SearchHistory.find({ userId });

    if (filter !== 'entire') {
      // Keep only the ones where the string `dateAndTime` is >= filterDate
      histories = histories.filter(h => {
        const historyDate = new Date(h.dateAndTime);
        return historyDate >= filterDate;
      });
    }

    const idsToDelete = histories.map(h => h._id);

    const result = await SearchHistory.deleteMany({ _id: { $in: idsToDelete } });

    res.status(200).json({ message: 'Deleted successfully', count: result.deletedCount });
  } catch (err) {
    console.error('Deletion error:', err);
    res.status(500).json({ error: 'Failed to delete search history' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

