import React from 'react';
import { Link } from 'react-router-dom';

export const Inicio: React.FC = () => {
    return (
        <div>
            <h1>Bienvenido a la aplicación de roles y usuarios</h1>
            <p>Utiliza el menú superior para navegar entre las distintas secciones</p>
            <Link to="/auth/login">Ir al login</Link>
        </div>
    );
};