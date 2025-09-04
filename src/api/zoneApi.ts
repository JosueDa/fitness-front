import { Zone } from "../interfaces/Zone";

const API_URL = `${process.env.REACT_APP_API_URL}/zone`;


export const fetchZoneData = async (): Promise<Zone> => {
  try {
    //console.log('Fetching:', `${API_URL}/${userId}`);
    const response = await fetch(`${API_URL}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching zone data:', error);
      throw new Error('Respuesta no es JSON');
  }
};