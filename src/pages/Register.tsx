import React, { useState, useRef } from 'react';
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
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!/^[a-zA-ZÀ-ÿ]+(\s[a-zA-ZÀ-ÿ]+)+$/.test(nombres)) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe ingresar dos nombres separados por un espacio',
        life: 3000,
      });
      return;
    }
    if (!/^[a-zA-ZÀ-ÿ]+(\s[a-zA-ZÀ-ÿ]+)+$/.test(apellidos)) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese al menos dos apellidos válidos sin números.',
        life: 3000,
      });
      return;
    }
    if (password.length < 5) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña debe tener al menos 5 caracteres.',
        life: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      await authService.register(nombres, apellidos, email, password);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Registro exitoso, por favor inicia sesión.',
        life: 3000,
      });
      navigate('/auth/login');
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al registrar.',
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
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Crear Cuenta</h2>

        <div className="p-fluid">
          <div className="mb-4">
            <label htmlFor="nombres" className="block text-gray-700 font-semibold mb-1">Nombres</label>
            <InputText
              id="nombres"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              placeholder="Ej: Juan Pedro"
              className="p-inputtext-lg w-full"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="apellidos" className="block text-gray-700 font-semibold mb-1">Apellidos</label>
            <InputText
              id="apellidos"
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
              placeholder="Ej: Pérez Gómez"
              className="p-inputtext-lg w-full"
            />
          </div>

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
              placeholder="Mínimo 5 caracteres"
              toggleMask
              className="p-inputtext-lg w-full"
            />
          </div>

          <Button
            label="Registrarse"
            icon="pi pi-user-plus"
            loading={loading}
            onClick={handleRegister}
            className="p-button-primary w-full text-lg py-3"
          />
        </div>

        <div className="text-center mt-4">
          <span className="text-gray-600">¿Ya tienes una cuenta? </span>
          <Button label="Inicia Sesión" className="p-button-text text-blue-500" onClick={() => navigate('/auth/login')} />
        </div>
      </div>
    </div>
  );
};
