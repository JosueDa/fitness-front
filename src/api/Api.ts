export interface Training {
  id: number;                 // Mapea a id_entrenamiento
  name: number;               // Mapea a id_usuario (nombre confuso, debería ser userId)
  date: string;               // Mapea a fecha
  activity_type: string;      // Mapea a tipo_actividad
  duration: number;           // Mapea a duracion_minutos
  intensity: string;          // Mapea a intencidad
  note: string;               // Mapea a notas
}

export interface User {
  id: number;                 // Mapea a id_usuario
  name: string;               // Mapea a nombre
  email: string;              // Mapea a correo
  password: string;           // Mapea a contrasenia
}

const API_URL = 'http://localhost:3000';

export const fetchTrainingsByUser = async (userId: number): Promise<Training[]> => {
  try {
    const response = await fetch(`${API_URL}/training/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trainings:', error);
    throw error;
  }
};

export const fetchUserData = async (userId: number): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};