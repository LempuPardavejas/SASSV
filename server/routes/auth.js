import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Vartotojo vardas ir slaptažodis reikalingi' });
    }

    const user = User.findByUsername(username);

    if (!user) {
      return res.status(401).json({ error: 'Neteisingi prisijungimo duomenys' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Neteisingi prisijungimo duomenys' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        companyId: user.company_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );

    // Return user data without sensitive info
    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      companyId: user.company_id,
      hasPin: !!user.pin_hash
    };

    res.json({
      user: userData,
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Prisijungimo klaida' });
  }
});

// Verify PIN
router.post('/verify-pin', authenticate, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ error: 'PIN kodas reikalingas' });
    }

    const user = User.findById(req.userId);

    if (!user || !user.pin_hash) {
      return res.status(400).json({ error: 'PIN kodas nenustatytas' });
    }

    const isValid = await User.verifyPin(pin, user.pin_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Neteisingas PIN kodas' });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({ error: 'PIN patvirtinimo klaida' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token reikalingas' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'Vartotojas nerastas' });
    }

    // Generate new tokens
    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        companyId: user.company_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN }
    );

    res.json({
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Netinkamas refresh token' });
  }
});

// Get current user
router.get('/me', authenticate, (req, res) => {
  try {
    const user = User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'Vartotojas nerastas' });
    }

    const userData = {
      id: user.id,
      username: user.username,
      role: user.role,
      companyId: user.company_id,
      hasPin: !!user.pin_hash
    };

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Klaida gaunant vartotojo duomenis' });
  }
});

export default router;
