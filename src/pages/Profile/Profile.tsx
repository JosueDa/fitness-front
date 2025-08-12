import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import './Profile.css';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <div>Por favor inicia sesión</div>;
  }

  return (
    <div className="profile-container">
      <h1>Tu Perfil</h1>
      <div className="profile-info">
        <p><strong>Nombre:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <button onClick={logout} className="logout-button">
        Cerrar sesión
      </button>
    </div>
  );
};

export default ProfilePage;