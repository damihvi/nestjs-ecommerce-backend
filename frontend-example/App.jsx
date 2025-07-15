import React from 'react';
import ReactDOM from 'react-dom/client';
import UsersList from './components/UsersList.jsx';
import './styles.css'; // Opcional: para estilos

// Componente principal de la aplicación
const App = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Dashboard Admin - Gestión de Usuarios</h1>
        <p>Sistema de administración de usuarios</p>
      </header>
      
      <main className="app-main">
        <UsersList />
      </main>
    </div>
  );
};

// Renderizar la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
