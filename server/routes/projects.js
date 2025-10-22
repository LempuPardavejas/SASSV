import express from 'express';
import Project from '../models/Project.js';
import { authenticate, authorizeAdmin, authorizeCompany } from '../middleware/auth.js';

const router = express.Router();

// Get all projects (admin) or company projects (client)
router.get('/', authenticate, (req, res) => {
  try {
    let projects;

    if (req.userRole === 'ADMIN') {
      projects = Project.findAll();
    } else {
      projects = Project.findByCompanyId(req.userCompanyId);
    }

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Klaida gaunant projektus' });
  }
});

// Get project by ID
router.get('/:id', authenticate, (req, res) => {
  try {
    const project = Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projektas nerastas' });
    }

    // Check authorization
    if (req.userRole !== 'ADMIN' && project.company_id !== req.userCompanyId) {
      return res.status(403).json({ error: 'Prieiga draudžiama' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Klaida gaunant projektą' });
  }
});

// Get project statistics
router.get('/:id/statistics', authenticate, (req, res) => {
  try {
    const project = Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projektas nerastas' });
    }

    // Check authorization
    if (req.userRole !== 'ADMIN' && project.company_id !== req.userCompanyId) {
      return res.status(403).json({ error: 'Prieiga draudžiama' });
    }

    const statistics = Project.getStatistics(req.params.id);
    res.json(statistics);
  } catch (error) {
    console.error('Get project statistics error:', error);
    res.status(500).json({ error: 'Klaida gaunant projekto statistiką' });
  }
});

// Get projects by company
router.get('/company/:companyId', authenticate, authorizeCompany, (req, res) => {
  try {
    const { status } = req.query;

    let projects;
    if (status === 'AKTYVUS') {
      projects = Project.findActiveByCompanyId(req.params.companyId);
    } else {
      projects = Project.findByCompanyId(req.params.companyId);
    }

    res.json(projects);
  } catch (error) {
    console.error('Get company projects error:', error);
    res.status(500).json({ error: 'Klaida gaunant įmonės projektus' });
  }
});

// Create project (admin only)
router.post('/', authenticate, authorizeAdmin, (req, res) => {
  try {
    const { companyId, name, status } = req.body;

    if (!companyId || !name) {
      return res.status(400).json({ error: 'Privalomi laukai: companyId, name' });
    }

    const project = Project.create({
      companyId,
      name,
      status: status || 'AKTYVUS'
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Klaida kuriant projektą' });
  }
});

// Update project (admin only)
router.put('/:id', authenticate, authorizeAdmin, (req, res) => {
  try {
    const project = Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projektas nerastas' });
    }

    const updated = Project.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Klaida atnaujinant projektą' });
  }
});

// Update project status (admin only)
router.patch('/:id/status', authenticate, authorizeAdmin, (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['AKTYVUS', 'UZBAIGTAS'].includes(status)) {
      return res.status(400).json({ error: 'Neteisingas statusas' });
    }

    const project = Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projektas nerastas' });
    }

    const updated = Project.updateStatus(req.params.id, status);
    res.json(updated);
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ error: 'Klaida atnaujinant projekto statusą' });
  }
});

// Delete project (admin only)
router.delete('/:id', authenticate, authorizeAdmin, (req, res) => {
  try {
    const project = Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: 'Projektas nerastas' });
    }

    Project.delete(req.params.id);
    res.json({ message: 'Projektas ištrintas' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Klaida trinant projektą' });
  }
});

export default router;
