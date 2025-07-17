import { useState, useEffect, useCallback, useRef } from 'react';

const API_BASE_URL = 'https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Usar useRef para mantener una referencia estable a pagination
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  // Función para obtener usuarios del backend
  const fetchUsers = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching users with:', { page, limit });
      
      const response = await fetch(`${API_BASE_URL}/users?page=${page}&limit=${limit}`, {
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
        setUsers(data.data.items || []);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: Math.ceil((data.data.meta?.totalItems || 0) / limit),
          totalItems: data.data.meta?.totalItems || 0,
          itemsPerPage: limit
        }));
      } else {
        throw new Error(data.message || 'Error al obtener usuarios');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para crear un nuevo usuario
  const createUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Usar la referencia estable a pagination
        await fetchUsers(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear usuario');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  // Función para eliminar un usuario
  const deleteUser = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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
        // Usar la referencia estable a pagination
        await fetchUsers(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return true;
      } else {
        throw new Error(data.message || 'Error al eliminar usuario');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  // Función para actualizar un usuario
  const updateUser = useCallback(async (userId, userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Usar la referencia estable a pagination
        await fetchUsers(paginationRef.current.currentPage, paginationRef.current.itemsPerPage);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar usuario');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUsers]);

  // Función para cambiar de página
  const goToPage = useCallback((page) => {
    fetchUsers(page, pagination.itemsPerPage);
  }, [fetchUsers, pagination.itemsPerPage]);

  // Función para cambiar el tamaño de página
  const changePageSize = useCallback((size) => {
    fetchUsers(1, size);
  }, [fetchUsers]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers(1, pagination.itemsPerPage);
  }, [fetchUsers, pagination.itemsPerPage]);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    deleteUser,
    updateUser,
    goToPage,
    changePageSize,
  };
};

export default useUsers;
