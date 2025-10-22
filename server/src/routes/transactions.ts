import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { CreateTransactionRequest, Transaction, TransactionItem } from '../types';
import { authenticateToken, requireCompanyAccess, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all transactions
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, companyId, projectId, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (companyId) {
      whereClause += ' AND t.company_id = ?';
      params.push(companyId);
    }

    if (projectId) {
      whereClause += ' AND t.project_id = ?';
      params.push(projectId);
    }

    if (type) {
      whereClause += ' AND t.type = ?';
      params.push(type);
    }

    // If user is CLIENT, only show their company's transactions
    if (req.user?.role === 'CLIENT' && req.user?.company_id) {
      whereClause += ' AND t.company_id = ?';
      params.push(req.user.company_id);
    }

    const transactions = await db.query(`
      SELECT 
        t.*,
        p.name as project_name,
        c.name as company_name,
        u.username as created_by_username
      FROM transactions t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN companies c ON t.company_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);

    const totalCount = await db.get(`
      SELECT COUNT(*) as count FROM transactions t ${whereClause}
    `, params);

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await db.get(`
      SELECT 
        t.*,
        p.name as project_name,
        c.name as company_name,
        u.username as created_by_username
      FROM transactions t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN companies c ON t.company_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `, [id]);

    if (!transaction) {
      return res.status(404).json({ message: 'Transakcija nerasta' });
    }

    // Check access for CLIENT users
    if (req.user?.role === 'CLIENT' && req.user?.company_id !== transaction.company_id) {
      return res.status(403).json({ message: 'Prieiga prie šios transakcijos draudžiama' });
    }

    const items = await db.query(`
      SELECT * FROM transaction_items WHERE transaction_id = ?
    `, [id]);

    res.json({
      ...transaction,
      items
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Create transaction
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { project_id, type, items, notes, pin }: CreateTransactionRequest = req.body;

    if (!project_id || !type || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Privalomi laukai: projektas, tipas, prekės' });
    }

    // Verify PIN for CLIENT users
    if (req.user?.role === 'CLIENT') {
      if (!pin) {
        return res.status(400).json({ message: 'PIN kodas yra privalomas' });
      }

      if (!req.user.pin_hash) {
        return res.status(400).json({ message: 'PIN kodas nėra sukonfigūruotas' });
      }

      const isValidPin = await bcrypt.compare(pin, req.user.pin_hash);
      if (!isValidPin) {
        return res.status(401).json({ message: 'Neteisingas PIN kodas' });
      }
    }

    // Get project and verify access
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [project_id]);
    if (!project) {
      return res.status(404).json({ message: 'Projektas nerastas' });
    }

    // Check company access
    if (req.user?.role === 'CLIENT' && req.user?.company_id !== project.company_id) {
      return res.status(403).json({ message: 'Prieiga prie šio projekto draudžiama' });
    }

    // Validate products and calculate totals
    const transactionItems: TransactionItem[] = [];
    let totalValue = 0;

    for (const item of items) {
      const product = await db.get('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) {
        return res.status(400).json({ message: `Produktas ${item.product_id} nerastas` });
      }

      // Check stock for PAEMIMAS transactions
      if (type === 'PAEMIMAS' && product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Nepakanka ${product.name} sandėlyje. Galimas kiekis: ${product.stock} ${product.unit}` 
        });
      }

      const totalPrice = product.price * item.quantity;
      totalValue += totalPrice;

      transactionItems.push({
        id: uuidv4(),
        transaction_id: '', // Will be set after transaction creation
        product_id: product.id,
        product_code: product.code,
        product_name: product.name,
        quantity: item.quantity,
        unit: product.unit,
        price_per_unit: product.price,
        total_price: totalPrice
      });
    }

    // Create transaction
    const transactionId = uuidv4();
    await db.run(`
      INSERT INTO transactions (id, project_id, company_id, type, created_by, confirmed_by_pin, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      transactionId,
      project_id,
      project.company_id,
      type,
      req.user!.id,
      req.user?.role === 'CLIENT' ? true : false,
      notes || null
    ]);

    // Create transaction items
    for (const item of transactionItems) {
      item.transaction_id = transactionId;
      await db.run(`
        INSERT INTO transaction_items (id, transaction_id, product_id, product_code, product_name, quantity, unit, price_per_unit, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.id, item.transaction_id, item.product_id, item.product_code, 
        item.product_name, item.quantity, item.unit, item.price_per_unit, item.total_price
      ]);
    }

    // Update product stock
    for (const item of transactionItems) {
      const stockChange = type === 'PAEMIMAS' ? -item.quantity : item.quantity;
      await db.run(`
        UPDATE products SET stock = stock + ? WHERE id = ?
      `, [stockChange, item.product_id]);
    }

    // Get created transaction with details
    const createdTransaction = await db.get(`
      SELECT 
        t.*,
        p.name as project_name,
        c.name as company_name,
        u.username as created_by_username
      FROM transactions t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN companies c ON t.company_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `, [transactionId]);

    const createdItems = await db.query(`
      SELECT * FROM transaction_items WHERE transaction_id = ?
    `, [transactionId]);

    res.status(201).json({
      ...createdTransaction,
      items: createdItems,
      totalValue
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Delete transaction (Admin only)
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Reikalingos administratoriaus teisės' });
    }

    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!transaction) {
      return res.status(404).json({ message: 'Transakcija nerasta' });
    }

    // Get transaction items to reverse stock changes
    const items = await db.query('SELECT * FROM transaction_items WHERE transaction_id = ?', [id]);

    // Reverse stock changes
    for (const item of items) {
      const stockChange = transaction.type === 'PAEMIMAS' ? item.quantity : -item.quantity;
      await db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [stockChange, item.product_id]);
    }

    // Delete transaction items
    await db.run('DELETE FROM transaction_items WHERE transaction_id = ?', [id]);

    // Delete transaction
    await db.run('DELETE FROM transactions WHERE id = ?', [id]);

    res.json({ message: 'Transakcija sėkmingai ištrinta' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

export default router;