import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { Product, SearchResult } from '../types';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all products
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, category, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      whereClause += ' AND (name LIKE ? OR code LIKE ? OR barcode LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const products = await db.query(`
      SELECT * FROM products 
      ${whereClause}
      ORDER BY name 
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);

    const totalCount = await db.get(`
      SELECT COUNT(*) as count FROM products ${whereClause}
    `, params);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Search products (ultra-fast search for input system)
router.get('/search', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { q } = req.query;

    if (!q || q.toString().length < 2) {
      return res.json({ results: [] });
    }

    const searchTerm = `%${q}%`;
    const results: SearchResult[] = await db.query(`
      SELECT id, code, name, unit, stock, price, category, barcode
      FROM products 
      WHERE code LIKE ? OR barcode LIKE ? OR name LIKE ?
      ORDER BY 
        CASE 
          WHEN code = ? THEN 1
          WHEN barcode = ? THEN 2
          WHEN name LIKE ? THEN 3
          ELSE 4
        END,
        name
      LIMIT 20
    `, [searchTerm, searchTerm, searchTerm, q, q, `${q}%`]);

    res.json({ results });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ message: 'Produktas nerastas' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Create product (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { code, barcode, name, category, unit, stock, price, min_stock }: Product = req.body;

    if (!code || !name || !unit || !price) {
      return res.status(400).json({ message: 'Privalomi laukai: kodas, pavadinimas, vienetas, kaina' });
    }

    // Check if code already exists
    const existingCode = await db.get('SELECT id FROM products WHERE code = ?', [code]);
    if (existingCode) {
      return res.status(400).json({ message: 'Produktas su tokiu kodu jau egzistuoja' });
    }

    // Check if barcode already exists
    if (barcode) {
      const existingBarcode = await db.get('SELECT id FROM products WHERE barcode = ?', [barcode]);
      if (existingBarcode) {
        return res.status(400).json({ message: 'Produktas su tokiu barkodu jau egzistuoja' });
      }
    }

    const id = uuidv4();
    await db.run(`
      INSERT INTO products (id, code, barcode, name, category, unit, stock, price, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, code, barcode || null, name, category || null, unit, stock || 0, price, min_stock || null]);

    const newProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Update product (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, barcode, name, category, unit, stock, price, min_stock }: Product = req.body;

    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Produktas nerastas' });
    }

    // Check if code already exists (excluding current product)
    if (code !== existingProduct.code) {
      const existingCode = await db.get('SELECT id FROM products WHERE code = ? AND id != ?', [code, id]);
      if (existingCode) {
        return res.status(400).json({ message: 'Produktas su tokiu kodu jau egzistuoja' });
      }
    }

    // Check if barcode already exists (excluding current product)
    if (barcode && barcode !== existingProduct.barcode) {
      const existingBarcode = await db.get('SELECT id FROM products WHERE barcode = ? AND id != ?', [barcode, id]);
      if (existingBarcode) {
        return res.status(400).json({ message: 'Produktas su tokiu barkodu jau egzistuoja' });
      }
    }

    await db.run(`
      UPDATE products 
      SET code = ?, barcode = ?, name = ?, category = ?, unit = ?, stock = ?, price = ?, min_stock = ?
      WHERE id = ?
    `, [code, barcode || null, name, category || null, unit, stock, price, min_stock || null, id]);

    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({ message: 'Produktas nerastas' });
    }

    // Check if product is used in transactions
    const transactionItems = await db.get('SELECT COUNT(*) as count FROM transaction_items WHERE product_id = ?', [id]);
    if (transactionItems.count > 0) {
      return res.status(400).json({ message: 'Negalima ištrinti produkto, kuris naudojamas transakcijose' });
    }

    await db.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Produktas sėkmingai ištrintas' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Update stock (Admin only)
router.patch('/:id/stock', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (typeof stock !== 'number') {
      return res.status(400).json({ message: 'Neteisingas likučio formatas' });
    }

    await db.run('UPDATE products SET stock = ? WHERE id = ?', [stock, id]);
    
    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

export default router;