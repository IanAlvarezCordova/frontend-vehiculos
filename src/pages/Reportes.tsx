import React, { useState, useEffect, useRef } from 'react';
import { vehiculoService } from '../services/vehiculoService';
import { registroServicioService } from '../services/registroServicioService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Vehiculo, RegistroServicio, Taller } from '../types/types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Reportes: React.FC = () => {
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [registrosServicio, setRegistrosServicio] = useState<RegistroServicio[]>([]);
    const [talleres, setTalleres] = useState<Taller[]>([]);
    const [vehiculosRequierenRevision, setVehiculosRequierenRevision] = useState<Vehiculo[]>([]);
    const [showModal, setShowModal] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const vehiculosData = await vehiculoService.findAll();
                setVehiculos(vehiculosData);
                const registrosData = await registroServicioService.findAll();
                setRegistrosServicio(registrosData);
                const talleresData = await registroServicioService.findTalleres();
                setTalleres(talleresData);

                const vehiculosRevision = vehiculosData.filter(vehiculo => vehiculo.odometro > 50000);
                setVehiculosRequierenRevision(vehiculosRevision);
                if (vehiculosRevision.length > 0) {
                    setShowModal(true);
                }
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos', life: 3000 });
            }
        };
        loadData();
    }, []);

    const formatNumber = (value: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(value);
    };

    const formatDays = (value: number) => {
        return new Intl.NumberFormat('es-ES').format(value);
    };

    const reporteCostosPorVehiculo = () => {
        return vehiculos.map((vehiculo) => {
            const totalCosto = registrosServicio
                .filter((registro) => registro.vehiculo.id === vehiculo.id)
                .reduce((acc: number, registro: RegistroServicio) => acc + Number(registro.costo || 0), 0);

            return {
                vehiculoId: vehiculo.id,
                marca: vehiculo.marca,
                modelo: vehiculo.modelo,
                totalCosto
            };
        });
    };

    const reporteCostosPorTaller = () => {
        return talleres.map((taller) => {
            const totalCosto = registrosServicio
                .filter((registro) => registro.taller.id === taller.id)
                .reduce((acc: number, registro: RegistroServicio) => acc + Number(registro.costo || 0), 0);

            return {
                tallerId: taller.id,
                nombreTaller: taller.nombre,
                totalCosto
            };
        });
    };

    const estadisticasFrecuenciaMantenimiento = () => {
        return vehiculos.map((vehiculo) => {
            const cantidadMantenimientos = registrosServicio.filter((registro) => registro.vehiculo.id === vehiculo.id).length;
            return {
                vehiculoId: vehiculo.id,
                marca: vehiculo.marca,
                modelo: vehiculo.modelo,
                cantidadMantenimientos
            };
        });
    };

    const tiempoPromedioEntreServicios = () => {
        return vehiculos.map((vehiculo) => {
            const registros = registrosServicio.filter((registro) => registro.vehiculo.id === vehiculo.id);
            if (registros.length < 2) return { vehiculoId: vehiculo.id, marca: vehiculo.marca, modelo: vehiculo.modelo, promedio: 0 };

            const tiempos = registros.slice(1).map((registro: RegistroServicio, index: number) => {
                return Math.abs(new Date(registro.fechaServicio).getTime() - new Date(registros[index].fechaServicio).getTime());
            });

            const promedio = tiempos.reduce((acc: number, tiempo: number) => acc + tiempo, 0) / tiempos.length;
            return { vehiculoId: vehiculo.id, marca: vehiculo.marca, modelo: vehiculo.modelo, promedio: promedio / (1000 * 3600 * 24) }; // en días
        });
    };

    const reparacionesRecurrentes = () => {
        return registrosServicio.reduce((acc: any[], registro: RegistroServicio) => {
            const descripcion = registro.descripcion || 'No especificada';
            const existing = acc.find((item) => item.descripcion === descripcion);
            if (existing) {
                existing.cantidad += 1;
            } else {
                acc.push({ descripcion, cantidad: 1 });
            }
            return acc;
        }, []);
    };

    return (
        <div>
            <Toast ref={toast} />
            <h2>Reportes y Estadísticas</h2>

            <Dialog header="Atención" visible={showModal} style={{ width: '50vw' }} onHide={() => setShowModal(false)}>
                <p>Los siguientes vehículos requieren revisión por superar los 50,000 km:</p>
                <ul>
                    {vehiculosRequierenRevision.map((vehiculo) => (
                        <li key={vehiculo.id}>{`${vehiculo.marca} ${vehiculo.modelo} (Odómetro: ${vehiculo.odometro} km)`}</li>
                    ))}
                </ul>
            </Dialog>

            <h3>Costos Acumulados por Vehículo</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reporteCostosPorVehiculo()}>
                    <XAxis dataKey="modelo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalCosto" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
            <DataTable value={reporteCostosPorVehiculo()}>
                <Column field="marca" header="Marca" />
                <Column field="modelo" header="Modelo" />
                <Column field="totalCosto" header="Costo Total" body={(rowData) => formatNumber(rowData.totalCosto)} />
            </DataTable>

            <h3>Costos Acumulados por Taller</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reporteCostosPorTaller()}>
                    <XAxis dataKey="nombreTaller" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalCosto" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
            <DataTable value={reporteCostosPorTaller()}>
                <Column field="nombreTaller" header="Taller" />
                <Column field="totalCosto" header="Costo Total" body={(rowData) => formatNumber(rowData.totalCosto)} />
            </DataTable>

            <h3>Frecuencia de Mantenimiento por Vehículo</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estadisticasFrecuenciaMantenimiento()}>
                    <XAxis dataKey="modelo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidadMantenimientos" fill="#ffc658" />
                </BarChart>
            </ResponsiveContainer>
            <DataTable value={estadisticasFrecuenciaMantenimiento()}>
                <Column field="marca" header="Marca" />
                <Column field="modelo" header="Modelo" />
                <Column field="cantidadMantenimientos" header="Mantenimientos" />
            </DataTable>

            <h3>Tiempo Promedio entre Servicios</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tiempoPromedioEntreServicios()}>
                    <XAxis dataKey="modelo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="promedio" fill="#d0ed57" />
                </BarChart>
            </ResponsiveContainer>
            <DataTable value={tiempoPromedioEntreServicios()}>
                <Column field="marca" header="Marca" />
                <Column field="modelo" header="Modelo" />
                <Column field="promedio" header="Promedio (días)" body={(rowData) => formatDays(rowData.promedio)} />
            </DataTable>

            <h3>Reparaciones Recurrentes</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reparacionesRecurrentes()}>
                    <XAxis dataKey="descripcion" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" fill="#a4de6c" />
                </BarChart>
            </ResponsiveContainer>
            <DataTable value={reparacionesRecurrentes()}>
                <Column field="descripcion" header="Descripción" />
                <Column field="cantidad" header="Frecuencia" />
            </DataTable>
        </div>
    );
};
