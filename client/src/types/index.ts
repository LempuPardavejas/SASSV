export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'CLIENT';
  companyId?: string;
  hasPin: boolean;
}

export interface Product {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  category: string;
  unit: 'vnt' | 'm' | 'kg' | 'l';
  stock: number;
  price: number;
  min_stock?: number;
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

export interface Project {
  id: string;
  company_id: string;
  company_name?: string;
  company_code?: string;
  name: string;
  status: 'AKTYVUS' | 'UZBAIGTAS';
  created_at: string;
  updated_at: string;
}

export interface TransactionItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface Transaction {
  id: string;
  project_id: string;
  project_name?: string;
  company_id: string;
  company_name?: string;
  company_code?: string;
  type: 'PAEMIMAS' | 'GRAZINIMAS';
  created_by: string;
  created_by_username?: string;
  confirmed_by_pin: boolean;
  notes?: string;
  created_at: string;
  items?: TransactionItem[];
}

export interface CartItem extends TransactionItem {
  id: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
