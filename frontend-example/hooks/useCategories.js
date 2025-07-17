import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = 'https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api';

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  // Obtener categorías
  const fetchCategories = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching categories with:', { page, limit });
      
      const response = await fetch(`${API_BASE_URL}/categories?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      if (data.success) {
        setCategories(data.data.items || []);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: Math.ceil((data.data.meta?.totalItems || 0) / limit),
          totalItems: data.data.meta?.totalItems || 0,
          itemsPerPage: limit
        }));
      } else {
        throw new Error(data.message || 'Error al obtener categorías');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear categoría
  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.keys(categoryData).forEach(key => {
        if (key === 'image' && categoryData[key] instanceof File) {
          formData.append('image', categoryData[key]);
        } else {
          formData.append(key, categoryData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear categoría');
      }
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Actualizar categoría
  const updateCategory = useCallback(async (categoryId, categoryData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.keys(categoryData).forEach(key => {
        if (key === 'image' && categoryData[key] instanceof File) {
          formData.append('image', categoryData[key]);
        } else {
          formData.append(key, categoryData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar categoría');
      }
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Eliminar categoría
  const deleteCategory = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return true;
      } else {
        throw new Error(data.message || 'Error al eliminar categoría');
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Toggle estado activo/inactivo
  const toggleCategoryActive = useCallback(async (categoryId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/toggle-active`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchCategories(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al cambiar estado de la categoría');
      }
    } catch (err) {
      console.error('Error toggling category:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Cambiar página
  const goToPage = useCallback((page) => {
    fetchCategories(page, pagination.itemsPerPage);
  }, [fetchCategories, pagination.itemsPerPage]);

  // Cambiar tamaño de página
  const changePageSize = useCallback((size) => {
    fetchCategories(1, size);
  }, [fetchCategories]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories(1, pagination.itemsPerPage);
  }, [fetchCategories, pagination.itemsPerPage]);

  return {
    categories,
    loading,
    error,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryActive,
    goToPage,
    changePageSize,
  };
};

export default useCategories;
