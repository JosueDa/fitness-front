import { ExerciseDB } from "../interfaces";
import { Training } from "../interfaces/Training";

const API_URL = `${process.env.REACT_APP_API_URL}/training`;

export const fetchTrainingsByUser = async (userId: number): Promise<Training[]> => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trainings:', error);
    throw error;
  }
};

export const saveTraining = async (userId: number, training: Training): Promise<Training> => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(training),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving training:', error);
    throw error;
  }
};

export const deleteTraining = async (trainingId: number): Promise<Training> => {
  try {
    const response = await fetch(`${API_URL}/delete/${trainingId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving training:', error);
    throw error;
  }
};

export const updateTraining = async (training: Training): Promise<Training> => {
  try {
    const response = await fetch(`${API_URL}/${training.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(training),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating training:', error);
    throw error;
  }
};

export const saveExerciseTraining = async (trainingId: number, exerciseDB: ExerciseDB): Promise<ExerciseDB> => {
  try {

    console.log(JSON.stringify(exerciseDB));
    const response = await fetch(`${API_URL}/${trainingId}/exercises`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exerciseDB),
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

export const deleteExerciseTraining = async (trainingExerciseId: number) => {
  try {
    const response = await fetch(`${API_URL}/exercise/${trainingExerciseId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );  
  }  catch (error) {
    console.error('Error deleting exercise from training:', error);
    throw error;
  }
}

export const updateExerciseTraining = async (trainingExerciseId: number, exerciseDB: ExerciseDB): Promise<ExerciseDB> => {
  try {
    
    const payload = {
      trainingExerciseId: exerciseDB.trainingExerciseId,
      trainingId: exerciseDB.trainingId,
      exerciseId: exerciseDB.exerciseId,
      repetition: exerciseDB.repetition,
      weight: exerciseDB.weight,
    };

    const response = await fetch(`${API_URL}/exercise/${trainingExerciseId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

export const getExerciseTraining = async (trainingId: number): Promise<ExerciseDB[]> => {
  try {

    const response = await fetch(`${API_URL}/${trainingId}/exercises/details`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();

  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};