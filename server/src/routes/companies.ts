import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { Company } from '../types';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all companies
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (search) {
      whereClause += ' AND (name LIKE ? OR code LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    const companies = await db.query(`
      SELECT 
        c.*,
        COUNT(DISTINCT p.id) as project_count,
        COUNT(DISTINCT u.id) as user_count,
        COALESCE(SUM(ti.total_price), 0) as total_value
      FROM companies c
      LEFT JOIN projects p ON c.id = p.company_id
      LEFT JOIN users u ON c.id = u.company_id
      LEFT JOIN transactions t ON c.id = t.company_id
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.name
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);

    const totalCount = await db.get(`
      SELECT COUNT(*) as count FROM companies ${whereClause}
    `, params);

    res.json({
      companies,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Get company by ID
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const company = await db.get(`
      SELECT 
        c.*,
        COUNT(DISTINCT p.id) as project_count,
        COUNT(DISTINCT u.id) as user_count,
        COALESCE(SUM(ti.total_price), 0) as total_value
      FROM companies c
      LEFT JOIN projects p ON c.id = p.company_id
      LEFT JOIN users u ON c.id = u.company_id
      LEFT JOIN transactions t ON c.id = t.company_id
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (!company) {
      return res.status(404).json({ message: 'Įmonė nerasta' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Create company (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { code, name, email, phone, address, credit_limit }: Company = req.body;

    if (!code || !name) {
      return res.status(400).json({ message: 'Privalomi laukai: kodas, pavadinimas' });
    }

    // Check if code already exists
    const existingCode = await db.get('SELECT id FROM companies WHERE code = ?', [code]);
    if (existingCode) {
      return res.status(400).json({ message: 'Įmonė su tokiu kodu jau egzistuoja' });
    }

    const id = uuidv4();
    await db.run(`
      INSERT INTO companies (id, code, name, email, phone, address, credit_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id, code, name, email || null, phone || null, address || null, credit_limit || null]);

    const newCompany = await db.get('SELECT * FROM companies WHERE id = ?', [id]);
    res.status(201).json(newCompany);
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Update company (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { code, name, email, phone, address, credit_limit }: Company = req.body;

    const existingCompany = await db.get('SELECT * FROM companies WHERE id = ?', [id]);
    if (!existingCompany) {
      return res.status(404).json({ message: 'Įmonė nerasta' });
    }

    // Check if code already exists (excluding current company)
    if (code !== existingCompany.code) {
      const existingCode = await db.get('SELECT id FROM companies WHERE code = ? AND id != ?', [code, id]);
      if (existingCode) {
        return res.status(400).json({ message: 'Įmonė su tokiu kodu jau egzistuoja' });
      }
    }

    await db.run(`
      UPDATE companies 
      SET code = ?, name = ?, email = ?, phone = ?, address = ?, credit_limit = ?
      WHERE id = ?
    `, [code, name, email || null, phone || null, address || null, credit_limit || null, id]);

    const updatedCompany = await db.get('SELECT * FROM companies WHERE id = ?', [id]);
    res.json(updatedCompany);
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Delete company (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingCompany = await db.get('SELECT * FROM companies WHERE id = ?', [id]);
    if (!existingCompany) {
      return res.status(404).json({ message: 'Įmonė nerasta' });
    }

    // Check if company has projects or users
    const projectCount = await db.get('SELECT COUNT(*) as count FROM projects WHERE company_id = ?', [id]);
    const userCount = await db.get('SELECT COUNT(*) as count FROM users WHERE company_id = ?', [id]);
    
    if (projectCount.count > 0 || userCount.count > 0) {
      return res.status(400).json({ 
        message: 'Negalima ištrinti įmonės su projektais ar vartotojais' 
      });
    }

    await db.run('DELETE FROM companies WHERE id = ?', [id]);
    res.json({ message: 'Įmonė sėkmingai ištrinta' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Get company users (Admin only)
router.get('/:id/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const users = await db.query(`
      SELECT id, username, role, created_at
      FROM users 
      WHERE company_id = ?
      ORDER BY created_at DESC
    `, [id]);

    res.json(users);
  } catch (error) {
    console.error('Get company users error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

export default router;