import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchUserData } from '../../api/userApi';
import './TrainingList.css';
import { Box, Button, InputLabel, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import { addTrainingPhoto, deleteExerciseTraining, deleteTraining, deleteTrainingPhoto, fetchTrainingsByUser, getExerciseTraining, getPhotoTraining, saveExerciseTraining, saveTraining, updateExerciseTraining, updateTraining } from '../../api/trainingApi';
import { FaPen, FaTrash } from 'react-icons/fa';
import type { User, Training, Exercise, Zone, ExerciseDB } from '../../interfaces';
import { fetchAllExercises, fetchAllZones, fetchExercisesByZone } from '../../api/exerciseApi';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { fileToBase64 } from '../../Utilities/FileToBase64';
import { TrainingPhoto } from '../../interfaces/TrainingPhoto';

interface TrainingListProps {
  userId?: number;
}

const TrainingList: React.FC<TrainingListProps> = ({ userId }) => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exercisesTraining, setExercisesTraining] = useState<ExerciseDB[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [open, setOpen] = React.useState(false);
  const [openExercice, setOpenExercice] = React.useState(false);
  const effectiveUserId = userId || user?.id;
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [updateImage, setUpdateImage] = useState(false);
  const [newTraining, setNewTraining] = useState<Training>({
    id: 0,
    name: '',
    activity_type: '',
    duration: 0,
    intensity: '',
    date: new Date().toISOString(),
    note: '',
    userId: 0,
    trainingexercise: [],
  });

  const [newExercise, setNewExercise] = useState<ExerciseDB>({
    trainingExerciseId: 0,
    zoneId: 0,
    trainingId: 0,
    exerciseId: 0,
    repetition: 0,
    weight: 0
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);


  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target;
    setNewTraining(prev => ({
      ...prev,
      [name]: type === 'number' ? ((value.charCode >= 48 && value.charCode <= 5 || value == '' || value.includes('.')) ? '' : Math.trunc(value)) : value,
    }));
  };

  const handleInputChangeExercice = (e: any) => {
    const { name, value } = e.target;

    setNewExercise(prev => ({
      ...prev,
      [name as string]: typeof value === 'number' ? value : isNaN(Number(value)) ? value : Number(value),
    }));

    if (name === 'zoneId') {
      setNewExercise(prev => ({
        ...prev,
        zone: zones.find(z => z.id === Number(value))?.name || ''
      }));
    }

    if (name === 'exerciseId') {
      setNewExercise(prev => ({
        ...prev,
        exercise: exercises.find(z => z.id === Number(value))?.name || ''
      }));
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (editingTraining) {
      // Actualizar
      if (updateImage) {
        await deleteTrainingPhoto(newTraining.trainingPhoto?.id || 0);
        addTrainingPhoto(newTraining.id, selectedImage ? await fileToBase64(selectedImage) : '');
      }

      const updated = await updateTraining(newTraining);

      setTrainings(trainings.map(t => t.id === updated.id ? updated : t));
    } else {
      // Crear
      const saved = await saveTraining(user.id, newTraining);

      if (updateImage)
      {
        const trainingPhoto = await addTrainingPhoto(saved.id, selectedImage ? await fileToBase64(selectedImage) : '');
        saved.trainingPhoto = trainingPhoto;
      }

      setTrainings([...trainings, saved]);
    }
    handleClose();
  };

  const handleDelete = async (trainingId: number) => {
    if (!user?.id) return;
    if (window.confirm('¿Estás seguro que quieres borrar esta sesión de entrenamiento?')) {
      await deleteTraining(trainingId);
      setTrainings(trainings.filter(i => i.id != trainingId));
    }
  };

  const handleOpen = (training?: Training) => {
    setSelectedImage(null);
    setPreviewBase64(null);
    setUpdateImage(false);
    if (training) {
      setNewTraining(training);
      setEditingTraining(training);
      if (training.trainingPhoto) {
        setPreviewBase64(training.trainingPhoto.url);
      }
    } else {
      setNewTraining({
        id: 0,
        name: '',
        activity_type: '',
        duration: 0,
        intensity: '',
        date: new Date().toISOString(),
        note: '',
        userId: 0,
        trainingexercise: [],
      });
      setEditingTraining(null);
    }
    setOpen(true);
  };

  const handleOpenExercice = (training?: Training) => {
    if (training) {
      setNewTraining(training);
      setNewExercise({
        trainingExerciseId: 0,
        zoneId: 0,
        trainingId: 0,
        exerciseId: 0,
        repetition: 0,
        weight: 0
      });
      getExerciseTraining(training.id).then(data => setExercisesTraining(data)).catch(err => console.error(err));
    }

    setOpenExercice(true);
  };

  const handleClose = () => setOpen(false);

  const handleCloseExercice = () => setOpenExercice(false);

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

  useEffect(() => {

    const exercise = fetchExercisesByZone(newExercise.zoneId);
    exercise.then(data => setExercises(data)).catch(err => console.error(err));

  }, [newExercise.zoneId]);

  const handleAddExercise = () => {
    if (!newExercise.zoneId || !newExercise.exerciseId || newExercise.repetition <= 0 || newExercise.weight < 0) {
      alert('Por favor completa todos los campos del ejercicio');
    }

    if (newExercise.trainingExerciseId === 0) {
      saveExerciseTraining(newTraining.id, newExercise)
        .then((savedExercises) => {

          const exerciseName = exercises.find(e => e.id === savedExercises.exerciseId);
          const zoneName = zones.find(z => z.id === exerciseName?.zoneId)?.name || '';

          const exerciseWithDesc = {
            ...savedExercises,
            zone: zoneName,
            exercise: exerciseName?.name,
          };

          setExercisesTraining([...exercisesTraining, exerciseWithDesc]);

        });
    } else {

      updateExerciseTraining(newExercise.trainingExerciseId, newExercise)
        .then((updateExercises) => {

          const exerciseName = exercises.find(e => e.id === updateExercises.exerciseId);
          const zoneName = zones.find(z => z.id === exerciseName?.zoneId)?.name || '';

          const exerciseWithDesc = {
            ...updateExercises,
            zone: zoneName,
            exercise: exerciseName?.name,
          };

          setExercisesTraining(exercisesTraining.map(et => et.trainingExerciseId == exerciseWithDesc.trainingExerciseId ? exerciseWithDesc : et));
        });
    }

    setNewExercise({
      trainingExerciseId: 0,
      zoneId: 0,
      trainingId: 0,
      exerciseId: 0,
      repetition: 0,
      weight: 0
    });
  }

  const handleEditExercise = (exercise: ExerciseDB) => {
    setNewExercise(exercise);
  }

  const handleDeleteExercise = (trainingExerciseId: number) => {
    if (window.confirm('¿Estás seguro que quieres borrar este ejercicio del entrenamiento?')) {
      deleteExerciseTraining(trainingExerciseId)
        .then(() => {
          setExercisesTraining(exercisesTraining.filter(i => i.trainingExerciseId != trainingExerciseId));
        })
        .catch(err => console.error(err));
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUpdateImage(true);
      setSelectedImage(e.target.files[0]);
    }
  };

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
        <h2 className='training-header-title-desktop'>Entrenamientos de <b>{userData?.name || 'Usuario'}</b></h2>
        <h2 className='training-header-title-mobile'>Entrenamientos de <br /><b>{userData?.name || 'Usuario'}</b></h2>
        <Button className='training-header-button' variant="outlined" color="primary" onClick={() => handleOpen()}><b>Agregar Entrenamiento +</b></Button>
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
                <h3 className='training-title'>{training.activity_type}</h3>
                <span className={`intensity ${training.intensity.toLowerCase()}`}>
                  <b>{training.intensity}</b>
                </span>
              </div>

              <div className="card-body">
                <div className='card-details'>
                  <p><strong>Duración:</strong> {training.duration} minutos</p>
                  <p><strong>{new Date(training.date).toLocaleDateString()}</strong></p>
                </div>

                {training.note && (
                  <div className="notes">
                    <strong>Notas:</strong>
                    <p>{training.note}</p>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <div className='card-footer-left'>
                  <Link
                    to="#"
                    className="delete-button"
                    onClick={e => {
                      e.preventDefault();
                      handleDelete(training.id);
                    }}>
                    <FaTrash className="delete-icon" />
                  </Link>
                </div>
                <div className='card-footer-right'>
                  <Link
                    to="#"
                    className="details-button"
                    onClick={e => {
                      e.preventDefault();
                      handleOpenExercice(training);
                    }}>
                    Detalles
                  </Link>
                  <Link
                    to="#"
                    className="edit-button"
                    onClick={e => {
                      e.preventDefault();
                      handleOpen(training);
                    }}>
                    <FaPen className="edit-icon" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-box">
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {editingTraining ? 'Editar entrenamiento' : 'Agregar entrenamiento'}          </Typography>
          <TextField
            name="activity_type"
            label="Actividad"
            variant="standard"
            fullWidth
            sx={{ mb: 2 }}
            value={newTraining.activity_type}
            onChange={handleInputChange}
          />

          <Box display="flex" gap={2} sx={{ mb: 2 }}>
            <Box>
              <InputLabel id="demo-simple-select-label">Duración (min)</InputLabel>
              <TextField
                name="duration"
                variant="standard"
                type="number"
                value={newTraining.duration}
                onChange={handleInputChange}
                size="medium"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <InputLabel id="demo-simple-select-label">Intensidad</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                name="intensity"
                fullWidth
                id="demo-simple-select"
                value={newTraining.intensity}
                label="Intensidad"
                onChange={handleInputChange}
                size="small"
              >
                <MenuItem className='intensity alta' value={"Alta"}>Alta</MenuItem>
                <MenuItem className='intensity media' value={"Media"}>Media</MenuItem>
                <MenuItem className='intensity baja' value={"Baja"}>Baja</MenuItem>
              </Select>
            </Box>
          </Box>

          <TextField
            name="note"
            label="Notas"
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 2, mt: 2 }}
            value={newTraining.note}
            onChange={handleInputChange}
          />

          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <InputLabel>Imagen del entrenamiento</InputLabel>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'block', marginTop: 8 }}
            />
            {selectedImage && (
              <>
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                  Imagen seleccionada: {selectedImage.name}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>

                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="Vista previa"
                    style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }}
                  />
                </Box>
              </>
            )}
            {
              !updateImage && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <img
                    src={previewBase64 ?? undefined}
                    alt="Vista previa"
                    style={{ maxWidth: '100%', maxHeight: 150, borderRadius: 8 }}
                  />
                </Box>
              )
            }
          </Box>

          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="contained" onClick={handleSave}>Guardar</Button>
          </Box>

        </Box>
      </Modal>
      <Modal
        open={openExercice}
        onClose={handleCloseExercice}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-box">
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {exercisesTraining.length > 0 ? 'Editar ejercicios' : 'Agregar ejercicios'}   </Typography>

          <Box sx={{ flex: 1 }}>
            <InputLabel id="demo-simple-select-label">Zona</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              name="zoneId"
              fullWidth
              id="demo-simple-select"
              label="Zona"
              value={newExercise.zoneId}
              onChange={handleInputChangeExercice}
              size="small"
            >
              {
                zones.map(zone => (
                  <MenuItem key={zone.id} value={zone.id}>{zone.name}</MenuItem>
                ))
              }
            </Select>
          </Box>

          <Box sx={{ flex: 1 }}>
            <InputLabel id="demo-simple-select-label">Ejercicio</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              name="exerciseId"
              fullWidth
              id="demo-simple-select"
              label="Ejercicio"
              value={newExercise.exerciseId}
              onChange={handleInputChangeExercice}
              size="small"
            >
              {
                exercises.map(exercise => (
                  <MenuItem key={exercise.id} value={exercise.id}>{exercise.name}</MenuItem>
                ))
              }
            </Select>
          </Box>
          <Box display="flex" gap={2} sx={{ mb: 2 }}>
            <Box>
              <InputLabel id="demo-simple-select-label">Repeticiones</InputLabel>
              <TextField
                name="repetition"
                variant="standard"
                type="number"
                value={newExercise.repetition}
                onChange={handleInputChangeExercice}
                size="medium"
              />
            </Box>

            <Box>
              <InputLabel id="demo-simple-select-label">Peso (KG)</InputLabel>
              <TextField
                name="weight"
                variant="standard"
                type="number"
                value={newExercise.weight}
                onChange={handleInputChangeExercice}
                size="small"
              />
            </Box>
          </Box>

          <Box display="flex" justifyContent="center" mt={2} mb={2}>
            <Button variant="contained" onClick={handleAddExercise}>{newExercise.trainingExerciseId > 0 ? "Editar" : "Agregar"}</Button>
          </Box>

          {
            exercisesTraining.length > 0 && (
              <>
                <TableContainer sx={{ maxHeight: 250, maxWidth: 700 }} component={Paper}>
                  <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                      <TableRow>
                        <StyledTableCell>Ejercicio</StyledTableCell>
                        <StyledTableCell>Zona</StyledTableCell>
                        <StyledTableCell>Repeticiones</StyledTableCell>
                        <StyledTableCell>Peso</StyledTableCell>
                        <StyledTableCell></StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exercisesTraining.map((et) => (
                        <StyledTableRow key={et.trainingExerciseId}>
                          <StyledTableCell >
                            {et.exercise}
                          </StyledTableCell>
                          <StyledTableCell align="right">{et.zone}</StyledTableCell>
                          <StyledTableCell align="right">{et.repetition}</StyledTableCell>
                          <StyledTableCell align="right">{et.weight}</StyledTableCell>
                          <StyledTableCell align="right">
                            <div className='card-footer-right'>
                              <Link
                                to="#"
                                className="delete-button"
                                onClick={e => {
                                  e.preventDefault();
                                  handleDeleteExercise(et.trainingExerciseId);
                                }}>
                                <FaTrash className="delete-icon" />
                              </Link>
                              <Link
                                to="#"
                                className="edit-button"
                                onClick={e => {
                                  e.preventDefault();
                                  handleEditExercise(et);
                                }}>
                                <FaPen className="edit-icon" />
                              </Link>
                            </div>
                          </StyledTableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )
          }
        </Box>
      </Modal>
    </div >
  );
};

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

export default TrainingList;