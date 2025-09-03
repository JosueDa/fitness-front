import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchUserData } from '../../api/userApi';
import './Stats.css';
import { fetchTrainingsByUser } from '../../api/trainingApi';
import type { User, Training } from '../../interfaces';
import { FaClock, FaTachometerAlt, FaArrowsAlt, FaAward } from 'react-icons/fa';
import { Button } from '@mui/material';


interface TrainingListProps {
  userId?: number;
}

interface intensityPositions {
  Alta: number;
  Media: number;
  Baja: number;
}

interface mainStats {
  Id: Number;
  Title: String;
  Value: String;
  Color: String;
}

class trainigDateData {
  Id: number;
  Date: Date;
  Intensity: String;

  constructor(Id: number, Date: Date, Intensity: String) {
    this.Id = Id;
    this.Date = Date;
    this.Intensity = Intensity;
  }
}

const TrainingList: React.FC<TrainingListProps> = ({ userId }) => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
   const [isTrainingsOpen, setIsTrainingsOpen] = useState(false);
  const effectiveUserId = userId || user?.id;
  let mainStats : mainStats[] = [];
  let latestTrainings : trainigDateData[] = [];
  let lastWeekDates : Date[] = [];

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

  const toggleCollapse = () => {
    setIsTrainingsOpen(!isTrainingsOpen);
  };

  if (!user) {
    return (
      <div className="stats-list">
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
    <div className="stats-list">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando tus estadísticas...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="stats-list">
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

  function meanIntensity(intensityList: String[]) : String{
    var intensityPositions : intensityPositions = {
      "Alta" : 0,
      "Media" : 1,
      "Baja" : 2
    }

    let intensityRepeat : number[] = [0,0,0];

    intensityList.forEach((item) => {
      intensityRepeat[eval(`intensityPositions.${item}`)] ++;
    });

    let maxValue = Math.max(...intensityRepeat);
    let Index: number = intensityRepeat.findIndex(
        (number: number) => number == maxValue
    );
    
    return Object.keys(intensityPositions).find(key => eval(`intensityPositions['${key}']`) === Index)??'Baja';
  }

  if (trainings.length > 0){
    let totalTime = trainings.map(i=>i.duration).reduce((sum, current) => sum + current, 0);
    let intensityList = trainings.map(i=>i.intensity);
    let intensityName : String = meanIntensity(intensityList);
    mainStats = [
      {
        "Id" : 1,
        "Title" : "Tiempo Promedio",
        "Value" : `${Math.trunc(totalTime/trainings.length)} minutos`,
        "Color" : "Tiempo",
      },
      {
        "Id" : 2,
        "Title" : "Intensidad Promedio",
        "Value" : intensityName,
        "Color" : "Intensidad",
      },
      {
        "Id" : 3,
        "Title" : "Zona Favorita",
        "Value" : "Pierna",
        "Color" : "Zona",
      },
      {
        "Id" : 4,
        "Title" : "Mayor peso",
        "Value" : "100 kg",
        "Color" : "Peso",
      }
    ];

    latestTrainings = trainings.map(i=> new trainigDateData(i.id, new Date(i.date), i.intensity));
    latestTrainings.forEach(training=> training.Date.setHours(0,0,0,0));

    const today = new Date(); 
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0)
      lastWeekDates.unshift(date);
    }
  }

  return (
    <div className="stats-list">
      <div className="stats-header">
        <h2 className='stats-header-title-desktop'>Estadísticas de <b>{userData?.name || 'Usuario'}</b></h2>
        <h2 className='stats-header-title-mobile'>Estadísticas de <br/><b>{userData?.name || 'Usuario'}</b></h2>
      </div>

      {trainings.length === 0 ? (
        <div className="empty-state">
          <p>No hay entrenamientos registrados</p>
        </div>
      ) : (
        <div>
          <div className="stats-grid">
            {mainStats.map(stat => (
              <div key={`stat_${stat.Id.toString()}`} style={{marginTop:'-1rem'}}>
                {(() => {
                  switch (stat.Color) {
                    case 'Tiempo':
                      return <FaClock className="stats-icon" />;
                    case 'Intensidad':
                      return <FaTachometerAlt className="stats-icon" />;
                    case 'Zona':
                      return <FaArrowsAlt className="stats-icon" />;
                    case 'Peso':
                      return <FaAward className="stats-icon" />;
                    default:
                      return null;
                  }
                })()}
                <h4 className='stats-title'>{stat.Title}</h4>
                <div className={`stats-card ${stat.Color}`}>
                  <div className="stats-card-body">
                    <div className='stats-card-details'>
                      <h2>{stat.Value}</h2>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className='calendar-container'>
            <div className='calendar-card'>
              <div className='calendar-card-header'>
                <h4 className='calendar-card-title'>Entrenamientos de la semana por intensidad</h4>
              </div>
              <div className='calendar-card-body'>
                <div className="calendar-table" role="region">
                  <table>
                      <tbody>
                          <tr>
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[0].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[0].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>•</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[1].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[1].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[2].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[2].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[3].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[3].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[4].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[4].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[5].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[5].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[6].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[6].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p></p>
                                )}
                              </td> 
                          </tr>
                          <tr>
                              <th>{lastWeekDates[0].toLocaleDateString('es-MX', { weekday: 'narrow' })}</th>
                              <th>{lastWeekDates[1].toLocaleDateString('es-MX', { weekday: 'narrow' })}</th>
                              <th>{lastWeekDates[2].toLocaleDateString('es-MX', { weekday: 'narrow' })}</th>
                              <th>{lastWeekDates[3].toLocaleDateString('es-MX', { weekday: 'narrow' })}</th>
                              <th>{lastWeekDates[4].toLocaleDateString('es-MX', { weekday: 'narrow' })}</th>
                              <th>{lastWeekDates[5].toLocaleDateString('es-MX', { weekday: 'narrow' })}</th>
                              <th><span style={{backgroundColor: '#d32f2f', borderRadius: '1rem'}}>&nbsp;{lastWeekDates[6].toLocaleDateString('es-MX', { weekday: 'narrow' })}&nbsp;</span></th>
                          </tr>
                      </tbody>
                  </table>
                  </div>
              </div>
            </div>
          </div>
          <Button variant="outlined" color="primary" className='training-collapse-button' style={{backgroundColor: 'white'}} onClick={toggleCollapse}>
            <b>{isTrainingsOpen ? 'Estadísticas de entrenamientos -' : 'Estadísticas de entrenamientos +'}</b>
          </Button>
          <div className="stats-by-training-grid">
            {isTrainingsOpen && (  
              trainings.map(training => (
              <div key={training.id} className="stats-by-training-card">
                <div className="card-header">
                  <h3 className='stats-by-training-title'>{training.activity_type}</h3>
                  <span className={`intensity ${training.intensity.toLowerCase()}`}>
                    <b>{training.intensity}</b>
                  </span>
                </div>
                <div className="card-body">
                  <div className='card-details'>
                    <p><strong>Duración:</strong> {training.duration} minutos</p>
                    <p><strong>{new Date(training.date).toLocaleDateString()}</strong></p>
                  </div>
                </div>
              </div>
            )))}
          </div>
        </div>
      )}
    </div >
  );
};


export default TrainingList;