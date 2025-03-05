import React, { useEffect, useState } from 'react';
import { vehiculoService } from '../services/vehiculoService';
import { tallerService } from '../services/talleresService';
import { registroServicioService } from '../services/registroServicioService';
import { Vehiculo, Taller, RegistroServicio } from '../types/types';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { ProgressBar } from 'primereact/progressbar';
import { Divider } from 'primereact/divider';

export const Dashboard: React.FC = () => {
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [talleres, setTalleres] = useState<Taller[]>([]);
    const [servicios, setServicios] = useState<RegistroServicio[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const vehiculosData = await vehiculoService.findAll();
                const talleresData = await tallerService.findAll();
                const serviciosData = await registroServicioService.findAll();

                setVehiculos(vehiculosData);
                setTalleres(talleresData);
                setServicios(serviciosData);
            } catch (error) {
                console.error('Error cargando datos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalVehiculos = vehiculos.length;
    const totalTalleres = talleres.length;
    const totalServicios = servicios.length;

    // 🚗 Conteo de vehículos por marca
    const marcasCount: { [key: string]: number } = {};
    vehiculos.forEach(v => {
        marcasCount[v.marca] = (marcasCount[v.marca] || 0) + 1;
    });

    // 📊 Datos para gráfico de marcas
    const marcaChartData = {
        labels: Object.keys(marcasCount),
        datasets: [
            {
                data: Object.values(marcasCount),
                backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#26C6DA', '#D4E157'],
            },
        ],
    };

    // 🔄 Estado de los vehículos
    const estadosCount = vehiculos.reduce<{ [key: string]: number }>((acc, v) => {
        if (v.estado) {
            acc[v.estado] = (acc[v.estado] || 0) + 1;
        }
        return acc;
    }, {});

    const estadoChartData = {
        labels: Object.keys(estadosCount),
        datasets: [
            {
                data: Object.values(estadosCount),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
            },
        ],
    };

    // 📈 Promedio de kilometraje
    const promedioKm = vehiculos.length > 0 ? vehiculos.reduce((sum, v) => sum + (v.odometro || 0), 0) / vehiculos.length : 0;

    return (
        <div className="p-grid p-m-4">
            {loading ? (
                <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
            ) : (
                <>
                    <div className="p-col-12 p-md-4">
                        <Card title="Total de Vehículos" className="p-shadow-4">
                            <h2 className="p-text-center">{totalVehiculos}</h2>
                        </Card>
                    </div>

                    <div className="p-col-12 p-md-4">
                        <Card title="Kilometraje Promedio" className="p-shadow-4">
                            <h2 className="p-text-center">{promedioKm.toFixed(2)} km</h2>
                        </Card>
                    </div>

                    <div className="p-col-12 p-md-4">
                        <Card title="Distribución por Estado" className="p-shadow-4">
                            <Chart type="pie" data={estadoChartData} />
                        </Card>
                    </div>

                    <div className="p-col-12">
                        <Card title="Vehículos por Marca" className="p-shadow-4">
                            <Chart type="bar" data={marcaChartData} />
                        </Card>
                    </div>

                    <Divider />

                    <div className="p-col-12 p-md-4">
                        <Card title="Total de Talleres" className="p-shadow-4">
                            <h2 className="p-text-center">{totalTalleres}</h2>
                        </Card>
                    </div>

                    <div className="p-col-12 p-md-4">
                        <Card title="Total de Servicios" className="p-shadow-4">
                            <h2 className="p-text-center">{totalServicios}</h2>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};
