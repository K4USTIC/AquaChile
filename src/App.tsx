import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Importamos componentes
import Home from "./components/Home/Home";
import Login from "./components/login/login";
import SolicitudEvaluacionForm from "./components/SolicitudEvaluacionForm/SolicitudEvaluacionForm";
import Dashboard from "./components/Dashboard/Dashboard";
import EvaluacionDetalle from "./components/EvaluacionDetalle/EvaluacionDetalle";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* La pantalla principal ahora es nuestra Landing Page con los 2 botones */}
        <Route path="/" element={<Home />} />

        {/* El resto de las rutas */}
        <Route path="/login" element={<Login />} />
        <Route path="/formulario" element={<SolicitudEvaluacionForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/evaluacion/:id" element={<EvaluacionDetalle />} />

        {/* Cualquier error en la URL manda al Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
