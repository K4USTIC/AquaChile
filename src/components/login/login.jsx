// src/components/login/login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validarFormularioLogin, formularioTieneErrores } from "../../utils/validaciones";
import "./login.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({}); // Ahora manejamos un objeto de errores
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    
    const datosFormulario = { correo, password };
    const nuevosErrores = validarFormularioLogin(datosFormulario);
    setErrores(nuevosErrores);

    // Si la función detecta algún error, detenemos el ingreso
    if (formularioTieneErrores(nuevosErrores)) {
      return;
    }

    // Si pasa todas las validaciones, ingresa al Dashboard
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">AquaChile</h1>
          <p className="login-subtitle">Acceso Exclusivo Selección y Evaluación</p>
        </div>

        <form onSubmit={handleLogin} className="login-form" noValidate>
          <div className="form-group">
            <label htmlFor="correo">Correo Institucional</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@aquachile.com"
            />
            {/* Mensaje de error individual para el correo */}
            {errores.correo && <p className="login-error-text">{errores.correo}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {/* Mensaje de error individual para la contraseña */}
            {errores.password && <p className="login-error-text">{errores.password}</p>}
          </div>

          <button type="submit" className="login-btn">
            Ingresar al Panel
          </button>
        </form>

        <div className="login-demo">
          <p><strong>Modo de prueba (Demo):</strong></p>
          <p>
            Ingresa un correo <code>@aquachile.com</code> y una clave válida (ej: <code>AquaChile2026!</code>) para ingresar al Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;