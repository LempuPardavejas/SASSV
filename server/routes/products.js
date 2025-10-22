import express from 'express';
import Product from '../models/Product.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', authenticate, (req, res) => {
  try {
    const products = Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Klaida gaunant produktus' });
  }
});

// Search products (CRITICAL - for ultra-fast input)
router.get('/search', authenticate, (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json([]);
    }

    const products = Product.search(q);
    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ error: 'Paieškos klaida' });
  }
});

// Get low stock products
router.get('/low-stock', authenticate, authorizeAdmin, (req, res) => {
  try {
    const products = Product.findLowStock();
    res.json(products);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ error: 'Klaida gaunant produktus su žemu likučiu' });
  }
});

// Get product by ID
router.get('/:id', authenticate, (req, res) => {
  try {
    const product = Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produktas nerastas' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Klaida gaunant produktą' });
  }
});

// Create product (admin only)
router.post('/', authenticate, authorizeAdmin, (req, res) => {
  try {
    const { code, barcode, name, category, unit, stock, price, minStock } = req.body;

    if (!code || !name || !unit || price === undefined) {
      return res.status(400).json({ error: 'Privalomi laukai: code, name, unit, price' });
    }

    // Check if code already exists
    const existing = Product.findByCode(code);
    if (existing) {
      return res.status(400).json({ error: 'Produktas su tokiu kodu jau egzistuoja' });
    }

    const product = Product.create({
      code,
      barcode,
      name,
      category,
      unit,
      stock: stock || 0,
      price,
      minStock
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Klaida kuriant produktą' });
  }
});

// Update product (admin only)
router.put('/:id', authenticate, authorizeAdmin, (req, res) => {
  try {
    const product = Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produktas nerastas' });
    }

    const updated = Product.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Klaida atnaujinant produktą' });
  }
});

// Delete product (admin only)
router.delete('/:id', authenticate, authorizeAdmin, (req, res) => {
  try {
    const product = Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Produktas nerastas' });
    }

    Product.delete(req.params.id);
    res.json({ message: 'Produktas ištrintas' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Klaida trinant produktą' });
  }
});

export default router;
