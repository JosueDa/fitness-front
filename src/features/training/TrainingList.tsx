import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchUserData } from '../../api/userApi';
import './TrainingList.css';
import { Box, Button, InputLabel, MenuItem, Modal, Select, TextField, Typography } from '@mui/material';
import { fetchTrainingsByUser, saveTraining, updateTraining } from '../../api/trainingApi';
import type { User, Training } from '../../interfaces';

interface TrainingListProps {
  userId?: number;
}

const TrainingList: React.FC<TrainingListProps> = ({ userId }) => {
  const { user } = useAuth();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [open, setOpen] = React.useState(false);
  const effectiveUserId = userId || user?.id;
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [newTraining, setNewTraining] = useState<Training>({
    id: 0,
    name: '',
    activity_type: '',
    duration: 0,
    intensity: '',
    date: new Date().toISOString(),
    note: '',
  });

  const handleInputChange = (e: any) => {
    const { name, value, type } = e.target;
    setNewTraining(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

    if (editingTraining) {
      // Actualizar
      await updateTraining(newTraining);
      setTrainings(trainings.map(t => t.id === newTraining.id ? newTraining : t));
    } else {
      // Crear
      const saved = await saveTraining(user.id, newTraining);
      setTrainings([...trainings, saved]);
    }
    handleClose();
  };

  const handleOpen = (training?: Training) => {
    if (training) {
      setNewTraining(training);
      setEditingTraining(training);
    } else {
      setNewTraining({
        id: 0,
        name: '',
        activity_type: '',
        duration: 0,
        intensity: '',
        date: new Date().toISOString(),
        note: '',
      });
      setEditingTraining(null);
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

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
        <Button onClick={() => handleOpen()}>Agregar Entrenamiento</Button>
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
                  to="#"
                  className="edit-button"
                  onClick={e => {
                    e.preventDefault();
                    handleOpen(training);
                  }}
                >
                  Editar
                </Link>
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
            <TextField
              name="duration"
              label="Duración"
              variant="standard"
              type="number"
              value={newTraining.duration}
              onChange={handleInputChange}
            />
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
              >
                <MenuItem value={"Alta"}>Alta</MenuItem>
                <MenuItem value={"Media"}>Media</MenuItem>
                <MenuItem value={"Baja"}>Baja</MenuItem>
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

          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="contained" onClick={handleSave}>Guardar</Button>
          </Box>

        </Box>
      </Modal>
    </div >
  );
};


export default TrainingList;