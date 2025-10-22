import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../models/database';
import { User } from '../types';

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Prieigos žetonas nepateiktas' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ message: 'Neteisingas prieigos žetonas' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Neteisingas prieigos žetonas' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Reikalingos administratoriaus teisės' });
  }
  next();
};

export const requireClient = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'CLIENT') {
    return res.status(403).json({ message: 'Reikalingos kliento teisės' });
  }
  next();
};

export const requireCompanyAccess = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === 'ADMIN') {
    return next();
  }
  
  if (req.user?.role === 'CLIENT' && req.user?.company_id) {
    // Check if the requested resource belongs to the user's company
    const companyId = req.params.companyId || req.body.company_id;
    if (companyId && companyId !== req.user.company_id) {
      return res.status(403).json({ message: 'Prieiga prie šios įmonės duomenų draudžiama' });
    }
    return next();
  }
  
  return res.status(403).json({ message: 'Nepakankamos teisės' });
};