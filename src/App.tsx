import './App.css';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Inicio } from './pages/Inicio';
import { Vehiculos } from './pages/Vehiculo';
import { Dashboard } from './pages/Dashboard';
import { Talleres } from './pages/Taller';
import { RegistroServicios } from './pages/RegistroServicios';
import { Reportes } from './pages/Reportes';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserProfile } from './pages/PerfilUsuario';
import { AuthProvider, useAuth } from './context/AuthContext';
import { authService } from './services/authService';
import { JSX } from 'react';
import { GestionUsuarios } from './pages/GestionUsuarios';

const PrivateRoute: React.FC<{ element: JSX.Element; adminOnly?: boolean }> = ({ element, adminOnly }) => {
  const { roles } = useAuth();
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = roles.includes('administrador');

  if (!isAuthenticated) return <Navigate to="/auth/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
  return element;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="p-m-4">
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/perfil" element={<PrivateRoute element={<UserProfile />} />} />
            <Route path="/vehiculos" element={<PrivateRoute element={<Vehiculos />} />} />
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/talleres" element={<PrivateRoute element={<Talleres />} />} />
            <Route path="/registro-servicio" element={<PrivateRoute element={<RegistroServicios />} />} />
            <Route path="/reportes" element={<PrivateRoute element={<Reportes />} />} />
            <Route path="/configuracion" element={<PrivateRoute element={<GestionUsuarios />} adminOnly />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;