import React, { useEffect, useReducer, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchUserData } from '../../api/userApi';
import './Friends.css';
import type { User, Training } from '../../interfaces';
import { FaHeart } from 'react-icons/fa';
import { Box, Button, InputLabel, Modal, TextField } from '@mui/material';
import { Friend } from '../../interfaces/Friend';
import { addFriend, deleteFriend, fetchFriendsByUser, fetchUserByUsername } from '../../api/friendshipApi';
import { likePhoto } from '../../api/trainingApi';


interface FriendsProps {
  userId?: number;
}

const Friends: React.FC<FriendsProps> = ({ userId }) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isFriendshipsOpen, setIsFriendshipsOpen] = useState(false);
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isNewFriend, setIsNewFriend] = useState<Friend>({
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
  });
  const [isLiked, setIsLiked] = useState(false);
  const [isLikedId, setIsLikedId] = useState(0);
  const effectiveUserId = userId || user?.id;
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (!effectiveUserId) return;

    const loadData = async () => {
      try {
        // Cargar datos del usuario
        const userResponse = await fetchUserData(effectiveUserId);
        setUserData(userResponse);

        // Cargar amistades
        let friendshipResponse = await fetchFriendsByUser(effectiveUserId);
        friendshipResponse.sort(lastPhotoId);
        setFriends(friendshipResponse);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [effectiveUserId]);

  const lastPhotoId = (a:Friend, b:Friend)=> {
    if(a.lastPhoto == null){
      return 1;
    }
    if ( a.lastPhoto.id < b.lastPhoto.id ){
      return -1;
    }
    if ( a.lastPhoto.id > b.lastPhoto.id ){
      return 1;
    }
    return 0;
  };
  
  const name = (a:Friend, b:Friend)=> {
    if ( a.name < b.name ){
      return -1;
    }
    if ( a.name > b.name ){
      return 1;
    }
    return 0;
  };

  const handleDoubleTap = async (friend : Friend) => {
    setIsLiked(true);
    setIsLikedId(friend.id);
    friend.lastPhoto.like = await likePhoto(friend.lastPhoto.id);
    forceUpdate();
    setTimeout(() => {
        setIsLiked(false);
        setIsLikedId(0);
    }, 500); 
  };

  const handleDelete = async (friendId: number) => {
      if (!user?.id) return;
      if (window.confirm('¿Estás seguro que quieres eliminar a este amigo?')) {
        await deleteFriend(friendId, user.id);
        setFriends(friends.filter(i => i.id !== friendId));
      }
    };
  
  const toggleCollapse = () => {
    setIsFriendshipsOpen(!isFriendshipsOpen);
  };

  const handleOpen = () => {
      setIsAddFriendOpen(true);
    };

  const handleClose = () => {
    setIsAddFriendOpen(false);
  }

  const handleUsernameInputChange = (e: any) => {
    const { name, value, type } = e.target;
    if (name === 'username') {
      setIsNewFriend(prev => ({
        ...prev,
        userName: value
      }));
    }
  };

  const handleSearch = async () => {
    if (!user?.id) return;
    let userResult = await fetchUserByUsername(isNewFriend.userName);
    if(userResult != null && userResult.id !== 0){
      if(userResult.id !== user.id){
        let newFriend = await addFriend(userResult.id, user.id);
        if(newFriend === true){
          setFriends([userResult, ...friends]);
          setMessage('Amigo Añadido');
          setIsError(false);
        }else{
          setMessage('No se pudo añadir a ese usuario');
          setIsError(true);
        }
      }else{
        setMessage('No te puedes añadir a ti mismo como amigo');
        setIsError(true);
      }
    }else{
      setMessage('No se encontró a ningún usuario con ese username');
      setIsError(true);
    }
    setTimeout(() => {
      setMessage(null);
      setIsError(false);
      setIsNewFriend(prev => ({
        ...prev,
        userName: ''
      }));
    }, 1000); 
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

      {friends.length === 0 ? (
        <div className="empty-state">
          <p>¡Aún no tienes ningun amigo!</p>
          <Button className='friends-header-button' variant="outlined" color="primary" onClick={() => handleOpen()}><b>Agregar a mi primer Amigo</b></Button>
        </div>
      ) : (
        <div>
          {friends.filter(i=>i.lastPhoto != null && i.lastPhoto.url != null).length === 0 ? (
          <div className="empty-state">
            <p>Tu amigos no han publicado ninguna foto<br></br> <b>¡Recuérdales hacerlo durante su próxima sesión de entrenamiento!</b></p>
          </div>
          ): (
            <div className='friends-grid'>
              {friends.filter(i=>i.lastPhoto != null && i.lastPhoto.url!=='').map(friend => (
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
                    <div className={isLiked && isLikedId === friend.id ? 'friends-card-details hearts-bg liked-container':'friends-card-details hearts-bg'}onDoubleClick={() => handleDoubleTap(friend)}>
                      <img className={isLiked && isLikedId === friend.id ? 'friends-card-image liked-image':'friends-card-image'} src={friend.lastPhoto?.url} alt={`Última foto de ${friend.name}`}></img>
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
              friends.sort(name).map(friend => (
                <div key={friend.id} className="friends-card" style={{marginTop:'1rem', marginBottom:'0', paddingBottom:'0.5rem'}}>
                  <div className="friends-card-header" style={{marginBottom:'0'}}>
                    <div className='friends-card-title-container'>
                      <h3 className='friends-card-title'>{friend.name}</h3>
                    </div>
                    <span className={`delete-friend-span`} onClick={()=>handleDelete(friend.id)}>
                      <b className='friends-card-intensity-text'>eliminar</b>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      <Modal
        open={isAddFriendOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-box">
          <div className="card-header">
              <h3 className='stats-by-training-title'>Agregar amigo</h3>
            </div>
          <Box display="flex" sx={{marginTop:'1rem'}}>
              <TextField
              sx={{width:'100%'}}
                name="username"
                placeholder='Introduce el nombre de usuario'
                variant="standard"
                value={isNewFriend.userName}
                size="medium"
                onChange={handleUsernameInputChange}
              />
            </Box>
            <Box>
              {message && (
              <div className={isError ? 'error-message' : 'success-message'}>
                <p>{message}</p>
              </div>
              )}
            </Box>
            <Box display="flex" justifyContent="center" mt={2}>
              <Button variant="contained" onClick={handleSearch}>Agregar</Button>
            </Box>
          </Box>
      </Modal>
    </div >
  );
};


export default Friends;