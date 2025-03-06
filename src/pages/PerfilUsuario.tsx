// UserProfile.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Avatar } from 'primereact/avatar';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { authService } from '../services/authService';

export const UserProfile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<any> & { password?: string }>({});
  const toast = useRef<Toast>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
        setFormData({
          nombres: profile.nombres,
          apellidos: profile.apellidos,
          email: profile.email,
          username: profile.username,
        });
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveProfile = async () => {
    // Validaciones similares a las del registro
    if (!/^[a-zA-ZÀ-ÿ]+(\s[a-zA-ZÀ-ÿ]+)+$/.test(formData.nombres || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe ingresar dos nombres separados por un espacio',
        life: 3000,
      });
      return;
    }
    if (!/^[a-zA-ZÀ-ÿ]+(\s[a-zA-ZÀ-ÿ]+)+$/.test(formData.apellidos || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese al menos dos apellidos válidos sin números.',
        life: 3000,
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un correo electrónico válido.',
        life: 3000,
      });
      return;
    }
    if (formData.password && formData.password.length > 0 && formData.password.length < 5) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'La contraseña debe tener al menos 5 caracteres.',
        life: 3000,
      });
      return;
    }

    try {
      const updatedUser = await authService.updateProfile(user.id, formData);
      setUser(updatedUser);
      setDisplayDialog(false);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Perfil actualizado correctamente',
        life: 3000,
      });
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al actualizar el perfil',
        life: 3000,
      });
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (!user) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
      <Toast ref={toast} />
      <Card className="w-full max-w-3xl p-8 bg-gray-800 text-gray-200 shadow-lg rounded-lg relative">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-info absolute top-4 right-4"
          onClick={() => setDisplayDialog(true)}
          tooltip="Editar Perfil"
          tooltipOptions={{ position: 'top' }}
        />
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

      <Dialog
        visible={displayDialog}
        header="Actualizar Perfil"
        onHide={() => setDisplayDialog(false)}
        style={{ width: '50vw' }}
        className="bg-gray-800 text-gray-200"
        footer={
          <div>
            <Button
              label="Cancelar"
              icon="pi pi-times"
              className="p-button-outlined p-button-danger"
              onClick={() => setDisplayDialog(false)}
            />
            <Button
              label="Guardar"
              icon="pi pi-save"
              className="p-button-outlined p-button-success"
              onClick={handleSaveProfile}
            />
          </div>
        }
      >
        <div className="p-field mb-4">
          <label htmlFor="nombres" className="block mb-1">Nombres:</label>
          <InputText
            id="nombres"
            name="nombres"
            value={formData.nombres || ''}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field mb-4">
          <label htmlFor="apellidos" className="block mb-1">Apellidos:</label>
          <InputText
            id="apellidos"
            name="apellidos"
            value={formData.apellidos || ''}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field mb-4">
          <label htmlFor="email" className="block mb-1">Email:</label>
          <InputText
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            className="w-full"
          />
        </div>
        <div className="p-field mb-4">
          <label htmlFor="password" className="block mb-1">Nueva Contraseña:</label>
          <Password
            id="password"
            name="password"
            value={formData.password || ''}
            onChange={handleInputChange}
            toggleMask
            className="w-full"
          />
          <small className="block mt-1 text-gray-400">Deja en blanco si no deseas cambiarla.</small>
        </div>
      </Dialog>
    </div>
  );
};
