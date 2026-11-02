// src/test/renderConRutas.jsx – ayuda para renderizar un componente que usa React Router
import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Renderiza "ui" en la ruta "path" (con la URL inicial "url") y agrega páginas "marcador"
// para poder comprobar a qué ruta navegó el componente.
export function renderEnRuta(ui, { path = "/", url = "/", marcadores = {} } = {}) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path={path} element={ui} />
        {Object.entries(marcadores).map(([ruta, texto]) => (
          <Route key={ruta} path={ruta} element={<div>{texto}</div>} />
        ))}
      </Routes>
    </MemoryRouter>
  );
}
