import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FaRunning, FaDumbbell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-container">
            <Link to="/" className="app-title">FitTrack</Link>
            <p className="app-subtitle">Tu compañero de entrenamiento</p>
          </div>
          
          {user ? (
            <div className="user-info">
              <div className="user-dropdown">
                <span className="user-name">Hola, {user.name}</span>
                <div className="user-avatar">
                  <FaUser />
                </div>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    <FaUser className="dropdown-icon" /> Mi Perfil
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item">
                    <FaSignOutAlt className="dropdown-icon" /> Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="auth-actions">
              <Link to="/login" className="login-button">Iniciar sesión</Link>
              <Link to="/register" className="register-button">Registrarse</Link>
            </div>
          )}
        </div>
        
        {user && (
          <nav className="app-nav">
            <ul>
              <li className={isActive('/') ? 'active' : ''}>
                <Link to="/">
                  <FaRunning className="nav-icon" /> Inicio
                </Link>
              </li>
              <li className={isActive('/trainings') ? 'active' : ''}>
                <Link to="/trainings">
                  <FaDumbbell className="nav-icon" /> Entrenamientos
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;