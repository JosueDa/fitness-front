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
import { LineChart, RadarChart, ScatterChart, SparkLineChart  } from '@mui/x-charts';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const name = (a:Exercise, b:Exercise)=> {
    if ( a.name < b.name ){
      return -1;
    }
    if ( a.name > b.name ){
      return 1;
    }
    return 0;
  };


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
  name: string;
  trainingExecises : TrainingExercise[];
  repsMean : number;
  weightMean : number;
  maxWeight : number;
  scatterData : ScatterData[];
  repsLineData : LineData[];
  repsFullLineData : FullLineData[];
  weightLineData : LineData[];
  weightFullLineData : FullLineData[];

  constructor(name: string, trainingExecises: TrainingExercise[], repsMean : number, weightMean : number, maxWeight : number, scatterData : ScatterData[], repsLineData : LineData[], repsFullLineData : FullLineData[], weightLineData : LineData[], weightFullLineData : FullLineData[]){
    this.name = name;
    this.trainingExecises = trainingExecises;
    this.repsMean = repsMean;
    this.weightMean = weightMean;
    this.maxWeight = maxWeight;
    this.scatterData = scatterData;
    this.repsLineData = repsLineData;
    this.repsFullLineData = repsFullLineData;
    this.weightLineData = weightLineData;
    this.weightFullLineData = weightFullLineData;
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

class FullLineData{
  data: (number | null)[];
  range?: number[];
  showMark: boolean;

  constructor(data: (number | null)[], range? : number[]){
    this.data = data;
    this.range = range;
    this.showMark = false;
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

interface zonesRadarData {
  name: string;
  times: number;
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
  let intensityRadarData: number[] = [];
  let zonesRadarData: zonesRadarData[] = [];
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
    let exercisesList : TrainingExercise[][] = trainings.sort((a, b) => a.id - b.id).map(i=>i.trainingexercise.sort((a, b) => a.id - b.id).filter(o=>o.exercise.id === exercise.id));
    exercisesList = exercisesList.filter(i=>i.length>0);
    // scatterData
    let exercises = exercisesList.reduce((accumulator, currentArray) => {
        return accumulator.concat(currentArray);
    }, []);
    let scatterData = exercises.map(i=> new ScatterData(i.reps, i.weight, i.id));

    // Reps LineData
    let repsLineList = exercisesList.map(i=>i.map(o=>o.reps));
    let repsLineData : LineData[] = [];
    let range: number = 0;
    repsLineList.forEach((serie) =>{
      range = range > serie.length ? range : serie.length;
      repsLineData.push(new LineData(serie));
    })
    repsLineData.forEach(i=>i.range = createIncreasingNumberArray(range));
    
    
    // Weight LineData
    let weightLineList = exercisesList.map(i=>i.map(o=>o.weight));
    let weightLineData : LineData[] = [];
    weightLineList.forEach((serie) =>{
      range = range > serie.length ? range : serie.length;
      weightLineData.push(new LineData(serie));
    })
    weightLineData.forEach(i=>i.range = createIncreasingNumberArray(range));

    // Reps Full Line Data
    let fullLineRecords : number = 15;
    let repsFullLineList : (number | null)[][] = exercisesList.length >= fullLineRecords ? exercisesList.slice(exercisesList.length-fullLineRecords).map(i=>i.map(o=>o.reps)) : exercisesList.map(i=>i.map(o=>o.reps));
    let repsFullLineData : FullLineData[] = [];
    let repsFullLineWholeData : (number | null)[][] = [];
    if(repsFullLineList.length>0){
      repsFullLineList.forEach((serie) =>{
        repsFullLineWholeData.push(serie.concat(null));
      })
      repsFullLineData.push(new FullLineData(repsFullLineWholeData.flat()));
      repsFullLineData.forEach(i=>i.range = createIncreasingNumberArray(repsFullLineData[0].data.length));
    }
    
    // Weight Full Line Data
    let weightFullLineList : (number | null)[][] = exercisesList.length >= fullLineRecords ? exercisesList.slice(exercisesList.length-fullLineRecords).map(i=>i.map(o=>o.weight)) : exercisesList.map(i=>i.map(o=>o.weight));
    let weightFullLineData : FullLineData[] = [];
    let weightFullLineWholeData : (number | null)[][] = [];
    if(weightFullLineList.length>0){
      weightFullLineList.forEach((serie) =>{
        weightFullLineWholeData.push(serie.concat(null));
      })
      weightFullLineData.push(new FullLineData(weightFullLineWholeData.flat()));
      weightFullLineData.forEach(i=>i.range = createIncreasingNumberArray(weightFullLineData[0].data.length));
    }

    // Basic data
    let repsMean = parseFloat((exercises.map(i=>i.reps).reduce((sum, current) => sum + current, 0)/exercises.length).toFixed(1));
    let weightMean = parseFloat((exercises.map(i=>i.weight).reduce((sum, current) => sum + current, 0)/exercises.length).toFixed(1));
    let maxWeight = Math.max(...exercises.map(i=>i.weight));
    
    setViewingExerciseDetails(new ExerciseDetails(exercise.name, exercises, repsMean, weightMean, maxWeight, scatterData, repsLineData, repsFullLineData, weightLineData, weightFullLineData));
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
    let timesList : number [] = trainings.filter(i=>i.duration !== undefined).map(i=>i.duration);
    let totalTime : number = 0;
    if(timesList.length>0){
      totalTime = timesList.reduce((sum, current) => sum + current, 0);
    }

    // Saca una lista de todas las intensidades registradas
    let intensity : string[] = trainings.filter(i=>i.intensity!==undefined).map(i=>i.intensity);
    if(intensity.length>0){
      intensityRadarData[0] = 100*(intensity.filter(i=>i == 'Alta').length/intensity.length);
      intensityRadarData[1] = 100*(intensity.filter(i=>i == 'Media').length/intensity.length);
      intensityRadarData[2] = 100*(intensity.filter(i=>i == 'Baja').length/intensity.length);
    }else{
      intensityRadarData = [0,0,0]
    }
    

    // Saca una lista de todas las zonas de los ejercicios registrados
    let zonesLists = trainings.filter(i=>i.trainingexercise !== undefined).map(i=> i.trainingexercise.map(i=>i.exercise?.zone?.name));
    let zones : string[] = [];
    if(zonesLists.length>0){
      zones = mergeStringArraysInArray(zonesLists);
      for (let i = 0; i < zonesAll.length; i++) {
        zonesRadarData[i] = { name: zonesAll[i].name, times: 100*(zones.filter(o=>o == zonesAll[i].name).length/zones.length)}
      }
    }else if(zonesLists.length === 1){
      zones = zonesLists[0];
      for (let i = 0; i < zonesAll.length; i++) {
        zonesRadarData[i] = { name: zonesAll[i].name, times: 0}
      }
    }

    // Saca la lista de todos los pesos cargados
    let weightLists = trainings.filter(i=>i.trainingexercise !== undefined).map(i=> i.trainingexercise?.map(i=>i.weight));
    let weight: number [] = [];
    
    if(weightLists.length>0){
      weight = mergeNumberArraysInArray(weightLists);
    }else if(weightLists.length === 1){
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
    zonesWithExercise = zonesAll.map(i=>new ZoneWithExercise(i.id, i.name, exercisesAll.sort(name).filter(o=>o.zoneId === i.id)))
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
                                {latestTrainings.find(i => i.Date.getTime() === lastWeekDates[0].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() === lastWeekDates[0].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() === lastWeekDates[1].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() === lastWeekDates[1].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() === lastWeekDates[2].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() === lastWeekDates[2].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() === lastWeekDates[3].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() === lastWeekDates[3].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() === lastWeekDates[4].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() === lastWeekDates[4].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() === lastWeekDates[5].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() === lastWeekDates[5].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
                                ): (
                                  <p className='calendar-table-effort none'><b>◦</b></p>
                                )}
                              </td> 
                              <td>
                                {latestTrainings.find(i => i.Date.getTime() === lastWeekDates[6].getTime()) ? (
                                  <p className={`calendar-table-effort ${latestTrainings.find(i => i.Date.getTime() === lastWeekDates[6].getTime())?.Intensity.toLowerCase()}`}><b>•</b></p>
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
          <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <div className='radar-grid'>
              <div className='radar-card triangle'>
                <div className='radar-title-container blue'>
                  <h3>Distribución de intensidad</h3>
                </div>
                <div className='radar-chart-container'>
                  <RadarChart
                    className='radar-chart'
                    series={[{ label: 'Distribución de intensidad', data: intensityRadarData, valueFormatter: (value) => `${value.toFixed(2)} %`, fillArea: true,}]}
                    colors = {['#3084d7']}
                    radar={{
                      max: Math.max(...intensityRadarData),
                      metrics: ['Alta', 'Media', 'Baja'],
                    }}
                    height={300}
                    margin={{
                      bottom: 0,
                    }}
                    sx={{
                      '.MuiChartsLegend-label, .MuiChartsAxis-tickLabel': {
                        fontSize: '14pt',
                        fontWeight: 'bold',
                      },
                      '.MuiChartsLegend-root': {
                        display: 'none',
                      },
                    }}
                  />
                </div>
              </div>
              <div className='radar-card'>
                <div className='radar-title-container green'>
                  <h3>Distribución de zonas</h3>
                </div>
                <RadarChart
                  height={300}
                  series={[{ label: 'Distribución muscular', data: zonesRadarData.map(i=>i.times), valueFormatter: (value) => `${value.toFixed(2)} %`, fillArea: true, }]}
                  colors = {['#4caf50']}
                  radar={{
                    max: Math.max(...zonesRadarData.map(i=>i.times)),
                    metrics: zonesRadarData.map(i=>i.name),
                  }}
                  sx={{
                    '.MuiChartsLegend-label, .MuiChartsAxis-tickLabel': {
                      fontSize: '14pt',
                      fontWeight: 'bold',
                    },
                    '.MuiChartsLegend-root': {
                      display: 'none',
                    },
                  }}
                />
              </div>
            </div>
          </ThemeProvider>
          <Button variant="outlined" color="primary" className='training-collapse-button' style={{backgroundColor: 'white'}} onClick={toggleCollapse}>
            <b>{isTrainingsOpen ? 'Estadísticas por ejercicio -' : 'Estadísticas por ejercicio +'}</b>
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
              <h3 className='stats-by-training-title'>{viewingExerciseDetails.name}</h3>
            </div>
            {viewingExerciseDetails.repsMean > 0 ? (
              <div className="card-body" style={{maxHeight:"60vh", overflowY: 'scroll'}}>
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
                <ThemeProvider theme={darkTheme}>
                  <CssBaseline />
                  <div className='chart-card'>
                    <div className='chart-title-container red'>
                      <h4>Comportamiento histórico<br></br>de repeticiones por serie</h4>
                    </div>
                    <LineChart
                      series={viewingExerciseDetails.repsFullLineData.map(key => ({
                        data: key.data,
                        color: '#e91e63',
                        valueFormatter: (value) => value != null? `${value} reps` : '',
                        showMark: false,
                      }))}
                      xAxis={[{ tickLabelStyle: { display: 'none' }, data: viewingExerciseDetails.repsFullLineData.length>0? viewingExerciseDetails.repsFullLineData[0].range : [0], scaleType: 'band', valueFormatter: (value: number) => 'Repeticiones', }]}
                      height={150}
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
                    <div className='chart-footer-container'>
                      <p>*Datos de las últimas 15 series</p>
                    </div>
                  </div>
                  <div className='chart-card'>
                    <div className='chart-title-container orange'>
                      <h4>Comportamiento histórico<br></br>de peso por serie</h4>
                    </div>
                    <LineChart
                      series={viewingExerciseDetails.weightFullLineData.map(key => ({
                        data: key.data,
                        color: '#ff9800',
                        valueFormatter: (value) => value != null? `${value} kg` : '',
                        showMark: false,
                      }))}
                      xAxis={[{ tickLabelStyle: { display: 'none' }, data: viewingExerciseDetails.weightFullLineData.length>0? viewingExerciseDetails.weightFullLineData[0].range : [0], scaleType: 'band', valueFormatter: (value: number) => 'Peso (kg)', }]}
                      height={150}
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
                    <div className='chart-footer-container'>
                      <p>*Datos de las últimas 15 series</p>
                    </div>
                  </div>
                  <div className='chart-card'>
                    <div className='chart-title-container blue'>
                      <h4>Repeticiones en series</h4>
                    </div>
                    <LineChart
                      series={viewingExerciseDetails.repsLineData.map(key => ({
                        data: key.data,
                        valueFormatter: (value) => value != null? `${value} reps` : '',
                      }))}
                      xAxis={[{ data: viewingExerciseDetails.repsLineData.length>0? viewingExerciseDetails.repsLineData[0].range : [0], scaleType: 'band' }]}
                      height={150}
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
                    <div className='chart-title-container green'>
                      <h4>Peso en series</h4>
                    </div>
                    <LineChart
                      series={viewingExerciseDetails.weightLineData.map(key => ({
                        data: key.data,
                        valueFormatter: (value) => value != null? `${value} kg` : '',
                      }))}
                      xAxis={[{ data: viewingExerciseDetails.weightLineData.length>0? viewingExerciseDetails.weightLineData[0].range : [0], scaleType: 'band' }]}
                      height={150}
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
                    <div className='chart-title-container gray'>
                      <h4>Relación repeticiones - peso</h4>
                    </div>
                    <ScatterChart
                      series={[
                        {
                          data: viewingExerciseDetails.scatterData,
                          valueFormatter: (value) => value && `${value.x} reps de ${value.y} kg`,
                        }]}
                      xAxis={[
                        { 
                          min: Math.min(...viewingExerciseDetails.scatterData.map(i=>i.x))-1, 
                          max: Math.max(...viewingExerciseDetails.scatterData.map(i=>i.x))+1,
                          scaleType: 'linear',
                          colorMap: {
                            type: 'continuous',
                            min: Math.min(...viewingExerciseDetails.scatterData.map(i=>i.x)),
                            max: Math.max(...viewingExerciseDetails.scatterData.map(i=>i.x)),
                            color: ['green', 'orange']
                          }
                        }]}
                      yAxis={[
                        { 
                          min: Math.min(...viewingExerciseDetails.scatterData.map(i=>i.y))-1, 
                          max: Math.max(...viewingExerciseDetails.scatterData.map(i=>i.y))+1 
                        }]}
                      height={150}
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
                </ThemeProvider>
              </div>
            ):(
              <div style={{textAlign: 'center', color:'#333333', marginTop:'1rem'}}>
                <p><b>No hay registros de que hayas realizado este ejercicio</b></p>
                <br></br>
                <p>Ve a probarlo y vuelve después para ver tus estadísticas</p>
              </div>
            )}
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