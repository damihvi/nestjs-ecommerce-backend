# 🔌 Guía Completa: Conexión Frontend para Visualizar Usuarios

## 📋 **Opciones Disponibles**

### 1️⃣ **HTML + JavaScript Vanilla (Más Simple)**
- **Archivo**: `admin-dashboard-test.html`
- **Uso**: Abrir directamente en el navegador
- **Ventajas**: No requiere configuración adicional

### 2️⃣ **React Hook + Componente (Recomendado)**
- **Archivos**: `hooks/useUsers.js` + `components/UsersList.jsx`
- **Uso**: Integrar en una aplicación React existente
- **Ventajas**: Más escalable y mantenible

### 3️⃣ **Test de Conexión**
- **Archivo**: `test-api-connection.html`
- **Uso**: Para probar la conectividad con el backend
- **Ventajas**: Ideal para debugging

---

## 🎯 **Opción 1: HTML Dashboard (Recomendado para empezar)**

### ✅ **Pasos:**
1. **Abrir el archivo**: `frontend-example/admin-dashboard-test.html`
2. **En el navegador**: Doble clic o arrastrar al navegador
3. **Resultado**: Dashboard completo con usuarios

### 🔧 **Características:**
- ✅ Lista completa de usuarios
- ✅ Paginación funcional
- ✅ Crear nuevos usuarios
- ✅ Estadísticas en tiempo real
- ✅ Búsqueda y filtros
- ✅ Diseño responsive

---

## 🎯 **Opción 2: React Components**

### 📁 **Estructura:**
```
frontend-example/
├── hooks/
│   ├── useUsers.js          # Hook personalizado
│   └── useUsers-fixed.js    # Versión corregida
├── components/
│   ├── UsersList.jsx        # Componente principal
│   └── UsersList-new.jsx    # Versión nueva
```

### 🔧 **Implementación:**

#### **1. Hook personalizado (useUsers.js)**
```javascript
import { useState, useEffect, useCallback } from 'react';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API_BASE_URL = 'https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/public-list`);
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data.items || []);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, fetchUsers };
};
```

#### **2. Componente UsersList (UsersList.jsx)**
```jsx
import React from 'react';
import { useUsers } from '../hooks/useUsers';

const UsersList = () => {
  const { users, loading, error, fetchUsers } = useUsers();

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Lista de Usuarios</h1>
      <button onClick={fetchUsers}>Recargar</button>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Email</th>
            <th>Rol</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;
```

#### **3. Uso en aplicación React**
```jsx
import React from 'react';
import UsersList from './components/UsersList';

function App() {
  return (
    <div className="App">
      <UsersList />
    </div>
  );
}

export default App;
```

---

## 🎯 **Opción 3: JavaScript Puro (Fetch API)**

### 📝 **Código básico:**
```javascript
// Función para obtener usuarios
async function fetchUsers() {
  try {
    const response = await fetch('https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api/users/public-list');
    const data = await response.json();
    
    if (data.success) {
      displayUsers(data.data.items);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para mostrar usuarios
function displayUsers(users) {
  const container = document.getElementById('users-container');
  container.innerHTML = '';
  
  users.forEach(user => {
    const userElement = document.createElement('div');
    userElement.innerHTML = `
      <h3>${user.username}</h3>
      <p>Email: ${user.email}</p>
      <p>Rol: ${user.role}</p>
      <p>Estado: ${user.isActive ? 'Activo' : 'Inactivo'}</p>
    `;
    container.appendChild(userElement);
  });
}

// Llamar la función
fetchUsers();
```

---

## 🌐 **Endpoints Disponibles**

### ✅ **Endpoint Principal:**
```
GET https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api/users/public-list
```

### ✅ **Endpoint con Paginación:**
```
GET https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api/users?page=1&limit=10
```

### ✅ **Crear Usuario:**
```
POST https://nestjs-ecommerce-backend-api.desarrollo-software.xyz/api/users
Content-Type: application/json

{
  "username": "ejemplo",
  "email": "ejemplo@email.com",
  "password": "password123",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "role": "customer"
}
```

---

## 🚀 **Recomendación**

### 📌 **Para empezar AHORA:**
1. Abre `admin-dashboard-test.html` en tu navegador
2. Deberías ver todos los usuarios inmediatamente
3. Usa las funciones de paginación y creación

### 📌 **Para integrar en tu aplicación:**
1. Usa los archivos React (`useUsers.js` + `UsersList.jsx`)
2. Importa el componente en tu aplicación
3. Personaliza el diseño según tus necesidades

---

## 🛠️ **Solución de Problemas**

### ❌ **Si no ves usuarios:**
1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Busca errores o mensajes de debug
4. Verifica que el backend esté funcionando

### ❌ **Si hay errores CORS:**
- El backend ya está configurado para CORS
- Usa el endpoint `public-list` que no requiere autenticación

### ❌ **Si la paginación no funciona:**
- Usa la versión con cache local (ya implementada)
- Los datos se cargan una vez y se paginan localmente

---

## 🎯 **Próximos Pasos**

1. **Probar la conexión**: Usar `test-api-connection.html`
2. **Ver el dashboard**: Abrir `admin-dashboard-test.html`
3. **Integrar en React**: Usar los hooks y componentes
4. **Personalizar**: Adaptar el diseño a tus necesidades

---

¿Cuál opción prefieres usar? ¿Necesitas ayuda con alguna implementación específica?
