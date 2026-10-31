// src/components/Dashboard/Dashboard.test.jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";

function abrirDashboard(url = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:filtro" element={<Dashboard />} />
        <Route path="/evaluacion/:id" element={<div>PÁGINA DETALLE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

// Devuelve el número que muestra una tarjeta KPI a partir de su título
const kpi = (titulo) => within(screen.getByText(titulo).closest(".kpi-card")).getByText(/^\d+$/).textContent;
const filasDeDatos = () => within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row");

describe("Dashboard", () => {
  it("muestra el encabezado y los indicadores", () => {
    abrirDashboard();
    expect(screen.getByRole("heading", { name: "Panel de Evaluación Psicolaboral" })).toBeInTheDocument();
    expect(kpi("Total Solicitudes")).toBe("3");
    expect(kpi("Pendientes de Revisión")).toBe("1");
    expect(kpi("En Evaluación")).toBe("1");
  });

  it("sin filtro lista todas las solicitudes", () => {
    abrirDashboard();
    expect(screen.getByRole("heading", { name: "Listado de Todos los Candidatos" })).toBeInTheDocument();
    expect(filasDeDatos()).toHaveLength(3);
  });

  it("/dashboard/pendientes muestra solo las pendientes", () => {
    abrirDashboard("/dashboard/pendientes");
    expect(screen.getByRole("heading", { name: "Candidatos Pendientes" })).toBeInTheDocument();
    expect(filasDeDatos()).toHaveLength(1);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });

  it("/dashboard/en-proceso muestra solo las en proceso", () => {
    abrirDashboard("/dashboard/en-proceso");
    expect(filasDeDatos()).toHaveLength(1);
    expect(screen.getByText("María Gómez")).toBeInTheDocument();
  });

  it("/dashboard/completados muestra la completada con botón «Ver Informe»", () => {
    abrirDashboard("/dashboard/completados");
    expect(filasDeDatos()).toHaveLength(1);
    expect(screen.getByText("Carlos Soto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver Informe" })).toBeInTheDocument();
  });

  it("las solicitudes no completadas muestran el botón «Evaluar»", () => {
    abrirDashboard();
    expect(screen.getAllByRole("button", { name: "Evaluar" })).toHaveLength(2);
  });

  it("el buscador filtra por nombre, sin importar mayúsculas", async () => {
    abrirDashboard();
    await userEvent.type(screen.getByPlaceholderText(/Buscar candidato/), "marÍa");
    expect(filasDeDatos()).toHaveLength(1);
    expect(screen.getByText("María Gómez")).toBeInTheDocument();
  });

  it("el buscador también filtra por cargo y por ID", async () => {
    abrirDashboard();
    const buscador = screen.getByPlaceholderText(/Buscar candidato/);
    await userEvent.type(buscador, "soporte");
    expect(screen.getByText("Carlos Soto")).toBeInTheDocument();
    await userEvent.clear(buscador);
    await userEvent.type(buscador, "sol-001");
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(filasDeDatos()).toHaveLength(1);
  });

  it("sin coincidencias muestra un mensaje", async () => {
    abrirDashboard();
    await userEvent.type(screen.getByPlaceholderText(/Buscar candidato/), "zzzz");
    expect(screen.getByText("No se encontraron candidatos con los filtros actuales.")).toBeInTheDocument();
  });

  it("el botón «Evaluar» lleva al detalle de esa solicitud", async () => {
    abrirDashboard("/dashboard/pendientes");
    await userEvent.click(screen.getByRole("button", { name: "Evaluar" }));
    expect(await screen.findByText("PÁGINA DETALLE")).toBeInTheDocument();
  });
});
