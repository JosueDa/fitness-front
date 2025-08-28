export interface Training {
  id: number;                 // Mapea a id_entrenamiento
  name: string;               // Mapea a id_usuario (nombre confuso, debería ser userId)
  date: string;               // Mapea a fecha
  activity_type: string;      // Mapea a tipo_actividad
  duration: number;           // Mapea a duracion_minutos
  intensity: string;          // Mapea a intencidad
  note: string;               // Mapea a notas
}