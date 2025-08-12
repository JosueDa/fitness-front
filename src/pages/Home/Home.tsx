import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import './Home.css';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <h1>Bienvenido {user ? user.name : 'a FitTrack'}</h1>
      {user ? (
        <p>Tu plan de entrenamiento personalizado está listo</p>
      ) : (
        <p>Inicia sesión para acceder a tu plan de entrenamiento</p>
      )}
    </div>
  );
};

export default HomePage;