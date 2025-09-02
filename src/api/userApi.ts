import { User } from "../interfaces/User";

const API_URL = `${process.env.REACT_APP_API_URL}/users`;


export const fetchUserData = async (userId: number): Promise<User> => {
  try {
    //console.log('Fetching:', `${API_URL}/${userId}`);
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user data:', error);
      throw new Error('Respuesta no es JSON');

  }
};