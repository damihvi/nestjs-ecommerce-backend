import axios from 'axios';

// Configuración base de la API
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
};

// Headers comunes
const API_HEADERS = {
  PUBLIC: {
    'Content-Type': 'application/json',
  },
  PRIVATE: {
    'Content-Type': 'application/json',
  },
  MULTIPART: {
    'Content-Type': 'multipart/form-data',
  },
};

// Crear instancias de axios
export const publicApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_HEADERS.PUBLIC,
});

export const adminApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_HEADERS.PRIVATE,
});

// Interceptor para agregar el token y roles a las peticiones
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Agregar roles del usuario si existen
    if (user.roles) {
      config.headers['X-User-Roles'] = user.roles.join(',');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Usuario no tiene los permisos necesarios
      console.error('Acceso denegado: No tienes los permisos necesarios');
    }
    return Promise.reject(error);
  }
);

// Helpers para peticiones comunes
export const apiHelpers = {
  // GET paginado
  getPaginated: async (url: string, page = 1, limit = 10) => {
    return await adminApi.get(`${url}?page=${page}&limit=${limit}`);
  },

  // POST con archivos
  postWithFiles: async (url: string, data: any, fileField: string) => {
    const formData = new FormData();
    
    // Si hay archivo, agregarlo al FormData
    if (data[fileField]) {
      formData.append(fileField, data[fileField]);
      delete data[fileField];
    }
    
    // Agregar el resto de datos
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    return await adminApi.post(url, formData, {
      headers: API_HEADERS.MULTIPART,
    });
  },

  // PUT con archivos
  putWithFiles: async (url: string, data: any, fileField: string) => {
    const formData = new FormData();
    
    if (data[fileField]) {
      formData.append(fileField, data[fileField]);
      delete data[fileField];
    }
    
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    return await adminApi.put(url, formData, {
      headers: API_HEADERS.MULTIPART,
    });
  }
};
