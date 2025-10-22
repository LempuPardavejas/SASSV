import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Autentifikacija reikalinga' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userCompanyId = decoded.companyId;

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Netinkamas arba pasibaigęs token' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Prieiga draudžiama. Reikalingos administratoriaus teisės.' });
  }
  next();
};

export const authorizeCompany = (req, res, next) => {
  // Allow if admin OR if accessing own company data
  if (req.userRole === 'ADMIN') {
    return next();
  }

  const companyId = req.params.companyId || req.body.companyId || req.query.companyId;
  
  if (req.userCompanyId !== companyId) {
    return res.status(403).json({ error: 'Prieiga draudžiama. Galite matyti tik savo įmonės duomenis.' });
  }
  
  next();
};

export const verifyPin = async (req, res, next) => {
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

    next();
  } catch (error) {
    return res.status(500).json({ error: 'PIN patvirtinimo klaida' });
  }
};
