// src/components/Home/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* NAVBAR*/}
      <nav className="home-navbar">
        <div className="logo">AQUACHILE</div>

        <div className="navbar-buttons">
          <button className="nav-btn" onClick={() => navigate("/formulario")}>
            FORMULARIO
          </button>

          <button
            className="nav-btn nav-btn-outline"
            onClick={() => navigate("/login")}
          >
            LOGIN
          </button>
        </div>
      </nav>

      {/* SECCIÓN CENTRAL*/}
      <main className="home-hero">
        <h1 className="hero-text">Conectamos el talento del Sur de Chile</h1>
      </main>
    </div>
  );
}

export default Home;
