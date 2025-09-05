import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import './Home.css';
import { Button } from '@mui/material';
import { FaDumbbell, FaUserFriends, FaChartBar } from 'react-icons/fa';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const features = [
    {
      "id" : 1,
      "name" : "Entrenamientos",
      "icon": "FaDumbbell",
      "url" : "trainings",
      "imageUrl" : "/trainings.jpg",
      "description" : "Accede a tu historial de entrenamientos para ver sus detalles o crea nuevas sesiones de entrenamiento",
    },
    {
      "id" : 2,
      "name" : "Amigos",
      "icon": "FaUserFriends",
      "url" : "friends",
      "imageUrl" : "/friends.jpg",
      "description" : "Acompaña el progreso de tus amigos y motívense a seguir entrenando",
    },
    {
      "id" : 3,
      "name" : "Estadísticas",
      "icon": "FaChalkboard",
      "url" : "stats",
      "imageUrl" : "/stats.jpg",
      "description" : "Analiza tu progreso de forma visual y toma decisiones de ajustes para tus entrenamientos",
    },
  ]
  return (
    <div className='home-page'>
      <div className="home-container">
        <div className="home-welcome">
          {user ? (
            <div className='home-welcome-title'>
              <h1>Bienvenido,</h1>
              <h1><b>{user.name}</b></h1>
            </div>
          ) : (<h1>Bienvenido a FitTrack</h1>)}
          
          {user ? (
            <p>Accede a las mejores herramientas para seguir progresando en tu vida fitness</p>
          ) : (
            <p>Inicia sesión para acceder a tu historial de entrenamientos</p>
          )}
        </div>
        <div className='feature-grid-container'>
          <div className="feature-grid">
              {features.map(feature => (
                <Link to={feature.url} key={feature.id} className="feature-home-card">
                  <div>
                    <div className="home-card-header">
                      <h3 className='feature-title'>
                        {(() => {
                          switch (feature.name) {
                            case 'Entrenamientos':
                              return <FaDumbbell className="feature-icon" />;
                            case 'Amigos':
                              return <FaUserFriends className="feature-icon" />;
                            case 'Estadísticas':
                              return <FaChartBar className="feature-icon" />;
                            default:
                              return null;
                          }
                        })()}
                        {feature.name}</h3>
                      <Button variant="outlined" color="primary" >Ir</Button>
                    </div>
                    <div className="home-card-body">
                      <div className="home-card-image">
                        <img src={feature.imageUrl} alt={feature.name}></img>
                      </div>
                      <div className='home-card-details'>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;