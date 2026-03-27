import { API_BASE_URL } from "@/constants/api";

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "API request failed");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Vendor API functions
export const vendorApi = {
  getAll: () => apiClient.get("/api/vendors"),
  getBySlug: (slug: string) => apiClient.get(`/api/vendors/${slug}`),
  getMenu: (slug: string) => apiClient.get(`/api/vendors/${slug}/menu`),
  create: (data: any) => apiClient.post("/api/vendors", data),
  update: (id: string, data: any) => apiClient.put(`/api/vendors/${id}`, data),
};

// Order API functions
export const orderApi = {
  create: (data: any) => apiClient.post("/api/orders", data),
  getById: (id: string) => apiClient.get(`/api/orders/${id}`),
  getUserOrders: (userId: string) => apiClient.get(`/api/orders/user/${userId}`),
  updateStatus: (id: string, status: string) => 
    apiClient.put(`/api/orders/${id}/status`, { status }),
};

// Auth API functions
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post("/api/auth/login", { email, password }),
  register: (userData: any) =>
    apiClient.post("/api/auth/register", userData),
  logout: () => apiClient.post("/api/auth/logout", {}),
};