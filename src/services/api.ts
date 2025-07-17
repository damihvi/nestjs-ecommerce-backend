import axios from 'axios';
import { API_CONFIG, API_HEADERS } from '../routes';

// Crear instancia de axios para llamadas públicas
export const publicApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_HEADERS.PUBLIC,
});

// Crear instancia de axios para llamadas privadas (admin)
export const adminApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_HEADERS.PRIVATE,
});

// Interceptor para agregar el token en las llamadas admin
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Funciones helper para requests comunes
export const apiHelpers = {
  // GET con paginación
  getPaginated: async (url: string, page = 1, limit = 10) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return adminApi.get(`${url}?${params}`);
  },

  // POST con manejo de archivos
  postWithFiles: async (url: string, data: any, fileField: string) => {
    const formData = new FormData();
    
    // Agregar campos normales
    Object.keys(data).forEach(key => {
      if (key !== fileField) {
        formData.append(key, data[key]);
      }
    });

    // Agregar archivos
    if (data[fileField]) {
      if (Array.isArray(data[fileField])) {
        data[fileField].forEach((file: File) => {
          formData.append(fileField, file);
        });
      } else {
        formData.append(fileField, data[fileField]);
      }
    }

    return adminApi.post(url, formData, {
      headers: {
        ...API_HEADERS.MULTIPART,
      },
    });
  },
};
