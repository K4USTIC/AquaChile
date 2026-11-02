// src/components/Dashboard/Dashboard.test.jsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import { listarSolicitudes } from "../../services/solicitudesService";

// Las solicitudes ya no están en el código: vienen de Supabase. En los tests usamos un servicio falso.
vi.mock("../../services/solicitudesService", async () => (await import("../../test/mockServicioSolicitudes")).crearServicioMock());


// Renderiza el panel y espera a que termine de "Cargar solicitudes..."
async function abrirDashboard(url = "/dashboard") {
  const resultado = render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/:filtro" element={<Dashboard />} />
        <Route path="/evaluacion/:id" element={<div>PÁGINA DETALLE</div>} />
      </Routes>
    </MemoryRouter>
  );
  await waitFor(() => expect(screen.queryByText("Cargando solicitudes...")).not.toBeInTheDocument());
  return resultado;
}

// Devuelve el número que muestra una tarjeta KPI a partir de su título
const kpi = (titulo) => within(screen.getByText(titulo).closest(".kpi-card")).getByText(/^\d+$/).textContent;
const filasDeDatos = () => within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row");

describe("Dashboard", () => {
  it("mientras carga muestra un aviso y luego las solicitudes", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );
    expect(screen.getByText("Cargando solicitudes...")).toBeInTheDocument();
    expect(await screen.findByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.queryByText("Cargando solicitudes...")).not.toBeInTheDocument();
  });

  it("pide las solicitudes al servicio una sola vez al abrir", async () => {
    await abrirDashboard();
    expect(listarSolicitudes).toHaveBeenCalledTimes(1);
  });

  it("si la base de datos falla muestra el error", async () => {
    listarSolicitudes.mockRejectedValueOnce(new Error("No se pudieron cargar las solicitudes: sin conexión"));
    await abrirDashboard();
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudieron cargar las solicitudes: sin conexión");
    expect(kpi("Total Solicitudes")).toBe("0");
  });

  it("muestra el encabezado y los indicadores", async () => {
    await abrirDashboard();
    expect(screen.getByRole("heading", { name: "Panel de Evaluación Psicolaboral" })).toBeInTheDocument();
    expect(kpi("Total Solicitudes")).toBe("3");
    expect(kpi("Pendientes de Revisión")).toBe("1");
    expect(kpi("En Evaluación")).toBe("1");
  });

  it("sin filtro lista todas las solicitudes", async () => {
    await abrirDashboard();
    expect(screen.getByRole("heading", { name: "Listado de Todos los Candidatos" })).toBeInTheDocument();
    expect(filasDeDatos()).toHaveLength(3);
  });

  it("/dashboard/pendientes muestra solo las pendientes", async () => {
    await abrirDashboard("/dashboard/pendientes");
    expect(screen.getByRole("heading", { name: "Candidatos Pendientes" })).toBeInTheDocument();
    expect(filasDeDatos()).toHaveLength(1);
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
  });

  it("/dashboard/en-proceso muestra solo las en proceso", async () => {
    await abrirDashboard("/dashboard/en-proceso");
    expect(filasDeDatos()).toHaveLength(1);
    expect(screen.getByText("María Gómez")).toBeInTheDocument();
  });

  it("/dashboard/completados muestra la completada con botón «Ver Informe»", async () => {
    await abrirDashboard("/dashboard/completados");
    expect(filasDeDatos()).toHaveLength(1);
    expect(screen.getByText("Carlos Soto")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver Informe" })).toBeInTheDocument();
  });

  it("las solicitudes no completadas muestran el botón «Evaluar»", async () => {
    await abrirDashboard();
    expect(screen.getAllByRole("button", { name: "Evaluar" })).toHaveLength(2);
  });

  it("el buscador filtra por nombre, sin importar mayúsculas", async () => {
    await abrirDashboard();
    await userEvent.type(screen.getByPlaceholderText(/Buscar candidato/), "marÍa");
    expect(filasDeDatos()).toHaveLength(1);
    expect(screen.getByText("María Gómez")).toBeInTheDocument();
  });

  it("el buscador también filtra por cargo y por ID", async () => {
    await abrirDashboard();
    const buscador = screen.getByPlaceholderText(/Buscar candidato/);
    await userEvent.type(buscador, "soporte");
    expect(screen.getByText("Carlos Soto")).toBeInTheDocument();
    await userEvent.clear(buscador);
    await userEvent.type(buscador, "sol-001");
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(filasDeDatos()).toHaveLength(1);
  });

  it("sin coincidencias muestra un mensaje", async () => {
    await abrirDashboard();
    await userEvent.type(screen.getByPlaceholderText(/Buscar candidato/), "zzzz");
    expect(screen.getByText("No se encontraron candidatos con los filtros actuales.")).toBeInTheDocument();
  });

  it("el botón «Evaluar» lleva al detalle de esa solicitud", async () => {
    await abrirDashboard("/dashboard/pendientes");
    await userEvent.click(screen.getByRole("button", { name: "Evaluar" }));
    expect(await screen.findByText("PÁGINA DETALLE")).toBeInTheDocument();
  });
});
