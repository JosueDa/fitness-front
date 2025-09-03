import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchUserData } from '../../api/userApi';
import './Stats.css';
import { fetchTrainingsByUser } from '../../api/trainingApi';
import type { User, Training } from '../../interfaces';
import { FaClock, FaTachometerAlt, FaArrowsAlt, FaAward } from 'react-icons/fa';
import { Button } from '@mui/material';
import { Exercise } from '../../interfaces/Exercise';
import { Zone } from '../../interfaces/Zone';
import { fetchAllExercises, fetchAllZones } from '../../api/exerciseApi';


interface TrainingListProps {
  userId?: number;
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
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
   const [isTrainingsOpen, setIsTrainingsOpen] = useState(false);
  const effectiveUserId = userId || user?.id;
  let mainStats : mainStats[] = [];
  let latestTrainings : trainigDateData[] = [];
  let lastWeekDates : Date[] = [];

  const today = new Date(); 
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0)
      lastWeekDates.unshift(date);
    }

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
        
        // Cargar ejercicios
        const exercisesResponse = await fetchAllExercises();
        setExercises(exercisesResponse);

        // Cargar zonas
        const zonesResponse = await fetchAllZones();
        setZones(zonesResponse);

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

  function mergeStringArraysInArray(arr: string[][]) {
    return arr.reduce((accumulator, currentArray) => {
        return accumulator.concat(currentArray);
    }, []);
  }
  
  function mergeNumberArraysInArray(arr: number[][]) {
    return arr.reduce((accumulator, currentArray) => {
        return accumulator.concat(currentArray);
    }, []);
  }

  function getMostRepeatedString(arr: string[]): string {
    if (arr.length === 0) {
      return '';
    }

    const frequencyMap: { [key: string]: number } = {};

    for (const str of arr) {
      frequencyMap[str] = (frequencyMap[str] || 0) + 1;
    }

    let mostFrequentString: string = '';
    let maxCount: number = 0;

    for (const str in frequencyMap) {
      if (frequencyMap[str] > maxCount) {
        maxCount = frequencyMap[str];
        mostFrequentString = str;
      }
    }

    return mostFrequentString;
  }

  if (trainings.length>0){
    // Saca la suma de todos los entrenamientos existentes
    let timesList : number [] = trainings.filter(i=>i.duration != undefined).map(i=>i.duration);
    let totalTime : number = 0;
    if(timesList.length>0){
      totalTime = timesList.reduce((sum, current) => sum + current, 0);
    }

    // Saca una lista de todas las intensidades registradas
    let intensity : string[] = trainings.filter(i=>i.intensity!=undefined).map(i=>i.intensity);

    // Saca una lista de todas las zonas de los ejercicios registrados
    let zonesLists = trainings.filter(i=>i.trainingexercise != undefined).map(i=> i.trainingexercise.map(i=>i.exercise?.zone?.name));
    let zones : string[] = [];
    if(zonesLists.length>0){
      zones = mergeStringArraysInArray(zonesLists);
    }else if(zonesLists.length == 1){
      zones = zonesLists[0];
    }

    // Saca la lista de todos los pesos cargados
    let weightLists = trainings.filter(i=>i.trainingexercise != undefined).map(i=> i.trainingexercise?.map(i=>i.weight));
    let weight: number [] = [];
    
    if(weightLists.length>0){
      weight = mergeNumberArraysInArray(weightLists);
    }else if(weightLists.length == 1){
      weight = weightLists[0];
    }

    mainStats = [
      {
        "Id" : 1,
        "Title" : "Tiempo Promedio",
        "Value" : totalTime > 0 ? `${Math.trunc(totalTime/timesList.length)} min` : '0 min',
        "Color" : "Tiempo",
      },
      {
        "Id" : 2,
        "Title" : "Intensidad Promedio",
        "Value" : intensity.length>0 ? getMostRepeatedString(intensity) : 'Sin datos',
        "Color" : "Intensidad",
      },
      {
        "Id" : 3,
        "Title" : "Zona Favorita",
        "Value" : zones.length>0 ? getMostRepeatedString(zones) : 'Sin datos',
        "Color" : "Zona",
      },
      {
        "Id" : 4,
        "Title" : "Mayor peso",
        "Value" : weight.length> 0 ? `${Math.max(...weight)} kg` : 'Sin datos',
        "Color" : "Peso",
      }
    ];

    latestTrainings = trainings.map(i=> new trainigDateData(i.id, new Date(i.date), i.intensity));
    latestTrainings.forEach(training=> training.Date.setHours(0,0,0,0));
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
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[1].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[1].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[2].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[2].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[3].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[3].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[4].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[4].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[5].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[5].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() == lastWeekDates[6].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() == lastWeekDates[6].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
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