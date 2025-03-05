import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await authService.login(email, password);
      login();
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Inicio de sesión exitoso',
        life: 3000,
      });
      navigate('/dashboard');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al iniciar sesión',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-300 p-6">
      <Toast ref={toast} />
      <div className="w-full max-w-md bg-gray-300 p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Iniciar Sesión</h2>

        <div className="p-fluid">
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">Correo Electrónico</label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese su correo"
              className="p-inputtext-lg w-full"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              toggleMask
              feedback={false}
              className="p-inputtext-lg w-full"
            />
          </div>

          <Button
            label="Iniciar Sesión"
            icon="pi pi-sign-in"
            loading={loading}
            onClick={handleLogin}
            className="p-button-primary w-full text-lg py-3"
          />
        </div>

        <div className="text-center mt-4">
          <span className="text-gray-600">¿No tienes una cuenta? </span>
          <Button label="Regístrate" className="p-button-text text-blue-500" onClick={() => navigate('/register')} />
        </div>
      </div>
    </div>
  );
};
