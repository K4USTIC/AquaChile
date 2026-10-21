import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const navigate = useNavigate();

  function salir() {
    navigate("/");
  }

  return (
    <div className="layout-container">
      <header className="app-nav">
        <strong className="app-nav__brand">AquaChile · Portal Evaluadores</strong>
        
        <nav className="app-nav__links">
          {/* Agregamos "end" para que 'Todos' solo se marque si la ruta es exactamente /dashboard */}
          <NavLink to="/dashboard" end>Todos</NavLink>
          <NavLink to="/dashboard/pendientes">Pendientes</NavLink>
          <NavLink to="/dashboard/en-proceso">En Proceso</NavLink>
          <NavLink to="/dashboard/completados">Completados</NavLink>
        </nav>
        
        <div className="app-nav__user-section">
          <span className="app-nav__user">
            Psicóloga / Admin
          </span>
          <button className="btn-salir" onClick={salir}>Cerrar Sesión</button>
        </div>
      </header>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}