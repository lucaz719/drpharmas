import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/backend';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  role_display: string;
  organization_id: number | null;
  organization_name: string | null;
  organization_type: string | null;
  branch_id: number | null;
  branch_name: string | null;
  branch_type: string | null;
  employee_id: string | null;
  is_active: boolean;
  status: string;
  date_joined: string;
  last_login: string | null;
}

export const authService = {
  async getUserProfile(): Promise<UserProfile> {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE_URL}/auth/profile/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
      email,
      password
    });
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('currentUser', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  async logout() {
    const refreshToken = localStorage.getItem('refresh_token');
    try {
      await axios.post(`${API_BASE_URL}/auth/logout/`, {
        refresh_token: refreshToken
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('currentUser');
    }
  }
};