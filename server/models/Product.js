import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Product {
  static create({ code, barcode = null, name, category, unit, stock = 0, price, minStock = null }) {
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO products (id, code, barcode, name, category, unit, stock, price, min_stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, code, barcode, name, category, unit, stock, price, minStock);

    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id);
  }

  static findByCode(code) {
    const stmt = db.prepare('SELECT * FROM products WHERE code = ?');
    return stmt.get(code);
  }

  static findByBarcode(barcode) {
    const stmt = db.prepare('SELECT * FROM products WHERE barcode = ?');
    return stmt.get(barcode);
  }

  static findAll() {
    const stmt = db.prepare('SELECT * FROM products ORDER BY name');
    return stmt.all();
  }

  static search(query) {
    // Search by code, barcode, or name
    const stmt = db.prepare(`
      SELECT * FROM products 
      WHERE code LIKE ? 
         OR barcode LIKE ? 
         OR name LIKE ? 
      ORDER BY name
      LIMIT 20
    `);
    
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm);
  }

  static update(id, data) {
    const { code, barcode, name, category, unit, stock, price, minStock } = data;
    
    const stmt = db.prepare(`
      UPDATE products 
      SET code = ?, barcode = ?, name = ?, category = ?, unit = ?, stock = ?, price = ?, min_stock = ?
      WHERE id = ?
    `);

    stmt.run(code, barcode, name, category, unit, stock, price, minStock, id);

    return this.findById(id);
  }

  static updateStock(id, quantity, operation = 'add') {
    const product = this.findById(id);
    if (!product) return null;

    const newStock = operation === 'add' 
      ? product.stock + quantity 
      : product.stock - quantity;

    const stmt = db.prepare('UPDATE products SET stock = ? WHERE id = ?');
    stmt.run(newStock, id);

    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    return stmt.run(id);
  }

  static findLowStock() {
    const stmt = db.prepare(`
      SELECT * FROM products 
      WHERE min_stock IS NOT NULL AND stock <= min_stock
      ORDER BY stock ASC
    `);
    return stmt.all();
  }

  static findByCategory(category) {
    const stmt = db.prepare('SELECT * FROM products WHERE category = ? ORDER BY name');
    return stmt.all(category);
  }
}

export default Product;
