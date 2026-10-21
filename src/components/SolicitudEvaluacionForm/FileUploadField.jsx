// src/components/SolicitudEvaluacionForm/FileUploadField.jsx
import React from "react";

// Componente específico para el input de tipo archivo (CV).
// Solo mantiene el archivo en memoria/estado, no lo envía a ningún servidor.

function FileUploadField({ label, name, file, onChange, error }) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-field__label">
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onChange}
        className={`form-field__file ${
          error ? "form-field__input--error" : ""
        }`}
      />

      {file && (
        <p className="form-field__file-name">
          Archivo seleccionado: <strong>{file.name}</strong>
        </p>
      )}

      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}

export default FileUploadField;
