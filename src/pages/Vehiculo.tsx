// pages/Vehiculo.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { Vehiculo } from '../types/types';
import { vehiculoService } from '../services/vehiculoService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useAuth } from '../context/AuthContext';

export const Vehiculos: React.FC = () => {
  const { roles } = useAuth();
  const canEdit = roles.includes('administrador') || roles.includes('mecanico');

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const toast = useRef<Toast>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [editingVehiculo, setEditingVehiculo] = useState<Partial<Vehiculo & { numeroPlaca?: string }>>({});
  const [submitted, setSubmitted] = useState(false);

  const estadoOptions = [
    { label: 'Activo', value: 'activo' },
    { label: 'En Mantenimiento', value: 'en mantenimiento' },
    { label: 'Inactivo', value: 'inactivo' },
  ];

  const tipoOptions = [
    { label: 'Automóvil', value: 'automovil' },
    { label: 'Camión', value: 'camion' },
    { label: 'Motocicleta', value: 'motocicleta' },
  ];

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1970 + 1 }, (_, i) => ({
    label: (1970 + i).toString(),
    value: 1970 + i,
  }));

  const loadVehiculos = async () => {
    try {
      console.log('Cargando vehículos...');
      const data = await vehiculoService.findAll();
      console.log('Vehículos cargados:', data);
      setVehiculos(data);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Vehículos cargados', life: 3000 });
    } catch (error) {
      console.error('Error al cargar los vehículos:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar los vehículos', life: 3000 });
    }
  };

  useEffect(() => {
    loadVehiculos();
  }, []);

  const openNew = () => {
    if (!canEdit) {
      toast.current?.show({ severity: 'error', summary: 'No Autorizado', detail: 'No tienes permisos para crear vehículos', life: 3000 });
      return;
    }
    setEditingVehiculo({});
    setSubmitted(false);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
  };

  const saveVehiculo = async () => {
    if (!canEdit) {
      toast.current?.show({ severity: 'error', summary: 'No Autorizado', detail: 'No tienes permisos para guardar vehículos', life: 3000 });
      return;
    }
    setSubmitted(true);
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(editingVehiculo.marca || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese una marca válida sin números.',
        life: 3000,
      });
      return;
    }
    if (!/^[a-zA-ZÀ-ÿ0-9\s]+$/.test(editingVehiculo.modelo || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un modelo válido.',
        life: 3000,
      });
      return;
    }
    if (!/^\d{4}$/.test(editingVehiculo.año?.toString() || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un año válido.',
        life: 3000,
      });
      return;
    }
    if (!/^[A-Z]{3}-\d{3,4}$/.test(editingVehiculo.numeroPlaca || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un número de placa válido en formato AAA-123 o AAA-1234.',
        life: 3000,
      });
      return;
    }
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(editingVehiculo.color || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un color válido sin números.',
        life: 3000,
      });
      return;
    }
    if (!editingVehiculo.tipo) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Seleccione un tipo de vehículo.',
        life: 3000,
      });
      return;
    }
    if (!/^\d+$/.test(editingVehiculo.odometro?.toString() || '')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese un odómetro válido.',
        life: 3000,
      });
      return;
    }
    if (!editingVehiculo.estado) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Seleccione un estado.',
        life: 3000,
      });
      return;
    }
    if (
      editingVehiculo.marca &&
      editingVehiculo.modelo &&
      editingVehiculo.año &&
      editingVehiculo.numeroPlaca &&
      editingVehiculo.color &&
      editingVehiculo.tipo &&
      editingVehiculo.odometro &&
      editingVehiculo.estado
    ) {
      try {
        if (editingVehiculo.id) {
          await vehiculoService.update(editingVehiculo.id, editingVehiculo);
          toast.current?.show({ severity: 'info', summary: 'Éxito', detail: 'Vehículo actualizado correctamente', life: 3000 });
        } else {
          await vehiculoService.create(editingVehiculo);
          toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Vehículo guardado correctamente', life: 3000 });
        }
        setDisplayDialog(false);
        loadVehiculos();
      } catch (error) {
        console.error('Error al guardar el vehículo:', error);
        toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al guardar el vehículo', life: 3000 });
      }
    }
  };

  const footerDialog = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-outlined p-button-danger" onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-save" className="p-button-outlined p-button-success" onClick={saveVehiculo} />
    </div>
  );

  const handleDelete = async (id: number) => {
    if (!canEdit) {
      toast.current?.show({ severity: 'error', summary: 'No Autorizado', detail: 'No tienes permisos para eliminar vehículos', life: 3000 });
      return;
    }
    try {
      await vehiculoService.delete(id);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Vehículo eliminado correctamente',
        life: 3000,
      });
      loadVehiculos();
    } catch (error) {
      console.error('Error al eliminar el vehículo:', error);
      toast.current?.show({ severity: 'error', summary: 'Error', detail: error instanceof Error ? error.message : 'Error al eliminar el vehículo', life: 3000 });
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <h2>Gestión de Vehículos</h2>

      {canEdit && (
        <Button label="Nuevo Vehículo" icon="pi pi-plus" className="p-button-outlined p-button-primary" onClick={openNew} />
      )}

      <br />
      <br />

      <DataTable value={vehiculos}>
        <Column field="id" header="Id" sortable />
        <Column field="marca" header="Marca" sortable />
        <Column field="modelo" header="Modelo" sortable />
        <Column field="año" header="Año" sortable />
        <Column field="numeroPlaca" header="Número de Placa" sortable />
        <Column field="color" header="Color" sortable />
        <Column field="tipo" header="Tipo" sortable />
        <Column field="odometro" header="Odómetro" sortable />
        <Column field="estado" header="Estado" sortable />
        {canEdit && (
          <Column
            header="Acciones"
            body={(rowData: Vehiculo) => (
              <>
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded p-button-outlined p-button-success p-mr-2"
                  onClick={() => {
                    setEditingVehiculo(rowData);
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
          header={editingVehiculo.id ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          onHide={hideDialog}
          footer={footerDialog}
        >
          <div className="p-field">
            <label htmlFor="marca">Marca: </label>
            <InputText
              id="marca"
              value={editingVehiculo.marca || ''}
              onChange={(e) => setEditingVehiculo({ ...editingVehiculo, marca: e.target.value })}
              required
              autoFocus
              className={submitted && !editingVehiculo.marca ? 'p-invalid' : ''}
            />
            {submitted && !editingVehiculo.marca && <small className="p-error">Marca es requerida.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="modelo">Modelo: </label>
            <InputText
              id="modelo"
              value={editingVehiculo.modelo || ''}
              onChange={(e) => setEditingVehiculo({ ...editingVehiculo, modelo: e.target.value })}
              required
              className={submitted && !editingVehiculo.modelo ? 'p-invalid' : ''}
            />
            {submitted && !editingVehiculo.modelo && <small className="p-error">Modelo es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="año">Año: </label>
            <Dropdown
              id="año"
              value={editingVehiculo.año}
              options={yearOptions}
              onChange={(e) => setEditingVehiculo({ ...editingVehiculo, año: e.value })}
              placeholder="Seleccione un año"
              required
              className={submitted && !editingVehiculo.año ? 'p-invalid' : ''}
            />
            {submitted && !editingVehiculo.año && <small className="p-error">Año es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="numeroPlaca">Número de Placa: </label>
            <InputText
              id="numeroPlaca"
              value={editingVehiculo.numeroPlaca || ''}
              onChange={(e) => setEditingVehiculo({ ...editingVehiculo, numeroPlaca: e.target.value })}
              required
              className={submitted && !editingVehiculo.numeroPlaca ? 'p-invalid' : ''}
            />
            {submitted && !editingVehiculo.numeroPlaca && <small className="p-error">Número de Placa es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="color">Color: </label>
            <InputText
              id="color"
              value={editingVehiculo.color || ''}
              onChange={(e) => setEditingVehiculo({ ...editingVehiculo, color: e.target.value })}
              required
              className={submitted && !editingVehiculo.color ? 'p-invalid' : ''}
            />
            {submitted && !editingVehiculo.color && <small className="p-error">Color es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="tipo">Tipo: </label>
            <Dropdown
              id="tipo"
              value={editingVehiculo.tipo}
              options={tipoOptions}
              onChange={(e) => setEditingVehiculo({ ...editingVehiculo, tipo: e.value })}
              placeholder="Seleccione un tipo"
              required
              className={submitted && !editingVehiculo.tipo ? 'p-invalid' : ''}
            />
            {submitted && !editingVehiculo.tipo && <small className="p-error">Tipo es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="odometro">Odómetro: </label>
            <InputText
              id="odometro"
              value={editingVehiculo.odometro?.toString() || ''}
              onChange={(e) => setEditingVehiculo({ ...editingVehiculo, odometro: Number(e.target.value) })}
              required
              className={submitted && !editingVehiculo.odometro ? 'p-invalid' : ''}
            />
            {submitted && !editingVehiculo.odometro && <small className="p-error">Odómetro es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="estado">Estado: </label>
            <Dropdown
              id="estado"
              value={editingVehiculo.estado}
              options={estadoOptions}
              onChange={(e) => setEditingVehiculo({ ...editingVehiculo, estado: e.value })}
              placeholder="Seleccione un estado"
              required
              className={submitted && !editingVehiculo.estado ? 'p-invalid' : ''}
            />
            {submitted && !editingVehiculo.estado && <small className="p-error">Estado es requerido.</small>}
          </div>
          <br />
        </Dialog>
      )}
    </div>
  );
};