// services/usuarioService.ts
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

  return response.json();
};

export interface Usuario {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  username: string;
  roles: { id: number; nombre: string }[];
}

export interface Rol {
  id: number;
  nombre: string;
}

export const usuarioService = {
  findAll: async (): Promise<Usuario[]> => {
    return await fetchAPI('/usuario');
  },

  findById: async (id: number): Promise<Usuario> => {
    return await fetchAPI(`/usuario/${id}`);
  },

  update: async (id: number, data: Partial<Usuario>): Promise<Usuario> => {
    const { nombres, apellidos, email } = data;
    return await fetchAPI(`/usuario/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ nombres, apellidos, email }),
    });
  },

  asignarRol: async (idUsuario: number, idRol: number): Promise<Usuario> => {
    return await fetchAPI(`/usuario/${idUsuario}/roles/${idRol}`, {
      method: 'POST',
    });
  },

  removerRol: async (idUsuario: number, idRol: number): Promise<Usuario> => {
    return await fetchAPI(`/usuario/${idUsuario}/roles/${idRol}`, {
      method: 'DELETE',
    });
  },

  getRoles: async (): Promise<Rol[]> => {
    return await fetchAPI('/rol');
  },
};