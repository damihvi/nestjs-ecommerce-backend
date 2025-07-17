import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = 'https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api';

const useOrders = () => {
  const [orders, setOrders] = useState([]);
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

  // Obtener órdenes
  const fetchOrders = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching orders with:', { page, limit, filters });
      
      // Construir query params
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await fetch(`${API_BASE_URL}/orders?${queryParams}`, {
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
        setOrders(data.data.items || []);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: Math.ceil((data.data.meta?.totalItems || 0) / limit),
          totalItems: data.data.meta?.totalItems || 0,
          itemsPerPage: limit
        }));
      } else {
        throw new Error(data.message || 'Error al obtener órdenes');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener una orden específica
  const fetchOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener orden');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar estado de orden
  const updateOrderStatus = useCallback(async (orderId, status) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        await fetchOrders(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar estado de orden');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  // Cancelar orden
  const cancelOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
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
        await fetchOrders(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al cancelar orden');
      }
    } catch (err) {
      console.error('Error canceling order:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  // Obtener estadísticas de órdenes
  const getOrderStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      console.error('Error getting order stats:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cambiar página
  const goToPage = useCallback((page) => {
    fetchOrders(page, pagination.itemsPerPage);
  }, [fetchOrders, pagination.itemsPerPage]);

  // Cambiar tamaño de página
  const changePageSize = useCallback((size) => {
    fetchOrders(1, size);
  }, [fetchOrders]);

  // Cargar órdenes al montar el componente
  useEffect(() => {
    fetchOrders(1, pagination.itemsPerPage);
  }, [fetchOrders, pagination.itemsPerPage]);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    fetchOrder,
    updateOrderStatus,
    cancelOrder,
    getOrderStats,
    goToPage,
    changePageSize,
  };
};

export default useOrders;
