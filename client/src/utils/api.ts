import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  Product, 
  Transaction, 
  Project, 
  Company, 
  SearchResult,
  CreateTransactionRequest,
  ApiResponse 
} from '../types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'http://localhost:5000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {
                refreshToken
              });
              
              const { token } = response.data;
              localStorage.setItem('token', token);
              
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  }

  async verifyPin(pin: string): Promise<{ message: string }> {
    const response = await this.client.post('/auth/verify-pin', { pin });
    return response.data;
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.client.post('/auth/logout');
    return response.data;
  }

  async getCurrentUser(): Promise<{ user: any }> {
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  // Products endpoints
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<Product[]>> {
    const response = await this.client.get('/products', { params });
    return response.data;
  }

  async searchProducts(query: string): Promise<{ results: SearchResult[] }> {
    const response = await this.client.get('/products/search', { 
      params: { q: query } 
    });
    return response.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await this.client.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const response = await this.client.post('/products', product);
    return response.data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await this.client.put(`/products/${id}`, product);
    return response.data;
  }

  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/products/${id}`);
    return response.data;
  }

  async updateStock(id: string, stock: number): Promise<Product> {
    const response = await this.client.patch(`/products/${id}/stock`, { stock });
    return response.data;
  }

  // Transactions endpoints
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    companyId?: string;
    projectId?: string;
    type?: string;
  }): Promise<ApiResponse<Transaction[]>> {
    const response = await this.client.get('/transactions', { params });
    return response.data;
  }

  async getTransaction(id: string): Promise<Transaction> {
    const response = await this.client.get(`/transactions/${id}`);
    return response.data;
  }

  async createTransaction(transaction: CreateTransactionRequest): Promise<Transaction> {
    const response = await this.client.post('/transactions', transaction);
    return response.data;
  }

  async deleteTransaction(id: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/transactions/${id}`);
    return response.data;
  }

  // Projects endpoints
  async getProjects(params?: {
    page?: number;
    limit?: number;
    companyId?: string;
    status?: string;
  }): Promise<ApiResponse<Project[]>> {
    const response = await this.client.get('/projects', { params });
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.client.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const response = await this.client.post('/projects', project);
    return response.data;
  }

  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    const response = await this.client.put(`/projects/${id}`, project);
    return response.data;
  }

  async deleteProject(id: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/projects/${id}`);
    return response.data;
  }

  async getProjectTransactions(id: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Transaction[]>> {
    const response = await this.client.get(`/projects/${id}/transactions`, { params });
    return response.data;
  }

  // Companies endpoints
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<Company[]>> {
    const response = await this.client.get('/companies', { params });
    return response.data;
  }

  async getCompany(id: string): Promise<Company> {
    const response = await this.client.get(`/companies/${id}`);
    return response.data;
  }

  async createCompany(company: Omit<Company, 'id' | 'created_at'>): Promise<Company> {
    const response = await this.client.post('/companies', company);
    return response.data;
  }

  async updateCompany(id: string, company: Partial<Company>): Promise<Company> {
    const response = await this.client.put(`/companies/${id}`, company);
    return response.data;
  }

  async deleteCompany(id: string): Promise<{ message: string }> {
    const response = await this.client.delete(`/companies/${id}`);
    return response.data;
  }

  async getCompanyUsers(id: string): Promise<any[]> {
    const response = await this.client.get(`/companies/${id}/users`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;