// services/vehiculoService.ts
import { Vehiculo } from '../types/types';

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

export const vehiculoService = {
  findAll: async (): Promise<Vehiculo[]> => {
    return await fetchAPI('/vehiculo');
  },

  findById: async (id: number): Promise<Vehiculo> => {
    return await fetchAPI(`/vehiculo/${id}`);
  },

  create: async (data: Partial<Vehiculo>): Promise<Vehiculo> => {
    const { marca, modelo, año, numeroPlaca, color, tipo, odometro, estado } = data || {};
    return await fetchAPI('/vehiculo', {
      method: 'POST',
      body: JSON.stringify({ marca, modelo, año, numeroPlaca, color, tipo, odometro, estado }),
    });
  },

  update: async (id: number, data: Partial<Vehiculo>): Promise<Vehiculo> => {
    const { marca, modelo, año, numeroPlaca, color, tipo, odometro, estado } = data;
    return await fetchAPI(`/vehiculo/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ marca, modelo, año, numeroPlaca, color, tipo, odometro, estado }),
    });
  },

  delete: async (id: number): Promise<void> => {
    await fetchAPI(`/vehiculo/${id}`, {
      method: 'DELETE',
    });
  },

  asignarRegistroServicio: async (idVehiculo: number, idRegistroServicio: number): Promise<Vehiculo> => {
    return await fetchAPI(`/vehiculo/${idVehiculo}/registro-servicio/${idRegistroServicio}`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  removerRegistroServicio: async (idVehiculo: number, idRegistroServicio: number): Promise<Vehiculo> => {
    return await fetchAPI(`/vehiculo/${idVehiculo}/registro-servicio/${idRegistroServicio}`, {
      method: 'DELETE',
    });
  },
};