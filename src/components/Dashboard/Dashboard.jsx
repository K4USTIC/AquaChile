// src/components/Dashboard/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listarSolicitudes } from "../../services/solicitudesService";
import "./Dashboard.css";

function Dashboard() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [busqueda, setBusqueda] = useState(""); // Estado para el buscador de texto
  const navigate = useNavigate();
  const { filtro } = useParams(); // Obtenemos el estado de la URL (pendientes, en-proceso, etc.)

  // Al abrir el panel, traemos las solicitudes desde Supabase
  useEffect(() => {
    let activo = true; // evita actualizar el estado si el componente ya se desmontó
    listarSolicitudes()
      .then((datos) => {
        if (activo) setSolicitudes(datos);
      })
      .catch((error) => {
        if (activo) setErrorCarga(error.message);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  // Cálculos rápidos para las tarjetas de resumen (sobre el total general)
  const totalSolicitudes = solicitudes.length;
  const pendientes = solicitudes.filter((s) => s.estado === "Pendiente").length;
  const enProceso = solicitudes.filter((s) => s.estado === "En Proceso").length;

  // 1. Filtramos por la URL (Estado)
  let solicitudesMostradas = solicitudes;
  if (filtro === "pendientes") {
    solicitudesMostradas = solicitudesMostradas.filter(s => s.estado === "Pendiente");
  } else if (filtro === "en-proceso") {
    solicitudesMostradas = solicitudesMostradas.filter(s => s.estado === "En Proceso");
  } else if (filtro === "completados") {
    solicitudesMostradas = solicitudesMostradas.filter(s => s.estado.includes("Completad"));
  }

  // 2. Filtramos por lo que el usuario escriba en el buscador
  if (busqueda.trim() !== "") {
    solicitudesMostradas = solicitudesMostradas.filter(s => 
      s.candidato.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.cargo.toLowerCase().includes(busqueda.toLowerCase()) ||
      s.id.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

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

      {/* Controles de la Tabla (Buscador y Título) */}
      <section className="dashboard-table-section">
        <div className="table-header-controls" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2>
            {filtro === "pendientes" ? "Candidatos Pendientes" :
             filtro === "en-proceso" ? "Candidatos en Proceso" :
             filtro === "completados" ? "Evaluaciones Completadas" : 
             "Listado de Todos los Candidatos"}
          </h2>
          
          {/* Buscador de texto */}
          <input 
            type="text" 
            placeholder="Buscar candidato, cargo o ID..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", width: "300px" }}
          />
        </div>
        
        {errorCarga && (
          <p role="alert" style={{ color: "#b91c1c", marginBottom: "1rem" }}>
            {errorCarga}
          </p>
        )}

        {/* Tabla de Datos */}
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
            {cargando ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                  Cargando solicitudes...
                </td>
              </tr>
            ) : solicitudesMostradas.length > 0 ? (
              solicitudesMostradas.map((solicitud) => (
                <tr key={solicitud.id}>
                  <td>{solicitud.id}</td>
                  <td>{solicitud.candidato}</td>
                  <td>{solicitud.cargo}</td>
                  <td>{solicitud.fechaSolicitud}</td>
                  <td>
                    <span className={`estado-badge estado-${solicitud.estado.toLowerCase().replace(" ", "-")}`}>
                      {solicitud.estado}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-revisar" 
                      onClick={() => navigate(`/evaluacion/${solicitud.id}`)}
                    >
                      {solicitud.estado.includes("Completad") ? "Ver Informe" : "Evaluar"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                  No se encontraron candidatos con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Dashboard;