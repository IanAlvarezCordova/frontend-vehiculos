// services/authService.ts
const API_URL = "https://backend-vehiculos-production.up.railway.app";

export const authService = {
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales incorrectas');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', data.email);
      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error desconocido al iniciar sesión');
    }
  },

  async register(nombres: string, apellidos: string, email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombres, apellidos, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar');
      }

      return await response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error desconocido al registrar');
    }
  },

  async updateProfile(id: number, data: Partial<any> & { password?: string }) {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    try {
      const response = await fetch(`${API_URL}/usuario/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el perfil');
      }

      return await response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error desconocido');
    }
  },

  async getProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No hay sesión activa');
    }

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('email');
          window.location.href = '/auth/login';
          throw new Error('Sesión expirada');
        }
        throw new Error('Error al obtener el perfil');
      }

      return await response.json();
    } catch (error) {
      throw error instanceof Error ? error : new Error('Error desconocido al obtener el perfil');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    window.location.href = '/auth/login';
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getRoles() {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.roles || [];
    } catch {
      return [];
    }
  },
};