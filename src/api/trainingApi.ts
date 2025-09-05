import { ExerciseDB } from "../interfaces";
import { Training } from "../interfaces/Training";
import { TrainingPhoto } from '../interfaces/TrainingPhoto';
import { addMimeHeader } from "../Utilities/AddMimeHeader";

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

export const saveTraining = async (userId: number, training: Training): Promise<any> => {
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

export const updateTraining = async (training: Training): Promise<any> => {
  try {

    const payload = {
      activity_type: training.activity_type,
      duration: training.duration,
      intensity: training.intensity,
      note: training.note,
    };

    const response = await fetch(`${API_URL}/${training.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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
    await fetch(`${API_URL}/exercise/${trainingExerciseId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
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

export const addTrainingPhoto = async (trainingId: number, base64: string): Promise<TrainingPhoto> => {
  try {
    const imgBase64 = addMimeHeader(base64);
    const response = await fetch(`${API_URL}/${trainingId}/photo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64: imgBase64 }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const deleteTrainingPhoto = async (photoId: number): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/photo/${photoId}`,
      { method: 'DELETE' }
    );

    if (!response.ok)
      throw new Error(`Error ${response.status}: ${response.statusText}`);

    return await response.json();

  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const getPhotoTraining = async (trainingId: number): Promise<TrainingPhoto> => {
  try {
    const response = await fetch(`${API_URL}/photo/${trainingId}`);
    if (!response.ok) 
      throw new Error(`Error ${response.status}: ${response.statusText}`);

    return await response.json();

  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};   

export const likePhoto = async (photoId: number): Promise<number> => {
  try {
    const data = {
      number: 1
    };

    const response = await fetch(`${API_URL}/photo/${photoId}/like/`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error liking photo:', error);
    throw error;
  }
};