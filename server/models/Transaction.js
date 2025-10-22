import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import Product from './Product.js';

class Transaction {
  static create({ projectId, companyId, type, createdBy, items, confirmedByPin = false, notes = null }) {
    const transactionId = uuidv4();

    // Start a transaction
    const createTransaction = db.transaction((transactionData, transactionItems) => {
      // Insert transaction
      const transStmt = db.prepare(`
        INSERT INTO transactions (id, project_id, company_id, type, created_by, confirmed_by_pin, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      transStmt.run(
        transactionData.id,
        transactionData.projectId,
        transactionData.companyId,
        transactionData.type,
        transactionData.createdBy,
        transactionData.confirmedByPin ? 1 : 0,
        transactionData.notes
      );

      // Insert transaction items and update stock
      const itemStmt = db.prepare(`
        INSERT INTO transaction_items (id, transaction_id, product_id, product_code, product_name, quantity, unit, price_per_unit, total_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of transactionItems) {
        const itemId = uuidv4();
        itemStmt.run(
          itemId,
          transactionData.id,
          item.productId,
          item.productCode,
          item.productName,
          item.quantity,
          item.unit,
          item.pricePerUnit,
          item.totalPrice
        );

        // Update product stock
        const stockOperation = transactionData.type === 'PAEMIMAS' ? 'subtract' : 'add';
        Product.updateStock(item.productId, item.quantity, stockOperation);
      }
    });

    // Execute transaction
    createTransaction(
      {
        id: transactionId,
        projectId,
        companyId,
        type,
        createdBy,
        confirmedByPin,
        notes
      },
      items
    );

    return this.findById(transactionId);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT t.*, 
             c.name as company_name, 
             c.code as company_code,
             p.name as project_name,
             u.username as created_by_username
      FROM transactions t
      JOIN companies c ON t.company_id = c.id
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON t.created_by = u.id
      WHERE t.id = ?
    `);
    
    const transaction = stmt.get(id);
    
    if (transaction) {
      // Get items
      const itemsStmt = db.prepare(`
        SELECT * FROM transaction_items WHERE transaction_id = ?
      `);
      transaction.items = itemsStmt.all(id);
    }

    return transaction;
  }

  static findAll() {
    const stmt = db.prepare(`
      SELECT t.*, 
             c.name as company_name, 
             c.code as company_code,
             p.name as project_name,
             u.username as created_by_username
      FROM transactions t
      JOIN companies c ON t.company_id = c.id
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `);
    
    return stmt.all();
  }

  static findByCompanyId(companyId) {
    const stmt = db.prepare(`
      SELECT t.*, 
             c.name as company_name, 
             c.code as company_code,
             p.name as project_name,
             u.username as created_by_username
      FROM transactions t
      JOIN companies c ON t.company_id = c.id
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON t.created_by = u.id
      WHERE t.company_id = ?
      ORDER BY t.created_at DESC
    `);
    
    return stmt.all(companyId);
  }

  static findByProjectId(projectId) {
    const stmt = db.prepare(`
      SELECT t.*, 
             c.name as company_name, 
             c.code as company_code,
             p.name as project_name,
             u.username as created_by_username
      FROM transactions t
      JOIN companies c ON t.company_id = c.id
      JOIN projects p ON t.project_id = p.id
      JOIN users u ON t.created_by = u.id
      WHERE t.project_id = ?
      ORDER BY t.created_at DESC
    `);
    
    const transactions = stmt.all(projectId);
    
    // Get items for each transaction
    const itemsStmt = db.prepare(`
      SELECT * FROM transaction_items WHERE transaction_id = ?
    `);
    
    transactions.forEach(transaction => {
      transaction.items = itemsStmt.all(transaction.id);
    });

    return transactions;
  }

  static delete(id) {
    // This will also delete items due to CASCADE
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    return stmt.run(id);
  }

  static getTodayStats() {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as count,
        type,
        SUM((SELECT SUM(total_price) FROM transaction_items WHERE transaction_id = t.id)) as total_value
      FROM transactions t
      WHERE DATE(t.created_at) = DATE('now')
      GROUP BY type
    `);
    
    return stmt.all();
  }
}

export default Transaction;
