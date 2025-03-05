const API_URL = "https://backend-vehiculos-production.up.railway.app";

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Error en la petición: ${response.statusText}`);
  }

  // 🛠️ Verifica si hay contenido antes de hacer response.json()
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};
