import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchUserData } from '../../api/userApi';
import './Friends.css';
import type { User, Training } from '../../interfaces';
import { FaHeart } from 'react-icons/fa';
import { Box, Button, Modal } from '@mui/material';
import { Friend } from '../../interfaces/Friend';
import { fetchFriendsByUser } from '../../api/friendshipApi';
import { likePhoto } from '../../api/trainingApi';
import { Padding } from '@mui/icons-material';


interface FriendsProps {
  userId?: number;
}

const Friends: React.FC<FriendsProps> = ({ userId }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [isFriendshipsOpen, setIsFriendshipsOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = React.useState(false);
  const effectiveUserId = userId || user?.id;

  useEffect(() => {
    if (!effectiveUserId) return;

    const loadData = async () => {
      try {
        // Cargar datos del usuario
        const userResponse = await fetchUserData(effectiveUserId);
        setUserData(userResponse);

        // Cargar entrenamientos
        const friendshipResponse = await fetchFriendsByUser(effectiveUserId);
        setFriends(friendshipResponse);
        console.log(friendshipResponse);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [effectiveUserId]);

  const handleDoubleTap = async (friend : Friend) => {
    friend.lastPhoto.like = await likePhoto(friend.lastPhoto.id);
    setEditingFriend(friend);

    if(editingFriend) setFriends(friends.map(t => t.id === friend.id ? editingFriend : t));
  };
  
  const toggleCollapse = () => {
    setIsFriendshipsOpen(!isFriendshipsOpen);
  };

  const handleOpen = (training?: Training) => {
      setIsAddFriendOpen(true);
    };

  if (!user) {
    return (
      <div className="friends-list">
        <div className="auth-required">
          <h2>Acceso requerido</h2>
          <p>Por favor inicia sesión para ver tus entrenamientos</p>
          <Link to="/login" className="auth-button">
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return (
    <div className="friends-list">
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando amigos...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="friends-list">
      <div className="error-message">
        <h2>Error al cargar los datos</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div className="friends-list">
      <div className="friends-header">
        <h2 className='friends-header-title-desktop'>Amigos de <b>{userData?.name || 'Usuario'}</b></h2>
        <h2 className='friends-header-title-mobile'>Amigos de <br/><b>{userData?.name || 'Usuario'}</b></h2>
        <Button className='friends-header-button' variant="outlined" color="primary" onClick={() => handleOpen()}><b>Agregar Amigo +</b></Button>
      </div>

      {friends.length == 0 ? (
        <div className="empty-state">
          <p>¡Aún no tienes ningun amigo!</p>
          <Button className='friends-header-button' variant="outlined" color="primary" onClick={() => handleOpen()}><b>Agregar a mi primer Amigo</b></Button>
        </div>
      ) : (
        <div>
          {friends.filter(i=>i.lastPhoto != null).length == 0 ? (
          <div className="empty-state">
            <p>Tu amigos no han publicado ninguna foto<br></br> <b>¡Recuérdales hacerlo durante su próxima sesión de entrenamiento!</b></p>
          </div>
          ): (
            <div className='friends-grid'>
              {friends.filter(i=>i.lastPhoto.url!='').map(friend => (
                <div key={friend.id} className="friends-card">
                  <div className="friends-card-header">
                    <div className='friends-card-title-container'>
                      <h3 className='friends-card-title'>{friend.name}</h3>
                    </div>
                    <span className={`friends-card-intensity-span intensity ${friend.lastPhoto.intensity.toLowerCase()}`}>
                      <b className='friends-card-intensity-text'>{friend.lastPhoto.intensity}</b>
                    </span>
                  </div>
                  <div className="friends-card-body">
                    <div className='friends-card-details' onDoubleClick={() => handleDoubleTap(friend)}>
                      <img className='friends-card-image' src={friend.lastPhoto?.url}></img>
                    </div>
                  </div>
                  <div className="friends-card-footer">
                    <div className='friends-card-likes'>
                      <FaHeart className='friends-card-heart'></FaHeart>
                      <b>{friend.lastPhoto.like}</b>
                    </div>
                    <b className='friends-card-date'>{new Date(friend.lastPhoto.date).toLocaleDateString()}</b>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button variant="outlined" color="primary" className='friends-collapse-button' style={{backgroundColor: 'white'}} onClick={toggleCollapse}>
            <b>{isFriendshipsOpen ? 'Lista de amigos -' : 'Lista de amigos +'}</b>
          </Button>
          <div className="friends-grid" style={{gap: '1rem'}}>
            {isFriendshipsOpen && (
              friends.map(friend => (
                <div key={friend.id} className="friends-card" style={{marginTop:'1rem', marginBottom:'0', paddingBottom:'0.5rem'}}>
                  <div className="friends-card-header" style={{marginBottom:'0'}}>
                    <div className='friends-card-title-container'>
                      <h3 className='friends-card-title'>{friend.name}</h3>
                    </div>
                    <span className={`delete-friend-span`}>
                      <b className='friends-card-intensity-text'>eliminar</b>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div >
  );
};


export default Friends;