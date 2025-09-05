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

export const fetchUserByUsername = async (username: string): Promise<Friend | null> => {
  try {
    const response = await fetch(`${API_URL}/searchUser/${username}`);
    if (response == null || !response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    try{
      return await response.json();
    }catch(error){
      return {
        id: 0,
        name: '',
        userName : '',
        lastPhoto: {
          id: 0,
          trainingId: 0,
          like: 0,
          url: '',
          intensity: '',
          date: '',
        },
      };
    }
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

export const addFriend = async (friendId: number, userId: number): Promise<Boolean> => {
  try {
    let data = {
      userId : userId,
      friendId : friendId
    }
    const response = await fetch(`${API_URL}/addFriendship/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving friend:', error);
    throw error;
  }
};

export const deleteFriend = async (friendId: number, userId: number): Promise<Friend> => {
  try {
    let data = {
      userId : userId,
      friendId : friendId
    }
    const response = await fetch(`${API_URL}/delete/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error saving friend:', error);
    throw error;
  }
};