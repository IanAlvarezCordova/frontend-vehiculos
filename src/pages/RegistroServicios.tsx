// pages/RegistroServicios.tsx
import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { RegistroServicio, Taller, Vehiculo } from '../types/types';
import { registroServicioService } from '../services/registroServicioService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { useAuth } from '../context/AuthContext';

export const RegistroServicios: React.FC = () => {
  const { roles } = useAuth();
  const canEdit = roles.includes('administrador') || roles.includes('mecanico');

  const [registroServicios, setRegistroServicios] = useState<RegistroServicio[]>([]);
  const [talleres, setTalleres] = useState<Taller[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const toast = useRef<Toast>(null);
  const [displayDialog, setDisplayDialog] = useState(false);
  const [displayDetailsDialog, setDisplayDetailsDialog] = useState(false);
  const [editingRegistroServicio, setEditingRegistroServicio] = useState<Partial<RegistroServicio & { fechaServicio: Date | undefined }>>({
    fechaServicio: undefined,
  });
  const [selectedRegistroServicio, setSelectedRegistroServicio] = useState<RegistroServicio | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const tipoServicioOptions = [
    { label: 'Mantenimiento Preventivo', value: 'mantenimiento preventivo' },
    { label: 'Reparación Correctiva', value: 'reparacion correctiva' },
    { label: 'Revisión Técnica', value: 'revision tecnica' },
  ];

  const loadRegistroServicios = async () => {
    try {
      const data = await registroServicioService.findAll();
      setRegistroServicios(data);
      toast.current?.show({ severity: 'success', summary: 'Éxito', detail: 'Registros de servicio cargados', life: 3000 });
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar los registros de servicio', life: 3000 });
    }
  };

  const loadTalleres = async () => {
    try {
      const data = await registroServicioService.findTalleres();
      setTalleres(data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar los talleres', life: 3000 });
    }
  };

  const loadVehiculos = async () => {
    try {
      const data = await registroServicioService.findVehiculos();
      setVehiculos(data);
    } catch (error) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Error al cargar los vehículos', life: 3000 });
    }
  };

  useEffect(() => {
    loadRegistroServicios();
    loadTalleres();
    loadVehiculos();
  }, []);

  const openNew = () => {
    if (!canEdit) {
      toast.current?.show({
        severity: 'error',
        summary: 'No Autorizado',
        detail: 'No tienes permisos para crear registros de servicio',
        life: 3000,
      });
      return;
    }
    setEditingRegistroServicio({ fechaServicio: undefined });
    setSubmitted(false);
    setDisplayDialog(true);
  };

  const hideDialog = () => {
    setDisplayDialog(false);
  };

  const openDetailsDialog = async (id: number) => {
    try {
      const registroServicio = await registroServicioService.findById(id);
      setSelectedRegistroServicio(registroServicio);
      setDisplayDetailsDialog(true);
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar los detalles del registro de servicio',
        life: 3000,
      });
    }
  };

  const hideDetailsDialog = () => {
    setDisplayDetailsDialog(false);
  };

  const saveRegistroServicio = async () => {
    if (!canEdit) {
      toast.current?.show({
        severity: 'error',
        summary: 'No Autorizado',
        detail: 'No tienes permisos para guardar registros de servicio',
        life: 3000,
      });
      return;
    }
    setSubmitted(true);
    if (
      editingRegistroServicio.fechaServicio &&
      editingRegistroServicio.costo &&
      editingRegistroServicio.tipoServicio &&
      editingRegistroServicio.kilometraje &&
      editingRegistroServicio.vehiculo &&
      editingRegistroServicio.taller
    ) {
      try {
        if (editingRegistroServicio.id) {
          await registroServicioService.update(editingRegistroServicio.id, editingRegistroServicio);
          toast.current?.show({
            severity: 'info',
            summary: 'Éxito',
            detail: 'Registro de servicio actualizado correctamente',
            life: 3000,
          });
        } else {
          await registroServicioService.create(editingRegistroServicio);
          toast.current?.show({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Registro de servicio guardado correctamente',
            life: 3000,
          });
        }
        setDisplayDialog(false);
        loadRegistroServicios();
      } catch (error) {
        toast.current?.show({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al guardar el registro de servicio',
          life: 3000,
        });
      }
    }
  };

  const footerDialog = (
    <div>
      <Button label="Cancelar" icon="pi pi-times" className="p-button-outlined p-button-danger" onClick={hideDialog} />
      <Button label="Guardar" icon="pi pi-save" className="p-button-outlined p-button-success" onClick={saveRegistroServicio} />
    </div>
  );

  const handleDelete = async (id: number) => {
    if (!canEdit) {
      toast.current?.show({
        severity: 'error',
        summary: 'No Autorizado',
        detail: 'No tienes permisos para eliminar registros de servicio',
        life: 3000,
      });
      return;
    }
    try {
      await registroServicioService.delete(id);
      toast.current?.show({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Registro de servicio eliminado correctamente',
        life: 3000,
      });
      loadRegistroServicios();
    } catch (error) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar el registro de servicio',
        life: 3000,
      });
    }
  };

  return (
    <div>
      <Toast ref={toast} />
      <h2>Gestión de Registros de Servicio</h2>

      {canEdit && (
        <Button
          label="Nuevo Registro de Servicio"
          icon="pi pi-plus"
          className="p-button-outlined p-button-primary"
          onClick={openNew}
        />
      )}

      <br />
      <br />

      <DataTable value={registroServicios}>
        <Column field="id" header="Id" sortable />
        <Column field="fechaServicio" header="Fecha de Servicio" sortable />
        <Column field="descripcion" header="Descripción" sortable />
        <Column field="costo" header="Costo" sortable />
        <Column field="tipoServicio" header="Tipo de Servicio" sortable />
        <Column field="kilometraje" header="Kilometraje" sortable />
        <Column field="vehiculo.marca" header="Vehículo" sortable />
        <Column field="taller.nombre" header="Taller" sortable />
        <Column
          header="Acciones"
          body={(rowData: RegistroServicio) => (
            <>
              {canEdit && (
                <>
                  <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-outlined p-button-success p-mr-2"
                    onClick={() => {
                      setEditingRegistroServicio(rowData);
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
              <Button
                icon="pi pi-eye"
                className="p-button-rounded p-button-outlined p-button-info"
                onClick={() => openDetailsDialog(rowData.id)}
              />
            </>
          )}
        />
      </DataTable>

      {canEdit && (
        <Dialog
          visible={displayDialog}
          header={editingRegistroServicio.id ? 'Editar Registro de Servicio' : 'Nuevo Registro de Servicio'}
          onHide={hideDialog}
          footer={footerDialog}
        >
          <div className="p-field">
            <label htmlFor="fechaServicio">Fecha de Servicio: </label>
            <Calendar
              id="fechaServicio"
              value={editingRegistroServicio.fechaServicio || undefined}
              onChange={(e) => setEditingRegistroServicio({ ...editingRegistroServicio, fechaServicio: e.value || undefined })}
              required
              className={submitted && !editingRegistroServicio.fechaServicio ? 'p-invalid' : ''}
            />
            {submitted && !editingRegistroServicio.fechaServicio && (
              <small className="p-error">Fecha de Servicio es requerida.</small>
            )}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="descripcion">Descripción: </label>
            <InputText
              id="descripcion"
              value={editingRegistroServicio.descripcion}
              onChange={(e) => setEditingRegistroServicio({ ...editingRegistroServicio, descripcion: e.target.value })}
            />
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="costo">Costo: </label>
            <InputText
              id="costo"
              value={editingRegistroServicio.costo?.toString()}
              onChange={(e) => setEditingRegistroServicio({ ...editingRegistroServicio, costo: Number(e.target.value) })}
              required
              className={submitted && !editingRegistroServicio.costo ? 'p-invalid' : ''}
            />
            {submitted && !editingRegistroServicio.costo && <small className="p-error">Costo es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="tipoServicio">Tipo de Servicio: </label>
            <Dropdown
              id="tipoServicio"
              value={editingRegistroServicio.tipoServicio}
              options={tipoServicioOptions}
              onChange={(e) => setEditingRegistroServicio({ ...editingRegistroServicio, tipoServicio: e.value })}
              placeholder="Seleccione un tipo de servicio"
              required
              className={submitted && !editingRegistroServicio.tipoServicio ? 'p-invalid' : ''}
            />
            {submitted && !editingRegistroServicio.tipoServicio && (
              <small className="p-error">Tipo de Servicio es requerido.</small>
            )}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="kilometraje">Kilometraje: </label>
            <InputText
              id="kilometraje"
              value={editingRegistroServicio.kilometraje?.toString()}
              onChange={(e) => setEditingRegistroServicio({ ...editingRegistroServicio, kilometraje: Number(e.target.value) })}
              required
              className={submitted && !editingRegistroServicio.kilometraje ? 'p-invalid' : ''}
            />
            {submitted && !editingRegistroServicio.kilometraje && (
              <small className="p-error">Kilometraje es requerido.</small>
            )}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="vehiculo">Vehículo: </label>
            <Dropdown
              id="vehiculo"
              value={editingRegistroServicio.vehiculo?.id}
              options={vehiculos.map((v) => ({ label: `${v.marca} ${v.modelo} (${v.numeroPlaca})`, value: v.id }))}
              onChange={(e) =>
                setEditingRegistroServicio({ ...editingRegistroServicio, vehiculo: vehiculos.find((v) => v.id === e.value) })
              }
              placeholder="Seleccione un vehículo"
              required
              className={submitted && !editingRegistroServicio.vehiculo ? 'p-invalid' : ''}
            />
            {submitted && !editingRegistroServicio.vehiculo && <small className="p-error">Vehículo es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="taller">Taller: </label>
            <Dropdown
              id="taller"
              value={editingRegistroServicio.taller?.id}
              options={talleres.map((t) => ({ label: t.nombre, value: t.id }))}
              onChange={(e) =>
                setEditingRegistroServicio({ ...editingRegistroServicio, taller: talleres.find((t) => t.id === e.value) })
              }
              placeholder="Seleccione un taller"
              required
              className={submitted && !editingRegistroServicio.taller ? 'p-invalid' : ''}
            />
            {submitted && !editingRegistroServicio.taller && <small className="p-error">Taller es requerido.</small>}
          </div>
          <br />
          <div className="p-field">
            <label htmlFor="documentos">Documentos: </label>
            <FileUpload
              name="documentos"
              url="./upload"
              multiple
              accept="image/*,application/pdf"
              maxFileSize={10000000}
              onUpload={(e) =>
                setEditingRegistroServicio({
                  ...editingRegistroServicio,
                  documentos: e.files.map((file: any) => file.name).join(','),
                })
              }
            />
          </div>
          <br />
        </Dialog>
      )}

      <Dialog
        visible={displayDetailsDialog}
        header="Detalles del Registro de Servicio"
        onHide={hideDetailsDialog}
        style={{ width: '50vw' }}
      >
        {selectedRegistroServicio && (
          <div className="p-fluid">
            <div className="p-field">
              <label htmlFor="id">ID: </label>
              <InputText id="id" value={selectedRegistroServicio.id.toString()} disabled />
            </div>
            <div className="p-field">
              <label htmlFor="fechaServicio">Fecha de Servicio: </label>
              <Calendar id="fechaServicio" value={new Date(selectedRegistroServicio.fechaServicio)} disabled />
            </div>
            <div className="p-field">
              <label htmlFor="descripcion">Descripción: </label>
              <InputText id="descripcion" value={selectedRegistroServicio.descripcion} disabled />
            </div>
            <div className="p-field">
              <label htmlFor="costo">Costo: </label>
              <InputText id="costo" value={selectedRegistroServicio.costo.toString()} disabled />
            </div>
            <div className="p-field">
              <label htmlFor="tipoServicio">Tipo de Servicio: </label>
              <InputText id="tipoServicio" value={selectedRegistroServicio.tipoServicio} disabled />
            </div>
            <div className="p-field">
              <label htmlFor="kilometraje">Kilometraje: </label>
              <InputText id="kilometraje" value={selectedRegistroServicio.kilometraje.toString()} disabled />
            </div>
            <div className="p-field">
              <label htmlFor="vehiculo">Vehículo: </label>
              <InputText
                id="vehiculo"
                value={`${selectedRegistroServicio.vehiculo?.marca} ${selectedRegistroServicio.vehiculo?.modelo} (${selectedRegistroServicio.vehiculo?.numeroPlaca})`}
                disabled
              />
            </div>
            <div className="p-field">
              <label htmlFor="taller">Taller: </label>
              <InputText id="taller" value={selectedRegistroServicio.taller?.nombre} disabled />
            </div>
            <div className="p-field">
              <label htmlFor="documentos">Documentos: </label>
              {selectedRegistroServicio.documentos ? (
                <>
                  {selectedRegistroServicio.documentos.match(/\.(jpeg|jpg|gif|png)$/) ? (
                    <img
                      src={selectedRegistroServicio.documentos}
                      alt="Documento"
                      style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '5px' }}
                    />
                  ) : (
                    <a href={selectedRegistroServicio.documentos} target="_blank" rel="noopener noreferrer">
                      Descargar documento
                    </a>
                  )}
                </>
              ) : (
                <span>No hay documentos</span>
              )}
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};