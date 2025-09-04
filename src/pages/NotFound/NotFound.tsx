import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="not-found-container" style={{color: 'var(--primary-color)', textAlign: 'center'}}>
      <FaSearch className="delete-icon" style={{fontSize:'60pt'}}/>
      <h1>Encontraste un error 404</h1>
      <br></br>
      <p>¿Estás perdido?</p>
      <Link to="/" className="home-link">
        <u><big><b>Volver al inicio</b></big></u>
      </Link>
    </div>
  );
};

export default NotFoundPage;