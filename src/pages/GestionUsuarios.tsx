// pages/Usuarios.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { usuarioService, Usuario, Rol } from '../services/usuarioService';

export const GestionUsuarios: React.FC = () => {
  const { roles } = useAuth();
  const isAdmin = roles.includes('administrador');

  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [rolesDisponibles, setRolesDisponibles] = useState<Rol[]>([]);
  const [displayEditDialog, setDisplayEditDialog] = useState(false);
  const [displayRolesDialog, setDisplayRolesDialog] = useState(false);
  const [displayDeleteDialog, setDisplayDeleteDialog] = useState(false); // Nuevo estado para el diálogo de eliminación
  const [editingUsuario, setEditingUsuario] = useState<Partial<Usuario>>({});
  const [selectedRoles, setSelectedRoles] = useState<Rol[]>([]);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null); // Estado para el usuario a eliminar
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef<Toast>(null);

  const loadUsuarios = async () => {
    try {
      const data = await usuarioService.findAll();
      setUsuarios(data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar los usuarios', life: 3000 });
    }
  };

  const loadRoles = async () => {
    try {
      const data = await usuarioService.getRoles();
      setRolesDisponibles(data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar los roles', life: 3000 });
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadRoles();
  }, []);

  const openEditDialog = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setSubmitted(false);
    setDisplayEditDialog(true);
  };

  const openRolesDialog = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setSelectedRoles(usuario.roles);
    setDisplayRolesDialog(true);
  };

  const openDeleteDialog = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
    setDisplayDeleteDialog(true);
  };

  const hideDialog = () => {
    setDisplayEditDialog(false);
    setDisplayRolesDialog(false);
    setDisplayDeleteDialog(false);
  };

  const saveUsuario = async () => {
    setSubmitted(true);
    if (!/^[a-zA-ZÀ-ÿ]+(\s[a-zA-ZÀ-ÿ]+)+$/.test(editingUsuario.nombres || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese al menos dos nombres válidos sin números.',
        life: 3000,
      });
      return;
    }
    if (!/^[a-zA-ZÀ-ÿ]+(\s[a-zA-ZÀ-ÿ]+)+$/.test(editingUsuario.apellidos || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese al menos dos apellidos válidos sin números.',
        life: 3000,
      });
      return;
    }
    if (editingUsuario.nombres && editingUsuario.apellidos && editingUsuario.email) {
      try {
        await usuarioService.update(editingUsuario.id!, editingUsuario);
        toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 });
        setDisplayEditDialog(false);
        loadUsuarios();
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: error instanceof Error ? error.message : 'Error al actualizar el usuario',
          life: 3000,
        });
      }
    }
  };

  const saveRoles = async () => {
    try {
      const currentRoles = editingUsuario.roles || [];
      const rolesToAdd = selectedRoles.filter((rol) => !currentRoles.some((r) => r.id === rol.id));
      const rolesToRemove = currentRoles.filter((rol) => !selectedRoles.some((r) => r.id === rol.id));

      for (const rol of rolesToAdd) {
        await usuarioService.asignarRol(editingUsuario.id!, rol.id);
      }
      for (const rol of rolesToRemove) {
        await usuarioService.removerRol(editingUsuario.id!, rol.id);
      }

      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Roles actualizados', life: 3000 });
      setDisplayRolesDialog(false);
      loadUsuarios();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al actualizar los roles',
        life: 3000,
      });
    }
  };

  const deleteUsuario = async () => {
    if (!usuarioToDelete) return;

    try {
      await usuarioService.delete(usuarioToDelete.id); // Método delete del backend
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado', life: 3000 });
      setDisplayDeleteDialog(false);
      setUsuarioToDelete(null);
      loadUsuarios();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: error instanceof Error ? error.message : 'Error al eliminar el usuario',
        life: 3000,
      });
    }
  };

  const editFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-outlined p-button-danger" onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-save" className="p-button-outlined p-button-success" onClick={saveUsuario} />
    </div>
  );

  const rolesFooter = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-outlined p-button-danger" onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-save" className="p-button-outlined p-button-success" onClick={saveRoles} />
    </div>
  );

  const deleteFooter = (
    <div>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-outlined p-button-secondary"
        onClick={hideDialog}
      />
      <Button
        label="Sí"
        icon="pi pi-check"
        className="p-button-outlined p-button-danger"
        onClick={deleteUsuario}
      />
    </div>
  );

  return (
    <div>
      <Toast ref={toast} />
      <h2>Gestión de Usuarios</h2>

      <DataTable value={usuarios}>
        <Column field="id" header="ID" sortable />
        <Column field="nombres" header="Nombres" sortable />
        <Column field="apellidos" header="Apellidos" sortable />
        <Column field="email" header="Email" sortable />
        <Column field="username" header="Username" sortable />
        <Column
          field="roles"
          header="Roles"
          body={(rowData: Usuario) => rowData.roles.map((r) => r.nombre).join(', ')}
          sortable
        />
        <Column
          header="Acciones"
          body={(rowData: Usuario) => (
            <>
              <Button
                icon="pi pi-pencil"
                className="p-button-rounded p-button-outlined p-button-success p-mr-2"
                onClick={() => openEditDialog(rowData)}
              />
              <Button
                icon="pi pi-users"
                className="p-button-rounded p-button-outlined p-button-info p-mr-2"
                onClick={() => openRolesDialog(rowData)}
              />
              <Button
                icon="pi pi-trash"
                className="p-button-rounded p-button-outlined p-button-danger"
                onClick={() => openDeleteDialog(rowData)}
              />
            </>
          )}
        />
      </DataTable>

      <Dialog visible={displayEditDialog} header="Editar Usuario" onHide={hideDialog} footer={editFooter}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="nombres">Nombres</label>
            <InputText
              id="nombres"
              value={editingUsuario.nombres || ''}
              onChange={(e) => setEditingUsuario({ ...editingUsuario, nombres: e.target.value })}
              required
              className={submitted && !editingUsuario.nombres ? 'p-invalid' : ''}
            />
            {submitted && !editingUsuario.nombres && <small className="p-error">Nombres son requeridos.</small>}
          </div>
          <div className="p-field">
            <label htmlFor="apellidos">Apellidos</label>
            <InputText
              id="apellidos"
              value={editingUsuario.apellidos || ''}
              onChange={(e) => setEditingUsuario({ ...editingUsuario, apellidos: e.target.value })}
              required
              className={submitted && !editingUsuario.apellidos ? 'p-invalid' : ''}
            />
            {submitted && !editingUsuario.apellidos && <small className="p-error">Apellidos son requeridos.</small>}
          </div>
          <div className="p-field">
            <label htmlFor="email">Email</label>
            <InputText
              id="email"
              value={editingUsuario.email || ''}
              onChange={(e) => setEditingUsuario({ ...editingUsuario, email: e.target.value })}
              required
              className={submitted && !editingUsuario.email ? 'p-invalid' : ''}
            />
            {submitted && !editingUsuario.email && <small className="p-error">Email es requerido.</small>}
          </div>
        </div>
      </Dialog>

      <Dialog visible={displayRolesDialog} header="Gestionar Roles" onHide={hideDialog} footer={rolesFooter}>
        <div className="p-fluid">
          <div className="p-field">
            <label htmlFor="roles">Roles</label>
            <MultiSelect
              id="roles"
              value={selectedRoles}
              options={rolesDisponibles}
              onChange={(e) => setSelectedRoles(e.value)}
              optionLabel="nombre"
              placeholder="Seleccione roles"
              display="chip"
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        visible={displayDeleteDialog}
        header="Confirmar Eliminación"
        onHide={hideDialog}
        footer={deleteFooter}
      >
        <div className="p-d-flex p-ai-center">
          <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem', color: 'red' }} />
          <span>
            ¿Estás seguro de que deseas eliminar al usuario <strong>{usuarioToDelete?.nombres} {usuarioToDelete?.apellidos}</strong>? Esta acción no se puede deshacer.
          </span>
        </div>
      </Dialog>
    </div>
  );
};