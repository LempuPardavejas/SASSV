import express from 'express';
import Company from '../models/Company.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all companies
router.get('/', authenticate, (req, res) => {
  try {
    const companies = Company.findAll();
    res.json(companies);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Klaida gaunant įmones' });
  }
});

// Search companies
router.get('/search', authenticate, (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const companies = Company.search(q);
    res.json(companies);
  } catch (error) {
    console.error('Search companies error:', error);
    res.status(500).json({ error: 'Paieškos klaida' });
  }
});

// Get company by ID
router.get('/:id', authenticate, (req, res) => {
  try {
    const company = Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ error: 'Įmonė nerasta' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Klaida gaunant įmonę' });
  }
});

// Create company (admin only)
router.post('/', authenticate, authorizeAdmin, (req, res) => {
  try {
    const { code, name, email, phone, address, creditLimit } = req.body;

    if (!code || !name) {
      return res.status(400).json({ error: 'Privalomi laukai: code, name' });
    }

    // Check if code already exists
    const existing = Company.findByCode(code);
    if (existing) {
      return res.status(400).json({ error: 'Įmonė su tokiu kodu jau egzistuoja' });
    }

    const company = Company.create({
      code,
      name,
      email,
      phone,
      address,
      creditLimit
    });

    res.status(201).json(company);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Klaida kuriant įmonę' });
  }
});

// Update company (admin only)
router.put('/:id', authenticate, authorizeAdmin, (req, res) => {
  try {
    const company = Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ error: 'Įmonė nerasta' });
    }

    const updated = Company.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Klaida atnaujinant įmonę' });
  }
});

// Delete company (admin only)
router.delete('/:id', authenticate, authorizeAdmin, (req, res) => {
  try {
    const company = Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ error: 'Įmonė nerasta' });
    }

    Company.delete(req.params.id);
    res.json({ message: 'Įmonė ištrinta' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ error: 'Klaida trinant įmonę' });
  }
});

export default router;
