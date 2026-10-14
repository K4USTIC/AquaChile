// src/components/Dashboard/Dashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- 1. Agregamos esta importación
import { MOCK_SOLICITUDES } from "../../constants/mockSolicitudes";
import "./Dashboard.css";

function Dashboard() {
  const [solicitudes, setSolicitudes] = useState(MOCK_SOLICITUDES);
  const navigate = useNavigate(); // <-- 2. Inicializamos el hook de navegación

  // Cálculos rápidos para las tarjetas de resumen
  const totalSolicitudes = solicitudes.length;
  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente").length;
  const enProceso = solicitudes.filter((s) => s.estado === "En Proceso").length;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Panel de Evaluación Psicolaboral</h1>
        <p>Gestión y seguimiento de candidatos</p>
      </header>

      {/* Tarjetas de Indicadores */}
      <section className="dashboard-kpis">
        <div className="kpi-card">
          <h3>Total Solicitudes</h3>
          <p className="kpi-number">{totalSolicitudes}</p>
        </div>
        <div className="kpi-card warning">
          <h3>Pendientes de Revisión</h3>
          <p className="kpi-number">{pendientes}</p>
        </div>
        <div className="kpi-card info">
          <h3>En Evaluación</h3>
          <p className="kpi-number">{enProceso}</p>
        </div>
      </section>

      {/* Tabla de Datos */}
      <section className="dashboard-table-section">
        <h2>Listado de Candidatos</h2>
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Candidato</th>
              <th>Cargo Postula</th>
              <th>Fecha Solicitud</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {solicitudes.map((solicitud) => (
              <tr key={solicitud.id}>
                <td>{solicitud.id}</td>
                <td>{solicitud.candidato}</td>
                <td>{solicitud.cargo}</td>
                <td>{solicitud.fechaSolicitud}</td>
                <td>
                  <span
                    className={`estado-badge estado-${solicitud.estado
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {solicitud.estado}
                  </span>
                </td>
                <td>
                  {/* 3. Cambiamos el botón para que al hacer clic navegue a la nueva ruta usando el ID de la solicitud */}
                  <button
                    className="btn-revisar"
                    onClick={() => navigate(`/evaluacion/${solicitud.id}`)}
                  >
                    Evaluar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Dashboard;
