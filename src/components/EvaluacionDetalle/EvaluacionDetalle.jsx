// src/components/EvaluacionDetalle/EvaluacionDetalle.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MOCK_SOLICITUDES } from "../../constants/mockSolicitudes"; // 1. Importamos nuestros datos falsos
import "./EvaluacionDetalle.css";

function EvaluacionDetalle() {
  const { id } = useParams(); // Obtenemos el ID de la URL (ej: SOL-001)
  const navigate = useNavigate();

  // 2. Buscamos en el arreglo de datos cuál es la solicitud que coincide con este ID
  const datosCandidato = MOCK_SOLICITUDES.find(
    (solicitud) => solicitud.id === id
  );

  const [informe, setInforme] = useState("");
  const [resultado, setResultado] = useState("");

  const handleGuardar = (e) => {
    e.preventDefault();
    alert(`¡Informe guardado con éxito para la solicitud ${id}!`);
    navigate("/dashboard");
  };

  // 3. Por si alguien escribe un ID falso en la URL que no existe
  if (!datosCandidato) {
    return (
      <div className="evaluacion-container">
        <h2>Error: Solicitud no encontrada</h2>
        <button className="btn-volver" onClick={() => navigate("/dashboard")}>
          ← Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="evaluacion-container">
      <header className="evaluacion-header">
        <button className="btn-volver" onClick={() => navigate("/dashboard")}>
          ← Volver al Dashboard
        </button>
        <h1>Evaluación de Candidato</h1>
        <p className="solicitud-id">Solicitud: {datosCandidato.id}</p>
      </header>

      <div className="evaluacion-grid">
        <div className="panel-datos">
          <h2>Datos de Postulación</h2>
          {/* 4. Ahora mostramos las variables dinámicas en vez de texto fijo */}
          <div className="dato-item">
            <strong>Candidato:</strong> {datosCandidato.candidato}
          </div>
          <div className="dato-item">
            <strong>Familia de Cargo:</strong> {datosCandidato.familiaCargo}
          </div>
          <div className="dato-item">
            <strong>Cargo Específico:</strong> {datosCandidato.cargo}
          </div>
          <div className="dato-item">
            <strong>Fecha Solicitud:</strong> {datosCandidato.fechaSolicitud}
          </div>
          <div className="dato-item">
            <strong>Estado Actual:</strong> {datosCandidato.estado}
          </div>

          <div className="adjuntos-seccion">
            <h3>Archivos Adjuntos</h3>
            <button className="btn-descargar">
              📄 Descargar CV de {datosCandidato.candidato.split(" ")[0]} (PDF)
            </button>
          </div>
        </div>

        <div className="panel-informe">
          <h2>Informe Psicolaboral</h2>
          <form onSubmit={handleGuardar}>
            <div className="form-group">
              <label>Resultado de la Evaluación:</label>
              <select
                value={resultado}
                onChange={(e) => setResultado(e.target.value)}
                required
              >
                <option value="">-- Seleccione un resultado --</option>
                <option value="Apto">Apto</option>
                <option value="Apto con observaciones">
                  Apto con observaciones
                </option>
                <option value="No Apto">No Apto</option>
              </select>
            </div>

            <div className="form-group">
              <label>Observaciones / Informe detallado:</label>
              <textarea
                rows="8"
                placeholder={`Escriba aquí el análisis psicolaboral para ${datosCandidato.candidato}...`}
                value={informe}
                onChange={(e) => setInforme(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn-guardar">
              Guardar Evaluación
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EvaluacionDetalle;
