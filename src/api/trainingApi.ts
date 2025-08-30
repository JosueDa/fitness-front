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

export const saveTraining = async (userId: number,training: Training): Promise<Training> => {
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
