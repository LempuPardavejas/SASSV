import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../models/database';
import { Project } from '../types';
import { authenticateToken, requireAdmin, requireCompanyAccess, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all projects
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, companyId, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (companyId) {
      whereClause += ' AND p.company_id = ?';
      params.push(companyId);
    }

    if (status) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    // If user is CLIENT, only show their company's projects
    if (req.user?.role === 'CLIENT' && req.user?.company_id) {
      whereClause += ' AND p.company_id = ?';
      params.push(req.user.company_id);
    }

    const projects = await db.query(`
      SELECT 
        p.*,
        c.name as company_name,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(ti.total_price), 0) as total_value
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN transactions t ON p.id = t.project_id
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, Number(limit), offset]);

    const totalCount = await db.get(`
      SELECT COUNT(*) as count FROM projects p ${whereClause}
    `, params);

    res.json({
      projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount.count,
        pages: Math.ceil(totalCount.count / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Get project by ID
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await db.get(`
      SELECT 
        p.*,
        c.name as company_name,
        COUNT(t.id) as transaction_count,
        COALESCE(SUM(ti.total_price), 0) as total_value
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      LEFT JOIN transactions t ON p.id = t.project_id
      LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);

    if (!project) {
      return res.status(404).json({ message: 'Projektas nerastas' });
    }

    // Check access for CLIENT users
    if (req.user?.role === 'CLIENT' && req.user?.company_id !== project.company_id) {
      return res.status(403).json({ message: 'Prieiga prie šio projekto draudžiama' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Create project (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { company_id, name, status = 'AKTYVUS' }: Project = req.body;

    if (!company_id || !name) {
      return res.status(400).json({ message: 'Privalomi laukai: įmonė, pavadinimas' });
    }

    // Check if company exists
    const company = await db.get('SELECT * FROM companies WHERE id = ?', [company_id]);
    if (!company) {
      return res.status(404).json({ message: 'Įmonė nerasta' });
    }

    const id = uuidv4();
    await db.run(`
      INSERT INTO projects (id, company_id, name, status)
      VALUES (?, ?, ?, ?)
    `, [id, company_id, name, status]);

    const newProject = await db.get(`
      SELECT 
        p.*,
        c.name as company_name
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.id = ?
    `, [id]);

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Update project (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const existingProject = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existingProject) {
      return res.status(404).json({ message: 'Projektas nerastas' });
    }

    await db.run(`
      UPDATE projects 
      SET name = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, status, id]);

    const updatedProject = await db.get(`
      SELECT 
        p.*,
        c.name as company_name
      FROM projects p
      LEFT JOIN companies c ON p.company_id = c.id
      WHERE p.id = ?
    `, [id]);

    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Delete project (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existingProject = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
    if (!existingProject) {
      return res.status(404).json({ message: 'Projektas nerastas' });
    }

    // Check if project has transactions
    const transactionCount = await db.get('SELECT COUNT(*) as count FROM transactions WHERE project_id = ?', [id]);
    if (transactionCount.count > 0) {
      return res.status(400).json({ message: 'Negalima ištrinti projekto su transakcijomis' });
    }

    await db.run('DELETE FROM projects WHERE id = ?', [id]);
    res.json({ message: 'Projektas sėkmingai ištrintas' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

// Get project transactions
router.get('/:id/transactions', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Check project access
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
    if (!project) {
      return res.status(404).json({ message: 'Projektas nerastas' });
    }

    if (req.user?.role === 'CLIENT' && req.user?.company_id !== project.company_id) {
      return res.status(403).json({ message: 'Prieiga prie šio projekto draudžiama' });
    }

    const transactions = await db.query(`
      SELECT 
        t.*,
        u.username as created_by_username
      FROM transactions t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.project_id = ?
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, [id, Number(limit), offset]);

    const totalCount = await db.get(`
      SELECT COUNT(*) as count FROM transactions WHERE project_id = ?
    `, [id]);

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
    console.error('Get project transactions error:', error);
    res.status(500).json({ message: 'Vidinė serverio klaida' });
  }
});

export default router;