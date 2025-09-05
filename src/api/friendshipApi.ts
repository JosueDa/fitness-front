import { Friend } from "../interfaces/Friend";

const API_URL = `${process.env.REACT_APP_API_URL}/friendship`;

export const fetchFriendsByUser = async (userId: number): Promise<Friend[]> => {
  try {
    const response = await fetch(`${API_URL}/getAllFriendsByUser/${userId}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};