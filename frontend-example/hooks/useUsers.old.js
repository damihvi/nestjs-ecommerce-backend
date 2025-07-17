import { useState, useEffect, useCallback } from 'react';

// Configuración de la API
const API_BASE_URL = 'https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api';

// Hook personalizado para manejar usuarios
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Función para obtener usuarios del backend
  const fetchUsers = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // Usar el endpoint público que funciona
      const response = await fetch(`${API_BASE_URL}/users/public-list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Agregar token si es necesario
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data); // Para debugging
      
      if (data.success && data.data && data.data.items) {
        const allUsers = data.data.items;
        
        // Implementar paginación manual del lado del cliente
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedUsers = allUsers.slice(startIndex, endIndex);
        
        setUsers(paginatedUsers);
        setPagination({
          currentPage: page,
          totalPages: Math.ceil(allUsers.length / limit),
          totalItems: allUsers.length,
          itemsPerPage: limit
        });
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
        // Recargar la lista de usuarios después de crear uno nuevo
        await fetchUsers(pagination.currentPage, pagination.itemsPerPage);
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
  }, [fetchUsers, pagination.currentPage, pagination.itemsPerPage]);

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
        // Recargar la lista de usuarios después de eliminar
        await fetchUsers(pagination.currentPage, pagination.itemsPerPage);
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
  }, [fetchUsers, pagination.currentPage, pagination.itemsPerPage]);

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
        // Recargar la lista de usuarios después de actualizar
        await fetchUsers(pagination.currentPage, pagination.itemsPerPage);
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
  }, [fetchUsers, pagination.currentPage, pagination.itemsPerPage]);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    pagination,
    fetchUsers,
    createUser,
    deleteUser,
    updateUser,
    // Función para cambiar de página
    goToPage: (page) => fetchUsers(page, pagination.itemsPerPage),
    // Función para cambiar tamaño de página
    changePageSize: (size) => fetchUsers(1, size),
  };
};

// Hook para obtener un usuario específico
export const useUser = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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
        setUser(data.data);
      } else {
        throw new Error(data.message || 'Error al obtener usuario');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
};

export default useUsers;
