// src/components/SolicitudEvaluacionForm/FormField.jsx
import React from "react";

// Componente reutilizable: renderiza un input de texto o un select,
// junto con su label y mensaje de error, según el prop "as".

function FormField({
  label,
  name,
  as = "input",
  type = "text",
  value,
  onChange,
  error,
  options = [],
  placeholder,
}) {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-field__label">
        {label}
      </label>

      {as === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`form-field__input ${
            error ? "form-field__input--error" : ""
          }`}
        >
          <option value="">Seleccione una opción</option>
          {options.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-field__input ${
            error ? "form-field__input--error" : ""
          }`}
        />
      )}

      {error && <span className="form-field__error">{error}</span>}
    </div>
  );
}

export default FormField;
