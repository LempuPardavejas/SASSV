import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { LoginRequest, AuthResponse } from '../types';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Prisijungimo vardas ir slaptažodis yra privalomi' });
    }

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!user) {
      return res.status(401).json({ message: 'Neteisingas prisijungimo vardas arba slaptažodis' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Neteisingas prisijungimo vardas arba slaptažodis' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    const response: AuthResponse = {
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        company_id: user.company_id
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Verify PIN endpoint
router.post('/verify-pin', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ message: 'PIN kodas yra privalomas' });
    }

    if (req.user?.role !== 'CLIENT' || !req.user?.pin_hash) {
      return res.status(400).json({ message: 'PIN kodas nėra sukonfigūruotas šiam vartotojui' });
    }

    const isValidPin = await bcrypt.compare(pin, req.user.pin_hash);
    
    if (!isValidPin) {
      return res.status(401).json({ message: 'Neteisingas PIN kodas' });
    }

    res.json({ message: 'PIN kodas patvirtintas' });
  } catch (error) {
    console.error('PIN verification error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Atnaujinimo žetonas nepateiktas' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ message: 'Neteisingas atnaujinimo žetonas' });
    }

    const newToken = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({ message: 'Neteisingas atnaujinimo žetonas' });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, (req: AuthRequest, res: Response) => {
  // In a real application, you might want to blacklist the token
  res.json({ message: 'Sėkmingai atsijungta' });
});

// Get current user info
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({
    user: {
      id: req.user!.id,
      username: req.user!.username,
      role: req.user!.role,
      company_id: req.user!.company_id
    }
  });
});

export default router;