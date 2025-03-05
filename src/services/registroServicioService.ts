// services/registroServicioService.ts
import { RegistroServicio, Taller, Vehiculo } from '../types/types';

const API_URL = "https://backend-vehiculos-production.up.railway.app";

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

export const registroServicioService = {
  findAll: async (): Promise<RegistroServicio[]> => {
    return await fetchAPI('/registro-servicio');
  },

  findById: async (id: number): Promise<RegistroServicio> => {
    return await fetchAPI(`/registro-servicio/${id}`);
  },

  findTalleres: async (): Promise<Taller[]> => {
    return await fetchAPI('/taller');
  },

  findVehiculos: async (): Promise<Vehiculo[]> => {
    return await fetchAPI('/vehiculo');
  },

  create: async (data: Partial<RegistroServicio>): Promise<RegistroServicio> => {
    const { fechaServicio, descripcion, costo, tipoServicio, kilometraje, documentos, vehiculo, taller } = data || {};
    return await fetchAPI('/registro-servicio', {
      method: 'POST',
      body: JSON.stringify({ fechaServicio, descripcion, costo, tipoServicio, kilometraje, documentos, vehiculo, taller }),
    });
  },

  update: async (id: number, data: Partial<RegistroServicio>): Promise<RegistroServicio> => {
    const { fechaServicio, descripcion, costo, tipoServicio, kilometraje, documentos, vehiculo, taller } = data;
    return await fetchAPI(`/registro-servicio/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ fechaServicio, descripcion, costo, tipoServicio, kilometraje, documentos, vehiculo, taller }),
    });
  },

  delete: async (id: number): Promise<void> => {
    await fetchAPI(`/registro-servicio/${id}`, {
      method: 'DELETE',
    });
  },
};