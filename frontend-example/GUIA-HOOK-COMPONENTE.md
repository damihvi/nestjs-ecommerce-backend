# 🚀 Guía Completa: Cómo usar Hook y Componente para Visualizar Usuarios

## 📋 **Resumen Rápido**

Tienes **3 opciones** para visualizar usuarios:

### 🎯 **Opción 1: HTML Listo (Recomendado para pruebas)**
- **Archivo**: `react-users-dashboard.html`
- **Uso**: Abrir directamente en navegador
- **Ventajas**: Funciona inmediatamente, no requiere configuración

### 🎯 **Opción 2: React Hook + Componente**
- **Archivos**: `hooks/useUsers.js` + `components/UsersList.jsx`
- **Uso**: Para proyectos React existentes
- **Ventajas**: Modular, reutilizable, personalizable

### 🎯 **Opción 3: HTML Simple**
- **Archivo**: `admin-dashboard-test.html`
- **Uso**: Versión con debug integrado
- **Ventajas**: Información de debug visible

---

## 🔧 **Opción 2: Uso de Hook y Componente (Paso a Paso)**

### **Paso 1: Importar el Hook**

```javascript
import { useUsers } from './hooks/useUsers';
```

### **Paso 2: Usar el Hook en tu componente**

```javascript
const MiComponente = () => {
  const {
    users,           // Array de usuarios
    loading,         // Estado de carga (true/false)
    error,           // Error si existe
    pagination,      // Info de paginación
    fetchUsers,      // Función para recargar
    createUser,      // Función para crear usuario
    deleteUser,      // Función para eliminar
    updateUser,      // Función para actualizar
    goToPage         // Función para cambiar página
  } = useUsers();

  // Renderizar según el estado
  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Total: {pagination.totalItems} usuarios</h2>
      {users.map(user => (
        <div key={user.id}>
          <h3>{user.username}</h3>
          <p>{user.email}</p>
          <span>Rol: {user.role}</span>
        </div>
      ))}
    </div>
  );
};
```

### **Paso 3: Usar el Componente completo**

```javascript
import UsersList from './components/UsersList';

const App = () => {
  return (
    <div>
      <h1>Dashboard Admin</h1>
      <UsersList />
    </div>
  );
};
```

---

## 💻 **Ejemplos Prácticos**

### **Ejemplo 1: Componente Simple**

```javascript
import React from 'react';
import { useUsers } from './hooks/useUsers';

const UsuariosSimple = () => {
  const { users, loading, error } = useUsers();

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Usuarios Registrados</h2>
      <ul>
        {users.map(user => (
          <li key={user.id}>
            <strong>{user.username}</strong> - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

### **Ejemplo 2: Con Paginación**

```javascript
import React from 'react';
import { useUsers } from './hooks/useUsers';

const UsuariosConPaginacion = () => {
  const { users, loading, pagination, goToPage } = useUsers();

  return (
    <div>
      <h2>Usuarios ({pagination.totalItems} total)</h2>
      
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div>
            <button 
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Anterior
            </button>
            
            <span>
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
            
            <button 
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### **Ejemplo 3: Con Crear Usuario**

```javascript
import React, { useState } from 'react';
import { useUsers } from './hooks/useUsers';

const UsuariosConCrear = () => {
  const { users, loading, createUser } = useUsers();
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(nuevoUsuario);
      alert('Usuario creado exitosamente');
      setNuevoUsuario({ username: '', email: '', password: '', role: 'customer' });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Crear Usuario</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={nuevoUsuario.username}
          onChange={(e) => setNuevoUsuario({...nuevoUsuario, username: e.target.value})}
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={nuevoUsuario.email}
          onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={nuevoUsuario.password}
          onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
          required 
        />
        <select 
          value={nuevoUsuario.role}
          onChange={(e) => setNuevoUsuario({...nuevoUsuario, role: e.target.value})}
        >
          <option value="customer">Customer</option>
          <option value="seller">Seller</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Crear Usuario</button>
      </form>

      <h2>Lista de Usuarios</h2>
      {loading ? <p>Cargando...</p> : (
        <ul>
          {users.map(user => (
            <li key={user.id}>{user.username} - {user.email}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
```

---

## 🛠️ **Configuración del Proyecto**

### **Para proyecto React existente:**

1. **Copia los archivos:**
   - `hooks/useUsers.js` → `src/hooks/`
   - `components/UsersList.jsx` → `src/components/`

2. **Importa en tu App.js:**
   ```javascript
   import UsersList from './components/UsersList';
   
   function App() {
     return (
       <div>
         <UsersList />
       </div>
     );
   }
   ```

### **Para proyecto nuevo con Vite:**

```bash
# Crear proyecto
npm create vite@latest mi-dashboard -- --template react
cd mi-dashboard

# Instalar dependencias
npm install

# Copiar archivos useUsers.js y UsersList.jsx
# Modificar src/App.jsx para usar UsersList

# Ejecutar
npm run dev
```

### **Para proyecto nuevo con Create React App:**

```bash
# Crear proyecto
npx create-react-app mi-dashboard
cd mi-dashboard

# Copiar archivos
# Modificar src/App.js

# Ejecutar
npm start
```

---

## 📱 **Uso Inmediato (Sin configuración)**

### **Opción Rápida:**
1. Abre `react-users-dashboard.html` en tu navegador
2. ¡Listo! Ya funciona completamente

### **Opción con Debug:**
1. Abre `admin-dashboard-test.html` en tu navegador
2. Verás información de debug para troubleshooting

---

## 🎨 **Personalización**

### **Cambiar estilos:**
```javascript
// En UsersList.jsx, modificar las clases CSS
<div className="mi-clase-personalizada">
  {/* contenido */}
</div>
```

### **Cambiar API URL:**
```javascript
// En hooks/useUsers.js, modificar:
const API_BASE_URL = 'https://tu-api.com/api';
```

### **Agregar filtros:**
```javascript
const { users } = useUsers();
const usuariosActivos = users.filter(user => user.isActive);
```

---

## 🔧 **Funciones Disponibles del Hook**

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `fetchUsers(page, limit)` | Obtener usuarios | `fetchUsers(1, 10)` |
| `createUser(userData)` | Crear usuario | `createUser({username: 'juan', email: 'juan@email.com'})` |
| `deleteUser(userId)` | Eliminar usuario | `deleteUser(123)` |
| `updateUser(userId, data)` | Actualizar usuario | `updateUser(123, {email: 'nuevo@email.com'})` |
| `goToPage(page)` | Cambiar página | `goToPage(2)` |

---

## 🚨 **Troubleshooting**

### **No se cargan usuarios:**
1. Verifica que el backend esté funcionando
2. Revisa la consola del navegador (F12)
3. Confirma que la URL de la API sea correcta

### **Error de CORS:**
1. El backend ya tiene CORS configurado
2. Si persiste, prueba con `admin-dashboard-test.html`

### **Error de importación:**
1. Verifica que los archivos estén en las rutas correctas
2. Asegúrate de usar la sintaxis correcta de import/export

---

## 📊 **Datos que proporciona el Hook**

```javascript
const {
  users,           // Array de usuarios actuales
  loading,         // boolean - true cuando está cargando
  error,           // string - mensaje de error si existe
  pagination: {
    currentPage,   // número de página actual
    totalPages,    // total de páginas
    totalItems,    // total de usuarios
    itemsPerPage   // usuarios por página
  },
  fetchUsers,      // función para recargar
  createUser,      // función para crear
  deleteUser,      // función para eliminar
  updateUser,      // función para actualizar
  goToPage         // función para cambiar página
} = useUsers();
```

---

## 🎯 **Ejemplo de Uso Completo**

```javascript
import React from 'react';
import { useUsers } from './hooks/useUsers';

const MiDashboard = () => {
  const { 
    users, 
    loading, 
    error, 
    pagination, 
    createUser, 
    goToPage 
  } = useUsers();

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Dashboard de Usuarios</h1>
      
      <div>
        <h2>Estadísticas</h2>
        <p>Total usuarios: {pagination.totalItems}</p>
        <p>Usuarios activos: {users.filter(u => u.isActive).length}</p>
        <p>Administradores: {users.filter(u => u.role === 'admin').length}</p>
      </div>

      <div>
        <h2>Lista de Usuarios</h2>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{user.isActive ? 'Activo' : 'Inactivo'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2>Paginación</h2>
        <button 
          onClick={() => goToPage(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        >
          Anterior
        </button>
        
        <span>
          Página {pagination.currentPage} de {pagination.totalPages}
        </span>
        
        <button 
          onClick={() => goToPage(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default MiDashboard;
```

---

¡Con esta guía ya tienes todo lo necesario para visualizar usuarios usando React hooks y componentes! 🚀

**Recomendación:** Comienza con `react-users-dashboard.html` para ver cómo funciona, luego implementa los hooks y componentes en tu proyecto React.
