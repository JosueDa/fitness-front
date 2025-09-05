import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Layout from './components/Layout/Layout';
import HomePage from './pages/Home/Home';
import ProfilePage from './pages/Profile/Profile';
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Register/RegisterPage';
import TrainingListPage from './pages/Training/TrainingList';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import NotFoundPage from './pages/NotFound/NotFound';
import StatsPage from './pages/Stats/Stats';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />}/>
            <Route 
              index 
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="profile" 
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="trainings" 
              element={
                <PrivateRoute>
                  <TrainingListPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="stats" 
              element={
                <PrivateRoute>
                  <StatsPage />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;