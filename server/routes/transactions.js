import express from 'express';
import Transaction from '../models/Transaction.js';
import { authenticate, authorizeCompany, verifyPin } from '../middleware/auth.js';

const router = express.Router();

// Get all transactions (admin) or company transactions (client)
router.get('/', authenticate, (req, res) => {
  try {
    let transactions;

    if (req.userRole === 'ADMIN') {
      transactions = Transaction.findAll();
    } else {
      transactions = Transaction.findByCompanyId(req.userCompanyId);
    }

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Klaida gaunant transakcijas' });
  }
});

// Get transaction by ID
router.get('/:id', authenticate, (req, res) => {
  try {
    const transaction = Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transakcija nerasta' });
    }

    // Check authorization
    if (req.userRole !== 'ADMIN' && transaction.company_id !== req.userCompanyId) {
      return res.status(403).json({ error: 'Prieiga draudžiama' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Klaida gaunant transakciją' });
  }
});

// Get transactions by company
router.get('/company/:companyId', authenticate, authorizeCompany, (req, res) => {
  try {
    const transactions = Transaction.findByCompanyId(req.params.companyId);
    res.json(transactions);
  } catch (error) {
    console.error('Get company transactions error:', error);
    res.status(500).json({ error: 'Klaida gaunant įmonės transakcijas' });
  }
});

// Get transactions by project
router.get('/project/:projectId', authenticate, (req, res) => {
  try {
    const transactions = Transaction.findByProjectId(req.params.projectId);

    if (transactions.length > 0) {
      // Check authorization
      if (req.userRole !== 'ADMIN' && transactions[0].company_id !== req.userCompanyId) {
        return res.status(403).json({ error: 'Prieiga draudžiama' });
      }
    }

    res.json(transactions);
  } catch (error) {
    console.error('Get project transactions error:', error);
    res.status(500).json({ error: 'Klaida gaunant projekto transakcijas' });
  }
});

// Create transaction (requires PIN verification)
router.post('/', authenticate, async (req, res) => {
  try {
    const { projectId, companyId, type, items, pin, notes } = req.body;

    if (!projectId || !companyId || !type || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Privalomi laukai: projectId, companyId, type, items' });
    }

    if (!pin) {
      return res.status(400).json({ error: 'PIN kodas reikalingas transakcijai patvirtinti' });
    }

    // Verify PIN
    const User = (await import('../models/User.js')).default;
    const user = User.findById(req.userId);
    
    if (!user || !user.pin_hash) {
      return res.status(400).json({ error: 'PIN kodas nenustatytas' });
    }

    const isValidPin = await User.verifyPin(pin, user.pin_hash);
    
    if (!isValidPin) {
      return res.status(401).json({ error: 'Neteisingas PIN kodas' });
    }

    // Check authorization
    if (req.userRole !== 'ADMIN' && companyId !== req.userCompanyId) {
      return res.status(403).json({ error: 'Galite kurti tik savo įmonės transakcijas' });
    }

    // Validate type
    if (!['PAEMIMAS', 'GRAZINIMAS'].includes(type)) {
      return res.status(400).json({ error: 'Neteisingas transakcijos tipas' });
    }

    const transaction = Transaction.create({
      projectId,
      companyId,
      type,
      createdBy: req.userId,
      items,
      confirmedByPin: true,
      notes
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Klaida kuriant transakciją: ' + error.message });
  }
});

// Get today's statistics
router.get('/stats/today', authenticate, (req, res) => {
  try {
    const stats = Transaction.getTodayStats();
    res.json(stats);
  } catch (error) {
    console.error('Get today stats error:', error);
    res.status(500).json({ error: 'Klaida gaunant statistiką' });
  }
});

// Delete transaction (admin only)
router.delete('/:id', authenticate, (req, res) => {
  try {
    if (req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Tik administratorius gali trinti transakcijas' });
    }

    const transaction = Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transakcija nerasta' });
    }

    Transaction.delete(req.params.id);
    res.json({ message: 'Transakcija ištrinta' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Klaida trinant transakciją' });
  }
});

export default router;
