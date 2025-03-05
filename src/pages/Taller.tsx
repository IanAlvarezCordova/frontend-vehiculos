// pages/Taller.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Taller } from '../types/types';
import { tallerService } from '../services/talleresService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { useAuth } from '../context/AuthContext';

export const Talleres: React.FC = () => {
  const { roles } = useAuth();
  const canEdit = roles.includes('administrador') || roles.includes('mecanico');

  const [talleres, setTalleres] = useState<Taller[]>([]);
  const toast = useRef<Toast>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [editingTaller, setEditingTaller] = useState<Partial<Taller>>({});
  const [submitted, setSubmitted] = useState(false);

  const loadTalleres = async () => {
    try {
      const data = await tallerService.findAll();
      setTalleres(data);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Talleres cargados', life: 3000 });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar los talleres', life: 3000 });
    }
  };

  useEffect(() => {
    loadTalleres();
  }, []);

  const openNew = () => {
    if (!canEdit) {
      toast.current?.show({ severity: 'error', summary: 'No Autorizado', detail: 'No tienes permisos para crear talleres', life: 3000 });
      return;
    }
    setEditingTaller({});
    setSubmitted(false);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
  };

  const saveTaller = async () => {
    if (!canEdit) {
      toast.current?.show({ severity: 'error', summary: 'No Autorizado', detail: 'No tienes permisos para guardar talleres', life: 3000 });
      return;
    }
    setSubmitted(true);
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(editingTaller.nombre || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un nombre válido sin números.',
        life: 3000,
      });
      return;
    }
    if (!/^[a-zA-ZÀ-ÿ0-9\s]+$/.test(editingTaller.direccion || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese una dirección válida.',
        life: 3000,
      });
      return;
    }
    if (!/^\d{3}-\d{4}$/.test(editingTaller.telefono || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un teléfono válido en formato 555-1234.',
        life: 3000,
      });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingTaller.correo || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un correo electrónico válido.',
        life: 3000,
      });
      return;
    }
    if (!/^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/.test(editingTaller.horariosAtencion || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un horario de atención válido en formato HH:MM-HH:MM.',
        life: 3000,
      });
      return;
    }
    if (editingTaller.nombre && editingTaller.direccion && editingTaller.telefono && editingTaller.correo && editingTaller.horariosAtencion) {
      try {
        if (editingTaller.id) {
          await tallerService.update(editingTaller.id, editingTaller);
          toast.current?.show({ severity: 'info', summary: 'Éxito', detail: 'Taller actualizado correctamente', life: 3000 });
        } else {
          await tallerService.create(editingTaller);
          toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Taller guardado correctamente', life: 3000 });
        }
        setDisplayDialog(false);
        loadTalleres();
      } catch (error) {
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar el taller', life: 3000 });
      }
    }
  };

  const footerDialog = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-outlined p-button-danger" onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-save" className="p-button-outlined p-button-success" onClick={saveTaller} />
    </div>
  );

  const handleDelete = async (id: number) => {
    if (!canEdit) {
      toast.current?.show({ severity: 'error', summary: 'No Autorizado', detail: 'No tienes permisos para eliminar talleres', life: 3000 });
      return;
    }
    try {
      await tallerService.delete(id);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Taller eliminado correctamente',
        life: 3000,
      });
      loadTalleres();
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error instanceof Error ? error.message : 'Error al eliminar el vehículo', life: 3000 });
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <h2>Gestión de Talleres</h2>

      {canEdit && (
        <Button label="Nuevo Taller" icon="pi pi-plus" className="p-button-outlined p-button-primary" onClick={openNew} />
      )}

      <br />
      <br />

      <DataTable value={talleres}>
        <Column field="id" header="Id" sortable />
        <Column field="nombre" header="Nombre" sortable />
        <Column field="direccion" header="Dirección" sortable />
        <Column field="telefono" header="Teléfono" sortable />
        <Column field="correo" header="Correo" sortable />
        <Column field="horariosAtencion" header="Horarios de Atención" sortable />
        <Column field="especialidades" header="Especialidades" sortable />
        {canEdit && (
          <Column
            header="Acciones"
            body={(rowData: Taller) => (
              <>
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-outlined p-button-success p-mr-2"
                  onClick={() => {
                    setEditingTaller(rowData);
                    setDisplayDialog(true);
                  }}
                />
                <Button
                  icon="pi pi-trash"
                  className="p-button-rounded p-button-outlined p-button-danger p-mr-2"
                  onClick={() => rowData.id && handleDelete(rowData.id)}
                />
              </>
            )}
          />
        )}
      </DataTable>

      {canEdit && (
        <Dialog
          visible={displayDialog}
          header={editingTaller.id ? 'Editar Taller' : 'Nuevo Taller'}
          onHide={hideDialog}
          footer={footerDialog}
        >
          <div className="p-field">
            <label htmlFor="nombre">Nombre: </label>
            <InputText
              id="nombre"
              value={editingTaller.nombre || ''}
              onChange={(e) => setEditingTaller({ ...editingTaller, nombre: e.target.value })}
              required
              autoFocus
              className={submitted && !editingTaller.nombre ? 'p-invalid' : ''}
            />
            {submitted && !editingTaller.nombre && <small className="p-error">Nombre es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="direccion">Dirección: </label>
            <InputText
              id="direccion"
              value={editingTaller.direccion || ''}
              onChange={(e) => setEditingTaller({ ...editingTaller, direccion: e.target.value })}
              required
              className={submitted && !editingTaller.direccion ? 'p-invalid' : ''}
            />
            {submitted && !editingTaller.direccion && <small className="p-error">Dirección es requerida.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="telefono">Teléfono: </label>
            <InputText
              id="telefono"
              value={editingTaller.telefono || ''}
              onChange={(e) => setEditingTaller({ ...editingTaller, telefono: e.target.value })}
              required
              className={submitted && !editingTaller.telefono ? 'p-invalid' : ''}
            />
            {submitted && !editingTaller.telefono && <small className="p-error">Teléfono es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="correo">Correo: </label>
            <InputText
              id="correo"
              value={editingTaller.correo || ''}
              onChange={(e) => setEditingTaller({ ...editingTaller, correo: e.target.value })}
              required
              className={submitted && !editingTaller.correo ? 'p-invalid' : ''}
            />
            {submitted && !editingTaller.correo && <small className="p-error">Correo es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="horariosAtencion">Horarios de Atención: </label>
            <InputText
              id="horariosAtencion"
              value={editingTaller.horariosAtencion || ''}
              onChange={(e) => setEditingTaller({ ...editingTaller, horariosAtencion: e.target.value })}
              required
              className={submitted && !editingTaller.horariosAtencion ? 'p-invalid' : ''}
            />
            {submitted && !editingTaller.horariosAtencion && <small className="p-error">Horarios de Atención es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="especialidades">Especialidades: </label>
            <InputText
              id="especialidades"
              value={editingTaller.especialidades || ''}
              onChange={(e) => setEditingTaller({ ...editingTaller, especialidades: e.target.value })}
            />
          </div>
          <br />
        </Dialog>
      )}
    </div>
  );
};