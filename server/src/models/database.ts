import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const DB_PATH = process.env.DB_PATH || './database.sqlite';

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.init();
  }

  private async init() {
    await this.createTables();
    await this.insertDemoData();
  }

  private async createTables() {
    const runQuery = promisify(this.db.run.bind(this.db));

    await runQuery(`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        credit_limit DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('ADMIN', 'CLIENT')),
        company_id TEXT REFERENCES companies(id),
        pin_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        barcode TEXT UNIQUE,
        name TEXT NOT NULL,
        category TEXT,
        unit TEXT NOT NULL CHECK(unit IN ('vnt', 'm', 'kg', 'l')),
        stock DECIMAL(10,2) DEFAULT 0,
        price DECIMAL(10,2) NOT NULL,
        min_stock DECIMAL(10,2),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL REFERENCES companies(id),
        name TEXT NOT NULL,
        status TEXT DEFAULT 'AKTYVUS' CHECK(status IN ('AKTYVUS', 'UZBAIGTAS')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id),
        company_id TEXT NOT NULL REFERENCES companies(id),
        type TEXT NOT NULL CHECK(type IN ('PAEMIMAS', 'GRAZINIMAS')),
        created_by TEXT NOT NULL REFERENCES users(id),
        confirmed_by_pin BOOLEAN DEFAULT FALSE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await runQuery(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id TEXT PRIMARY KEY,
        transaction_id TEXT NOT NULL REFERENCES transactions(id),
        product_id TEXT NOT NULL REFERENCES products(id),
        product_code TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit TEXT NOT NULL,
        price_per_unit DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL
      )
    `);
  }

  private async insertDemoData() {
    const runQuery = promisify(this.db.run.bind(this.db));
    const getQuery = promisify(this.db.get.bind(this.db));

    // Check if data already exists
    const existingCompanies = await getQuery('SELECT COUNT(*) as count FROM companies');
    if ((existingCompanies as any).count > 0) return;

    // Insert demo companies
    await runQuery(`
      INSERT INTO companies (id, code, name, email, phone, address, credit_limit) VALUES
      ('comp-1', 'SPECVATAS', 'UAB "Spec Vatas"', 'info@specvatas.lt', '+370 600 12345', 'Vilniaus g. 1, Vilnius', 50000.00),
      ('comp-2', 'ELEKTRA', 'UAB "Elektra LT"', 'info@elektra.lt', '+370 600 23456', 'Kauno g. 2, Kaunas', 30000.00),
      ('comp-3', 'STATYBOS', 'UAB "Statybų Kompanija"', 'info@statybos.lt', '+370 600 34567', 'Klaipėdos g. 3, Klaipėda', 75000.00)
    `);

    // Insert demo products
    await runQuery(`
      INSERT INTO products (id, code, barcode, name, category, unit, stock, price, min_stock) VALUES
      ('prod-1', '0010006', '1524544204585', 'Kabelis YDYP 3x1.5', 'Kabeliai', 'm', 1000.0, 2.50, 50.0),
      ('prod-2', '0010007', '1524544204586', 'Kabelis YDYP 3x2.5', 'Kabeliai', 'm', 800.0, 3.20, 50.0),
      ('prod-3', '0020001', '1524544204587', 'Jungiklis Schneider Electric', 'Jungikliai', 'vnt', 150.0, 25.00, 10.0),
      ('prod-4', '0030015', '1524544204588', 'LED lempa 10W', 'Lempos', 'vnt', 200.0, 15.00, 20.0),
      ('prod-5', '0040022', '1524544204589', 'Kabelių kanalas 25x16', 'Kanalai', 'm', 500.0, 1.80, 25.0)
    `);

    // Insert demo users
    const bcrypt = require('bcryptjs');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const clientPasswordHash = await bcrypt.hash('spec123', 10);
    const pinHash = await bcrypt.hash('1234', 10);

    await runQuery(`
      INSERT INTO users (id, username, password_hash, role, company_id, pin_hash) VALUES
      ('user-1', 'admin', ?, 'ADMIN', NULL, NULL),
      ('user-2', 'specvatas_user', ?, 'CLIENT', 'comp-1', ?)
    `, [adminPasswordHash, clientPasswordHash, pinHash]);

    // Insert demo projects
    await runQuery(`
      INSERT INTO projects (id, company_id, name, status) VALUES
      ('proj-1', 'comp-1', '2025 Sausio užsakymas', 'AKTYVUS'),
      ('proj-2', 'comp-2', 'Elektrinės instaliacijos', 'AKTYVUS'),
      ('proj-3', 'comp-3', 'Naujo pastato elektrifikavimas', 'AKTYVUS')
    `);
  }

  getDb() {
    return this.db;
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    const all = promisify(this.db.all.bind(this.db));
    return await all(sql, params);
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    const get = promisify(this.db.get.bind(this.db));
    return await get(sql, params);
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    const run = promisify(this.db.run.bind(this.db));
    return await run(sql, params);
  }
}

export default new Database();