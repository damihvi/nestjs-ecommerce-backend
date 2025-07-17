import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = 'https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api';

const useProducts = () => {
  const [products, setProducts] = useState([]);
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

  // Obtener productos
  const fetchProducts = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching products with:', { page, limit, filters });
      
      // Construir query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await fetch(`${API_BASE_URL}/products?${queryParams}`, {
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
        setProducts(data.data.items || []);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: Math.ceil((data.data.meta?.totalItems || 0) / limit),
          totalItems: data.data.meta?.totalItems || 0,
          itemsPerPage: limit
        }));
      } else {
        throw new Error(data.message || 'Error al obtener productos');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear producto
  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'images' && Array.isArray(productData[key])) {
          productData[key].forEach(image => {
            if (image instanceof File) {
              formData.append('images', image);
            }
          });
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchProducts(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear producto');
      }
    } catch (err) {
      console.error('Error creating product:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Actualizar producto
  const updateProduct = useCallback(async (productId, productData) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (key === 'images' && Array.isArray(productData[key])) {
          productData[key].forEach(image => {
            if (image instanceof File) {
              formData.append('images', image);
            }
          });
        } else {
          formData.append(key, productData[key]);
        }
      });

      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchProducts(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar producto');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Eliminar producto
  const deleteProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
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
        await fetchProducts(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return true;
      } else {
        throw new Error(data.message || 'Error al eliminar producto');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Toggle estado activo/inactivo
  const toggleProductActive = useCallback(async (productId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/toggle-active`, {
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
        await fetchProducts(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al cambiar estado del producto');
      }
    } catch (err) {
      console.error('Error toggling product:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Toggle destacado
  const toggleProductFeatured = useCallback(async (productId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/toggle-featured`, {
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
        await fetchProducts(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al cambiar estado destacado del producto');
      }
    } catch (err) {
      console.error('Error toggling featured:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  // Cambiar página
  const goToPage = useCallback((page) => {
    fetchProducts(page, pagination.itemsPerPage);
  }, [fetchProducts, pagination.itemsPerPage]);

  // Cambiar tamaño de página
  const changePageSize = useCallback((size) => {
    fetchProducts(1, size);
  }, [fetchProducts]);

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts(1, pagination.itemsPerPage);
  }, [fetchProducts, pagination.itemsPerPage]);

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    toggleProductFeatured,
    goToPage,
    changePageSize,
  };
};

export default useProducts;
