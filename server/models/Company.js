import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Company {
  static create({ code, name, email = null, phone = null, address = null, creditLimit = null }) {
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO companies (id, code, name, email, phone, address, credit_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, code, name, email, phone, address, creditLimit);

    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM companies WHERE id = ?');
    return stmt.get(id);
  }

  static findByCode(code) {
    const stmt = db.prepare('SELECT * FROM companies WHERE code = ?');
    return stmt.get(code);
  }

  static findAll() {
    const stmt = db.prepare('SELECT * FROM companies ORDER BY name');
    return stmt.all();
  }

  static update(id, data) {
    const { code, name, email, phone, address, creditLimit } = data;
    
    const stmt = db.prepare(`
      UPDATE companies 
      SET code = ?, name = ?, email = ?, phone = ?, address = ?, credit_limit = ?
      WHERE id = ?
    `);

    stmt.run(code, name, email, phone, address, creditLimit, id);

    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM companies WHERE id = ?');
    return stmt.run(id);
  }

  static search(query) {
    const stmt = db.prepare(`
      SELECT * FROM companies 
      WHERE code LIKE ? OR name LIKE ?
      ORDER BY name
      LIMIT 20
    `);
    
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm);
  }
}

export default Company;
