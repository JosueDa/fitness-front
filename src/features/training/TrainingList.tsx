import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { Training, User, fetchTrainingsByUser, fetchUserData } from '../../api/Api';
import './TrainingList.css';

interface TrainingListProps {
  userId?: number;
}

const TrainingList: React.FC<TrainingListProps> = ({ userId }) => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);

  const effectiveUserId = userId || user?.id;

  useEffect(() => {
    if (!effectiveUserId) return;

    const loadData = async () => {
      try {
        // Cargar datos del usuario
        const userResponse = await fetchUserData(effectiveUserId);
        setUserData(userResponse);
        
        // Cargar entrenamientos
        const trainingResponse = await fetchTrainingsByUser(effectiveUserId);
        setTrainings(trainingResponse);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [effectiveUserId]);

  if (!user) {
    return (
      <div className="training-list">
        <div className="auth-required">
          <h2>Acceso requerido</h2>
          <p>Por favor inicia sesión para ver tus entrenamientos</p>
          <Link to="/login" className="auth-button">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="training-list">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando tus entrenamientos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="training-list">
      <div className="error-message">
        <h2>Error al cargar los datos</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="training-list">
      <div className="training-header">
        <h2>Entrenamientos de {userData?.name || 'Usuario'}</h2>
        <Link to="/training/new" className="add-button">
          + Añadir entrenamiento
        </Link>
      </div>
      
      {trainings.length === 0 ? (
        <div className="empty-state">
          <p>No hay entrenamientos registrados</p>
          <Link to="/training/new" className="add-button">
            Crear mi primer entrenamiento
          </Link>
        </div>
      ) : (
        <div className="training-grid">
          {trainings.map(training => (
            <div key={training.id} className="training-card">
              <div className="card-header">
                <h3>{training.activity_type}</h3>
                <span className={`intensity ${training.intensity.toLowerCase()}`}>
                  {training.intensity}
                </span>
              </div>
              
              <div className="card-body">
                <p><strong>Duración:</strong> {training.duration} minutos</p>
                <p><strong>Fecha:</strong>{new Date(training.date).toLocaleDateString()}</p>
                
                {training.note && (
                  <div className="notes">
                    <strong>Notas:</strong>
                    <p>{training.note}</p>
                  </div>
                )}
              </div>
              
              <div className="card-footer">
                <Link 
                  to={`/training/${training.id}/edit`} 
                  className="edit-button"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrainingList;