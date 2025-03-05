// pages/Login.tsx
import React, { useState } from 'react';
import { Card } from 'primereact/card';
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
  const toast = React.useRef<Toast>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await authService.login(email, password);
      login();
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Inicio de sesión exitoso', life: 3000 });
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

  const footer = (
    <div className="p-text-center">
      <span>¿No tienes una cuenta? </span>
      <Button label="Regístrate" link onClick={() => navigate('/register')} />
    </div>
  );

  return (
    <div
      className="p-d-flex p-jc-center p-ai-center"
      style={{ minHeight: '100vh', backgroundColor: '#f4f4f4', padding: '2rem' }}
    >
      <Toast ref={toast} />
      <Card
        title="Iniciar Sesión"
        footer={footer}
        className="p-shadow-5"
        style={{ width: '100%', maxWidth: '600px', padding: '2rem', boxSizing: 'border-box' }}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="email">Correo Electrónico</label>
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Ingrese su correo"
              style={{ fontSize: '1.2rem', padding: '0.75rem' }}
            />
          </div>
          <div className="p-field">
            <label htmlFor="password">Contraseña</label>
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingrese su contraseña"
              toggleMask
              style={{ fontSize: '1.2rem', padding: '0.75rem' }}
            />
          </div>
          <Button
            label="Iniciar Sesión"
            icon="pi pi-sign-in"
            loading={loading}
            onClick={handleLogin}
            style={{ fontSize: '1.2rem', padding: '0.75rem' }}
          />
        </div>
      </Card>
    </div>
  );
};