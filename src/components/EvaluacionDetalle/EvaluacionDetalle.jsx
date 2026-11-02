// src/components/EvaluacionDetalle/EvaluacionDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  obtenerSolicitud,
  guardarEvaluacion,
  obtenerUrlCV,
} from "../../services/solicitudesService";
import "./EvaluacionDetalle.css";

function EvaluacionDetalle() {
  const { id } = useParams(); // Obtenemos el ID de la URL (ej: SOL-001)
  const navigate = useNavigate();

  const [datosCandidato, setDatosCandidato] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [informe, setInforme] = useState("");
  const [resultado, setResultado] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState("");
  const [errorCV, setErrorCV] = useState("");

  // Buscamos en Supabase la solicitud que coincide con este ID
  useEffect(() => {
    let activo = true;
    setCargando(true);
    setErrorCarga("");
    obtenerSolicitud(id)
      .then((solicitud) => {
        if (!activo) return;
        setDatosCandidato(solicitud);
        // Si ya tenía una evaluación guardada, la mostramos para poder revisarla o corregirla
        if (solicitud?.evaluacion) {
          setResultado(solicitud.evaluacion.resultado);
          setInforme(solicitud.evaluacion.informe);
        }
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
  }, [id]);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorGuardado("");
    setGuardando(true);
    try {
      await guardarEvaluacion(id, { resultado, informe });
      alert(`¡Informe guardado con éxito para la solicitud ${id}!`);
      navigate("/dashboard");
    } catch (error) {
      setErrorGuardado(error.message);
      setGuardando(false);
    }
  };

  // El CV está en un bucket privado: pedimos una URL temporal y la abrimos
  const handleDescargarCV = async () => {
    setErrorCV("");
    try {
      const url = await obtenerUrlCV(datosCandidato.cvPath);
      window.open(url, "_blank", "noopener");
    } catch (error) {
      setErrorCV(error.message);
    }
  };

  if (cargando) {
    return (
      <div className="evaluacion-container">
        <p>Cargando solicitud...</p>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="evaluacion-container">
        <h2>Error: No se pudo cargar la solicitud</h2>
        <p role="alert">{errorCarga}</p>
        <button className="btn-volver" onClick={() => navigate("/dashboard")}>
          ← Volver al Dashboard
        </button>
      </div>
    );
  }

  // Por si alguien escribe un ID falso en la URL que no existe
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
            <button
              className="btn-descargar"
              onClick={handleDescargarCV}
              disabled={!datosCandidato.cvPath}
              title={datosCandidato.cvPath ? "" : "Esta solicitud no tiene CV adjunto"}
            >
              📄 Descargar CV de {datosCandidato.candidato.split(" ")[0]} (PDF)
            </button>
            {errorCV && <p role="alert">{errorCV}</p>}
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

            {errorGuardado && <p role="alert">{errorGuardado}</p>}

            <button type="submit" className="btn-guardar" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Evaluación"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EvaluacionDetalle;
