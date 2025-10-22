import db from '../config/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

class User {
  static async create({ username, password, role, companyId = null, pin = null }) {
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = pin ? await bcrypt.hash(pin, 10) : null;

    const stmt = db.prepare(`
      INSERT INTO users (id, username, password_hash, role, company_id, pin_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, username, passwordHash, role, companyId, pinHash);

    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  static async verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
  }

  static async verifyPin(pin, hash) {
    if (!hash) return false;
    return bcrypt.compare(pin, hash);
  }

  static findAll() {
    const stmt = db.prepare('SELECT * FROM users');
    return stmt.all();
  }

  static findByCompanyId(companyId) {
    const stmt = db.prepare('SELECT * FROM users WHERE company_id = ?');
    return stmt.all(companyId);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }

  static async updatePin(userId, newPin) {
    const pinHash = await bcrypt.hash(newPin, 10);
    const stmt = db.prepare('UPDATE users SET pin_hash = ? WHERE id = ?');
    return stmt.run(pinHash, userId);
  }
}

export default User;
