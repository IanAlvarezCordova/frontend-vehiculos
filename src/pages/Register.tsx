// pages/Register.tsx
import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const Register: React.FC = () => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = React.useRef<Toast>(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!/^[a-zA-Z]+\s[a-zA-Z]+$/.test(nombres)) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Debe ingresar dos nombres separados por un espacio', life: 3000 });
      return;
    }
    if (!/^[a-zA-Z]+\s[a-zA-Z]+$/.test(apellidos)) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Debe ingresar dos apellidos separados por un espacio', life: 3000 });
      return;
    }
    if (password.length < 5) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'La contraseña debe tener al menos 5 caracteres', life: 3000 });
      return;
    }

    setLoading(true);
    try {
      await authService.register(nombres, apellidos, email, password);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Registro exitoso, por favor inicia sesión', life: 3000 });
      navigate('/login');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al registrar',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="p-text-center">
      <span>¿Ya tienes una cuenta? </span>
      <Button label="Inicia Sesión" link onClick={() => navigate('/login')} />
    </div>
  );

  return (
    <div
      className="p-d-flex p-jc-center p-ai-center"
      style={{ minHeight: '100vh', backgroundColor: '#f4f4f4', padding: '2rem' }}
    >
      <Toast ref={toast} />
      <Card
        title="Registrarse"
        footer={footer}
        className="p-shadow-5"
        style={{ width: '100%', maxWidth: '600px', padding: '2rem', boxSizing: 'border-box' }}
      >
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="nombres">Nombres</label>
            <InputText
              id="nombres"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              required
              placeholder="Ej: Juan Pedro"
              style={{ fontSize: '1.2rem', padding: '0.75rem' }}
            />
          </div>
          <div className="p-field">
            <label htmlFor="apellidos">Apellidos</label>
            <InputText
              id="apellidos"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              required
              placeholder="Ej: Pérez Gómez"
              style={{ fontSize: '1.2rem', padding: '0.75rem' }}
            />
          </div>
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
              placeholder="Mínimo 5 caracteres"
              toggleMask
              style={{ fontSize: '1.2rem', padding: '0.75rem' }}
            />
          </div>
          <Button
            label="Registrarse"
            icon="pi pi-user-plus"
            loading={loading}
            onClick={handleRegister}
            style={{ fontSize: '1.2rem', padding: '0.75rem' }}
          />
        </div>
      </Card>
    </div>
  );
};