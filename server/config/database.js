import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const createTables = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('ADMIN', 'CLIENT')),
      company_id TEXT,
      pin_hash TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // Companies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      credit_limit REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      barcode TEXT UNIQUE,
      name TEXT NOT NULL,
      category TEXT,
      unit TEXT NOT NULL CHECK(unit IN ('vnt', 'm', 'kg', 'l')),
      stock REAL DEFAULT 0,
      price REAL NOT NULL,
      min_stock REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'AKTYVUS' CHECK(status IN ('AKTYVUS', 'UZBAIGTAS')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    )
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('PAEMIMAS', 'GRAZINIMAS')),
      created_by TEXT NOT NULL,
      confirmed_by_pin INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // Transaction Items table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transaction_items (
      id TEXT PRIMARY KEY,
      transaction_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_code TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      price_per_unit REAL NOT NULL,
      total_price REAL NOT NULL,
      FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_transactions_company ON transactions(company_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_project ON transactions(project_id);
    CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
  `);

  console.log('✅ Database tables created successfully');
};

// Initialize database
createTables();

export default db;
