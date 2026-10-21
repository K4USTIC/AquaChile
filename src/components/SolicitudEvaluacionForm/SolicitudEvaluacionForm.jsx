// src/components/SolicitudEvaluacionForm/SolicitudEvaluacionForm.jsx
import React, { useState } from "react";
import FormField from "./FormField";
import FileUploadField from "./FileUploadField";
import { FAMILIAS_DE_CARGO } from "../../constants/familiasDeCargo";
import {
  validarFormulario,
  formularioTieneErrores,
} from "../../utils/validaciones";
import "./SolicitudEvaluacionForm.css";

const ESTADO_INICIAL = {
  nombreCandidato: "",
  familiaCargo: "",
  nombreCargo: "",
  cv: null,
};

function SolicitudEvaluacionForm() {
  const [datos, setDatos] = useState(ESTADO_INICIAL);
  const [errores, setErrores] = useState({});
  const [envioExitoso, setEnvioExitoso] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  function handleChange(e) {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
    setEnvioExitoso(false);
  }

  function handleFileChange(e) {
    const archivo = e.target.files[0] || null;
    setDatos((prev) => ({ ...prev, cv: archivo }));
    setEnvioExitoso(false);
  }

  function handleSubmit(e) {
    e.preventDefault();

    const nuevosErrores = validarFormulario(datos);
    setErrores(nuevosErrores);

    if (formularioTieneErrores(nuevosErrores)) {
      setEnvioExitoso(false);
      return;
    }

    console.log("Datos de la solicitud:", datos);

    setEnvioExitoso(true);
    setDatos(ESTADO_INICIAL);
    setErrores({});
    setFileInputKey(Date.now());
  }

  return (
    <div className="solicitud-form-container">
      <form className="solicitud-form" onSubmit={handleSubmit} noValidate>
        <h1 className="solicitud-form__title">
          Solicitud de Evaluación Psicolaboral
        </h1>
        <p className="solicitud-form__subtitle">
          Complete la información del candidato para solicitar una evaluación.
        </p>

        <FormField
          label="Nombre del candidato"
          name="nombreCandidato"
          value={datos.nombreCandidato}
          onChange={handleChange}
          error={errores.nombreCandidato}
          placeholder="Ej: Juan Pérez"
        />

        <FormField
          label="Familia de cargo"
          name="familiaCargo"
          as="select"
          value={datos.familiaCargo}
          onChange={handleChange}
          error={errores.familiaCargo}
          options={FAMILIAS_DE_CARGO}
        />

        <FormField
          label="Nombre del cargo"
          name="nombreCargo"
          value={datos.nombreCargo}
          onChange={handleChange}
          error={errores.nombreCargo}
          placeholder="Ej: Analista de Recursos Humanos"
        />

        <FileUploadField
          key={fileInputKey}
          label="Curriculum Vitae"
          name="cv"
          file={datos.cv}
          onChange={handleFileChange}
          error={errores.cv}
        />

        <button type="submit" className="solicitud-form__submit">
          Solicitar evaluación
        </button>

        {envioExitoso && (
          <p className="solicitud-form__success">
            ✅ La solicitud fue ingresada correctamente.
          </p>
        )}
      </form>
    </div>
  );
}

export default SolicitudEvaluacionForm;
