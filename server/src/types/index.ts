export interface User {
  id: string;
  username: string;
  password_hash: string;
  role: 'ADMIN' | 'CLIENT';
  company_id?: string;
  pin_hash?: string;
  created_at: string;
}

export interface Company {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  credit_limit?: number;
  created_at: string;
}

export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  category?: string;
  unit: 'vnt' | 'm' | 'kg' | 'l';
  stock: number;
  price: number;
  min_stock?: number;
  created_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  name: string;
  status: 'AKTYVUS' | 'UZBAIGTAS';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  project_id: string;
  company_id: string;
  type: 'PAEMIMAS' | 'GRAZINIMAS';
  created_by: string;
  confirmed_by_pin: boolean;
  notes?: string;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
}

export interface CreateTransactionRequest {
  project_id: string;
  type: 'PAEMIMAS' | 'GRAZINIMAS';
  items: {
    product_id: string;
    quantity: number;
  }[];
  notes?: string;
  pin: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    role: 'ADMIN' | 'CLIENT';
    company_id?: string;
  };
}

export interface SearchResult {
  id: string;
  code: string;
  name: string;
  unit: string;
  stock: number;
  price: number;
  category?: string;
  barcode?: string;
}