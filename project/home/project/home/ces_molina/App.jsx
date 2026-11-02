import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importamos componentes públicos
import Home from "./components/Home/Home";
import Login from "./components/login/login";
import SolicitudEvaluacionForm from "./components/SolicitudEvaluacionForm/SolicitudEvaluacionForm";

// Importamos componentes del entorno privado (Dashboard)
import DashboardLayout from "./components/Layout/DashboardLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import EvaluacionDetalle from "./components/EvaluacionDetalle/EvaluacionDetalle";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/formulario" element={<SolicitudEvaluacionForm />} />

        {/* RUTAS PRIVADAS (Envuelta en el Layout para que tengan la barra superior) */}
        <Route element={<DashboardLayout />}>
          {/* Ruta principal del Dashboard (Muestra todos) */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Ruta dinámica para los filtros (Pendientes, En Proceso, Completados) */}
          <Route path="/dashboard/:filtro" element={<Dashboard />} />
          
          {/* Ruta para ver el detalle y evaluar a un candidato específico */}
          <Route path="/evaluacion/:id" element={<EvaluacionDetalle />} />
        </Route>

        {/* Cualquier error en la URL manda al Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}