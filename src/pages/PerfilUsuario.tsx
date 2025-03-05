import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { authService } from '../services/authService';

export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const toast = React.useRef<Toast>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error instanceof Error ? error.message : 'Error al cargar el perfil',
          life: 3000,
        });
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-xl font-semibold text-gray-300">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <Toast ref={toast} />
      <Card className="w-full max-w-3xl p-8 bg-gray-800 text-gray-200 shadow-lg rounded-lg flex flex-col items-center">
        <div className="flex flex-col items-center mb-5">
          <Avatar icon="pi pi-user" size="xlarge" className="mb-3 bg-gray-700" />
          <h2 className="text-3xl font-bold text-gray-100 text-center">Perfil de Usuario</h2>
        </div>
        <Divider className="mb-5 mt-3 border-gray-700 w-full" />
        <div className="text-lg w-full flex flex-col items-center">
          <dl className="w-full">
            <div className="flex justify-between border-b border-gray-700 pb-2 mb-3 w-full">
              <dt className="font-semibold text-gray-300">Nombres:</dt>
              <dd className="text-center">{user.nombres}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2 mb-3 w-full">
              <dt className="font-semibold text-gray-300">Apellidos:</dt>
              <dd className="text-center">{user.apellidos}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2 mb-3 w-full">
              <dt className="font-semibold text-gray-300">Email:</dt>
              <dd className="text-center">{user.email}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2 mb-3 w-full">
              <dt className="font-semibold text-gray-300">Usuario:</dt>
              <dd className="text-center">{user.username}</dd>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2 mb-3 w-full">
              <dt className="font-semibold text-gray-300">Roles:</dt>
              <dd className="text-center">{user.roles.map((r: any) => r.nombre).join(', ')}</dd>
            </div>
          </dl>
        </div>
        <div className="flex justify-center mt-5">
          <Button
            label="Cerrar Sesión"
            icon="pi pi-sign-out"
            className="p-button-danger p-button-lg"
            onClick={handleLogout}
          />
        </div>
      </Card>
    </div>
  );
};