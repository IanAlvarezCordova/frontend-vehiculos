// pages/UserProfile.tsx
import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
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
    return <div>Cargando...</div>;
  }

  return (
    <div className="p-d-flex p-jc-center p-ai-center" style={{ minHeight: '100vh', backgroundColor: '#f4f4f4' }}>
      <Toast ref={toast} />
      <Card title="Perfil de Usuario" className="p-shadow-5" style={{ width: '600px', padding: '2rem' }}>
        <div style={{ fontSize: '1.2rem' }}>
          <p><strong>Nombres:</strong> {user.nombres}</p>
          <p><strong>Apellidos:</strong> {user.apellidos}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Roles:</strong> {user.roles.map((r: any) => r.nombre).join(', ')}</p>
        </div>
        <Button label="Cerrar Sesión" icon="pi pi-sign-out" className="p-button-danger" onClick={handleLogout} style={{ fontSize: '1.2rem' }} />
      </Card>
    </div>
  );
};