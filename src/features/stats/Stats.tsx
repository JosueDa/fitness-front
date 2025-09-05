import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchUserData } from '../../api/userApi';
import './Stats.css';
import { fetchTrainingsByUser } from '../../api/trainingApi';
import type { User, Training, TrainingExercise } from '../../interfaces';
import { FaClock, FaTachometerAlt, FaArrowsAlt, FaAward, FaChartBar } from 'react-icons/fa';
import { Box, Button, Modal } from '@mui/material';
import { Exercise } from '../../interfaces/Exercise';
import { Zone } from '../../interfaces/Zone';
import { fetchAllExercises, fetchAllZones } from '../../api/exerciseApi';
import { LineChart, ScatterChart  } from '@mui/x-charts';


interface StatsProps {
  userId?: number;
}

interface mainStats {
  Id: Number;
  Title: String;
  Value: String;
  Color: String;
}

class ExerciseDetails{
  zone: string;
  trainingExecises : TrainingExercise[];
  repsMean : number;
  weightMean : number;
  maxWeight : number;
  scatterData : ScatterData[];
  lineData : LineData[];

  constructor(zone: string, trainingExecises: TrainingExercise[], repsMean : number, weightMean : number, maxWeight : number, scatterData : ScatterData[], lineData : LineData[]){
    this.zone = zone;
    this.trainingExecises = trainingExecises;
    this.repsMean = repsMean;
    this.weightMean = weightMean;
    this.maxWeight = maxWeight;
    this.scatterData = scatterData;
    this.lineData = lineData;
  }
}

class ScatterData{
  x: number;
  y: number;
  id: number;

  constructor(x: number, y: number, id: number){
    this.x = x;
    this.y = y;
    this.id = id;
  }
}

class LineData{
  data: number[];
  range?: number[];

  constructor(data: number[], range? : number[]){
    this.data = data;
    this.range = range;
  }
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

class ZoneWithExercise {
  Id: number;
  Name: String;
  Exercises : Exercise[];

  constructor(Id: number, Name: string, Exercises : Exercise[]){
    this.Id = Id;
    this.Name = Name;
    this.Exercises = Exercises;
  }
}

const Stats: React.FC<StatsProps> = ({ userId }) => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [exercisesAll, setExercises] = useState<Exercise[]>([]);
  const [zonesAll, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isTrainingsOpen, setIsTrainingsOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [viewingExerciseDetails, setViewingExerciseDetails] = useState<ExerciseDetails>();
  const effectiveUserId = userId || user?.id;
  let mainStats : mainStats[] = [];
  let zonesWithExercise : ZoneWithExercise[] = [];

  let latestTrainings : trainigDateData[] = [];
  let lastWeekDates : Date[] = [];

  const today = new Date(); 
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    date.setHours(0, 0, 0, 0)
    lastWeekDates.unshift(date);
  }

  const handleOpen = (exercise: Exercise) => {
    let exercisesList : TrainingExercise[][] = trainings.sort((a, b) => a.id - b.id).map(i=>i.trainingexercise.sort((a, b) => a.id - b.id).filter(o=>o.exercise.id == exercise.id));
    exercisesList = exercisesList.filter(i=>i.length>0);
    // scatterData
    let exercises = exercisesList.reduce((accumulator, currentArray) => {
        return accumulator.concat(currentArray);
    }, []);
    let scatterData = exercises.map(i=> new ScatterData(i.reps, i.weight, i.id));

    // LineData
    let lineList = exercisesList.map(i=>i.map(o=>o.reps));
    let lineData : LineData[] = [];
    let range: number = 0;
    lineList.forEach((serie) =>{
      range = range > serie.length ? range : serie.length;
      lineData.push(new LineData(serie));
    })
    lineData.forEach(i=>i.range = createIncreasingNumberArray(range));

    // Basic data
    let repsMean = parseFloat((exercises.map(i=>i.reps).reduce((sum, current) => sum + current, 0)/exercises.length).toFixed(1));
    let weightMean = parseFloat((exercises.map(i=>i.weight).reduce((sum, current) => sum + current, 0)/exercises.length).toFixed(1));
    let maxWeight = Math.max(...exercises.map(i=>i.weight));
    
    setViewingExerciseDetails(new ExerciseDetails(exercise.name, exercises, repsMean, weightMean, maxWeight, scatterData, lineData));
    setIsDetailsOpen(true);
  };
  const handleClose = () => setIsDetailsOpen(false);

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

  function createIncreasingNumberArray(length: number): number[] {
  return Array.from({ length }, (_, i) => i + 1);
}

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
    // Para los main stats
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

    // Para las gráficas de esfuerzo semanal
    latestTrainings = trainings.map(i=> new trainigDateData(i.id, new Date(i.date), i.intensity));
    latestTrainings.forEach(training=> training.Date.setHours(0,0,0,0));

    // Para las estadísticas por ejercicio
    zonesWithExercise = zonesAll.map(i=>new ZoneWithExercise(i.id, i.name, exercisesAll.filter(o=>o.zoneId == i.id)))
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
              zonesWithExercise.map(zone => (
              <div key={zone.Id} className="stats-by-training-card">
                <div className="card-header">
                  <h3 className='stats-by-training-title'>{zone.Name}</h3>
                  <span className={`intensity`}>
                    <b>{zone.Exercises.length} ejercicios</b>
                  </span>
                </div>
                <div className="card-body">
                  {zone.Exercises.map(exercise => (
                    <div key={exercise.id} className='card-details'>
                      <div className='card-details-name'>
                        <p><strong>{exercise.name}</strong></p>
                      </div>
                      <Link
                        to="#"
                        className="edit-button"
                        onClick={e => {
                          e.preventDefault();
                          handleOpen(exercise);
                        }}>
                        <FaChartBar className="feature-icon"/>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )))}
          </div>
        </div>
      )}
      <Modal
        open={isDetailsOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {viewingExerciseDetails? (
          <Box className="modal-box">
            <div className="card-header">
              <h3 className='stats-by-training-title'>{viewingExerciseDetails.zone}</h3>
            </div>
            <div className="card-body">
              <div className='exercise-main-stats'>
                <div className='exercise-main-stat'>
                  <p>Promedio de repeticiones:</p>
                  <p><b>{viewingExerciseDetails.repsMean>=0 ? viewingExerciseDetails.repsMean : 'Sin datos'}</b></p>
                </div>
                <div className='exercise-main-stat'>
                  <p>Promedio de peso:</p>
                  <p><b>{viewingExerciseDetails.weightMean>=0 ? `${viewingExerciseDetails.weightMean} kg` : 'Sin datos'}</b></p>
                </div>
                <div className='exercise-main-stat'>
                  <p>Máximo peso:</p>
                  <p><b>{viewingExerciseDetails.maxWeight>=0 ? `${viewingExerciseDetails.maxWeight} kg` : 'Sin datos'}</b></p>
                </div>
              </div>
              <div className='chart-card'>
                <h4>Repeticiones al avanzar en series</h4>
                <LineChart
                  series={viewingExerciseDetails.lineData}
                  xAxis={[{ data: viewingExerciseDetails.lineData.length>0? viewingExerciseDetails.lineData[0].range : [0], scaleType: 'band' }]}
                  height={200}
                  grid={{ vertical: true, horizontal: true }}
                  margin={{
                      left: 0,
                      right: 10,
                      top: 10, 
                      bottom: 0,
                  }}
                  localeText={{
                    noData: 'Sin datos.',
                  }}
                />
              </div>
              <div className='chart-card'>
                <h4>Relación repeticiones - peso</h4>
                <ScatterChart
                  series={[
                    {
                      data: viewingExerciseDetails.scatterData,
                      valueFormatter: (value) => value && `${value.x} reps de ${value.y} kg`,
                      color: '#4caf50'
                    }]}
                  xAxis={[
                    { 
                      min: Math.min(...viewingExerciseDetails.scatterData.map(i=>i.x))-1, 
                      max: Math.max(...viewingExerciseDetails.scatterData.map(i=>i.x))+1,
                      scaleType: 'linear',
                      
                    }]}
                  yAxis={[
                    { 
                      min: Math.min(...viewingExerciseDetails.scatterData.map(i=>i.y))-1, 
                      max: Math.max(...viewingExerciseDetails.scatterData.map(i=>i.y))+1 
                    }]}
                  height={200}
                  grid={{ vertical: true, horizontal: true }}
                  margin={{
                      left: 0,
                      right: 10,
                      top: 10, 
                      bottom: 0,
                  }}
                  localeText={{
                    noData: 'Sin datos.',
                  }}
                />
              </div>
            </div>
          </Box>
        ):(
        <Box className="modal-box">
          <p>Aun no realizas este ejercicio durante tus entrenamientos. Prébalo durante tu próxima sesión de entrenamiento y vuelve aquí para ver tus estadísticas.</p>
          </Box>)}
      </Modal>
    </div >
  );
};


export default Stats;