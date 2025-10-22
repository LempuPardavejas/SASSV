import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Project {
  static create({ companyId, name, status = 'AKTYVUS' }) {
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO projects (id, company_id, name, status)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(id, companyId, name, status);

    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT p.*, c.name as company_name, c.code as company_code
      FROM projects p
      JOIN companies c ON p.company_id = c.id
      WHERE p.id = ?
    `);
    return stmt.get(id);
  }

  static findAll() {
    const stmt = db.prepare(`
      SELECT p.*, c.name as company_name, c.code as company_code
      FROM projects p
      JOIN companies c ON p.company_id = c.id
      ORDER BY p.created_at DESC
    `);
    return stmt.all();
  }

  static findByCompanyId(companyId) {
    const stmt = db.prepare(`
      SELECT p.*, c.name as company_name, c.code as company_code
      FROM projects p
      JOIN companies c ON p.company_id = c.id
      WHERE p.company_id = ?
      ORDER BY p.created_at DESC
    `);
    return stmt.all(companyId);
  }

  static findActiveByCompanyId(companyId) {
    const stmt = db.prepare(`
      SELECT p.*, c.name as company_name, c.code as company_code
      FROM projects p
      JOIN companies c ON p.company_id = c.id
      WHERE p.company_id = ? AND p.status = 'AKTYVUS'
      ORDER BY p.created_at DESC
    `);
    return stmt.all(companyId);
  }

  static update(id, data) {
    const { name, status } = data;
    
    const stmt = db.prepare(`
      UPDATE projects 
      SET name = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(name, status, id);

    return this.findById(id);
  }

  static updateStatus(id, status) {
    const stmt = db.prepare(`
      UPDATE projects 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(status, id);

    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
    return stmt.run(id);
  }

  static getStatistics(id) {
    // Get total transactions count
    const transStmt = db.prepare(`
      SELECT COUNT(*) as count, type
      FROM transactions
      WHERE project_id = ?
      GROUP BY type
    `);
    const transactions = transStmt.all(id);

    // Get total value
    const valueStmt = db.prepare(`
      SELECT SUM(ti.total_price) as total_value
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.project_id = ?
    `);
    const value = valueStmt.get(id);

    // Get total items count
    const itemsStmt = db.prepare(`
      SELECT COUNT(*) as count
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.project_id = ?
    `);
    const items = itemsStmt.get(id);

    return {
      transactions,
      totalValue: value?.total_value || 0,
      totalItems: items?.count || 0
    };
  }
}

export default Project;
