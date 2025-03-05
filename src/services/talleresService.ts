// services/talleresService.ts
import { Taller } from '../types/types';

const API_URL = "http://localhost:3000";

const fetchAPI = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('No tienes permisos para realizar esta acción');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error en la solicitud');
  }
    // Si la respuesta es 204 No Content, no intentamos parsear JSON
    if (response.status === 204) {
      return; // Devolvemos undefined para indicar que no hay cuerpo
    }

  return response.json();
};

export const tallerService = {
  findAll: async (): Promise<Taller[]> => {
    return await fetchAPI('/taller');
  },

  findById: async (id: number): Promise<Taller> => {
    return await fetchAPI(`/taller/${id}`);
  },

  create: async (data: Partial<Taller>): Promise<Taller> => {
    const { nombre, direccion, telefono, correo, horariosAtencion, especialidades } = data || {};
    return await fetchAPI('/taller', {
      method: 'POST',
      body: JSON.stringify({ nombre, direccion, telefono, correo, horariosAtencion, especialidades }),
    });
  },

  update: async (id: number, data: Partial<Taller>): Promise<Taller> => {
    const { nombre, direccion, telefono, correo, horariosAtencion, especialidades } = data;
    return await fetchAPI(`/taller/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombre, direccion, telefono, correo, horariosAtencion, especialidades }),
    });
  },

  delete: async (id: number): Promise<void> => {
    await fetchAPI(`/taller/${id}`, {
      method: 'DELETE',
    });
  },
};