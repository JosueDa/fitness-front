import { Exercise } from "../interfaces/Exercise";
import { Zone } from "../interfaces/Zone";

const API_URL = `${process.env.REACT_APP_API_URL}`;

export const fetchAllExercises = async (): Promise<Exercise[]> => {
  try {
    const response = await fetch(`${API_URL}/exercise`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw error;
  }
};

export const fetchAllZones = async (): Promise<Zone[]> => {
  try {
    const response = await fetch(`${API_URL}/zone`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching zones:', error);
    throw error;
  }
};