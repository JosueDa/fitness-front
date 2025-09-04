import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { FaRunning, FaDumbbell, FaUser, FaSignOutAlt, FaHome, FaUserFriends, FaChartBar } from 'react-icons/fa';
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
          <div className="mobile-adjustment">
            <div className="user-avatar">
            </div>
          </div>

          <div className="logo-container">
            <Link to="/" className="app-title"><FaRunning /> FitTrack</Link>
            <p className="app-subtitle">Tu compañero de entrenamiento</p>
          </div>

          {!user &&(
            <div className="mobile-adjustment">
            <div className="user-avatar">
              </div>
            </div>
          )}
          
          {user && (
            <div className="user-info">
              <div className="user-dropdown">
                <span className="user-name">Hola, <b>{user.name}</b></span>
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
          )}
        </div>
        
        {user && (
          <nav className="app-nav">
            <ul>
              <li className={(isActive('/') ? 'active nav-home' : 'nav-home')}>
                <Link to="/">
                  <FaHome className="nav-icon" /> Inicio
                </Link>
              </li>
              <li className={isActive('/trainings') ? 'active' : ''}>
                <Link to="/trainings">
                  <FaDumbbell className="nav-icon" /> Entrenamientos
                </Link>
              </li>
              <li className={isActive('/friends') ? 'active' : ''}>
                <Link to="/friends">
                  <FaUserFriends className="nav-icon" /> Amigos
                </Link>
              </li>
              <li className={isActive('/stats') ? 'active' : ''}>
                <Link to="/stats">
                  <FaChartBar className="nav-icon" /> Stats
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