// src/components/login/login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (!correo.trim() || !password.trim()) {
      setError("Por favor ingrese correo y contraseña.");
      return;
    }

    if (correo.includes("@aquachile.com")) {
      navigate("/dashboard");
    } else {
      setError(
        "Acceso permitido solo para correos institucionales (@aquachile.com)"
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">AquaChile</h1>
          <p className="login-subtitle">
            Acceso Exclusivo Selección y Evaluación
          </p>
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
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn">
            Ingresar al Panel
          </button>
        </form>

        <div className="login-demo">
          <p>
            <strong>Modo de prueba (Demo):</strong>
          </p>
          <p>
            Ingresa cualquier correo con <code>@aquachile.com</code> (ej:{" "}
            <code>evaluador@aquachile.com</code>) y cualquier clave para
            ingresar al Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
