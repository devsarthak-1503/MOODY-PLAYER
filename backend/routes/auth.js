const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const db = require('../utils/db');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, avatar } = req.body;

  try {
    let user = await db.findUserByEmail(email);
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const generatedAvatar = avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

    user = await db.createUser({
      name,
      email,
      password: hashedPassword,
      avatar: generatedAvatar
    });

    const payload = {
      user: {
        id: user.id || user._id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'moody_player_super_secret_jwt_key_12345',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id || user._id, name: user.name, email: user.email, avatar: user.avatar } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id || user._id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'moody_player_super_secret_jwt_key_12345',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id || user._id, name: user.name, email: user.email, avatar: user.avatar } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/profile
// @desc    Update user profile (avatar, name)
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, avatar } = req.body;
  try {
    const user = await db.updateUser(req.user.id, { name, avatar });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ id: user.id || user._id, name: user.name, email: user.email, avatar: user.avatar });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
