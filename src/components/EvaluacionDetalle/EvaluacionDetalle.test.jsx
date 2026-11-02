// src/components/EvaluacionDetalle/EvaluacionDetalle.test.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EvaluacionDetalle from "./EvaluacionDetalle";
import { renderEnRuta } from "../../test/renderConRutas";
import { MOCK_SOLICITUDES } from "../../constants/mockSolicitudes";
import {
  obtenerSolicitud,
  guardarEvaluacion,
  obtenerUrlCV,
} from "../../services/solicitudesService";

// Los datos vienen de Supabase: en los tests usamos un servicio falso.
vi.mock("../../services/solicitudesService", async () =>
  (await import("../../test/mockServicioSolicitudes")).crearServicioMock()
);

const abrir = (id) =>
  renderEnRuta(<EvaluacionDetalle />, {
    path: "/evaluacion/:id",
    url: `/evaluacion/${id}`,
    marcadores: { "/dashboard": "PÁGINA DASHBOARD" },
  });

// Espera a que termine la carga y aparezca la pantalla de evaluación
const abrirYEsperar = async (id) => {
  abrir(id);
  await screen.findByRole("heading", { name: "Evaluación de Candidato" });
};

describe("EvaluacionDetalle", () => {
  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("mientras carga muestra un aviso", async () => {
    abrir("SOL-001");
    expect(screen.getByText("Cargando solicitud...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Evaluación de Candidato" })).toBeInTheDocument();
  });

  it("muestra los datos de la solicitud indicada en la URL", async () => {
    await abrirYEsperar("SOL-001");
    expect(obtenerSolicitud).toHaveBeenCalledWith("SOL-001");
    expect(screen.getByText("Solicitud: SOL-001")).toBeInTheDocument();
    expect(screen.getByText(/Juan Pérez/, { selector: ".dato-item" })).toBeInTheDocument();
    expect(screen.getByText(/Recursos Humanos/)).toBeInTheDocument();
    expect(screen.getByText(/Analista de Selección/)).toBeInTheDocument();
  });

  it("personaliza el botón de descarga con el primer nombre del candidato", async () => {
    await abrirYEsperar("SOL-002");
    expect(screen.getByRole("button", { name: /Descargar CV de María/ })).toBeInTheDocument();
  });

  it("«Descargar CV» abre la URL temporal del archivo", async () => {
    vi.spyOn(window, "open").mockImplementation(() => null);
    await abrirYEsperar("SOL-001");
    await userEvent.click(screen.getByRole("button", { name: /Descargar CV de Juan/ }));
    expect(obtenerUrlCV).toHaveBeenCalledWith("cvs/cv-ejemplo.pdf");
    expect(window.open).toHaveBeenCalledWith("https://ejemplo.test/cv.pdf", "_blank", "noopener");
  });

  it("si la solicitud no tiene CV, el botón de descarga queda deshabilitado", async () => {
    obtenerSolicitud.mockResolvedValueOnce({ ...MOCK_SOLICITUDES[0], cvPath: null, evaluacion: null });
    await abrirYEsperar("SOL-001");
    expect(screen.getByRole("button", { name: /Descargar CV de Juan/ })).toBeDisabled();
  });

  it("si no se puede obtener el CV muestra el error", async () => {
    obtenerUrlCV.mockRejectedValueOnce(new Error("No se pudo obtener el CV: no existe"));
    await abrirYEsperar("SOL-001");
    await userEvent.click(screen.getByRole("button", { name: /Descargar CV de Juan/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo obtener el CV: no existe");
  });

  it("con un ID inexistente muestra el error y permite volver", async () => {
    abrir("SOL-999");
    expect(await screen.findByRole("heading", { name: "Error: Solicitud no encontrada" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Volver al Dashboard/ }));
    expect(await screen.findByText("PÁGINA DASHBOARD")).toBeInTheDocument();
  });

  it("si la base de datos falla muestra el error y permite volver", async () => {
    obtenerSolicitud.mockRejectedValueOnce(new Error("No se pudo cargar la solicitud: sin conexión"));
    abrir("SOL-001");
    expect(await screen.findByRole("heading", { name: "Error: No se pudo cargar la solicitud" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("sin conexión");
    await userEvent.click(screen.getByRole("button", { name: /Volver al Dashboard/ }));
    expect(await screen.findByText("PÁGINA DASHBOARD")).toBeInTheDocument();
  });

  it("el botón «Volver» regresa al dashboard", async () => {
    await abrirYEsperar("SOL-001");
    await userEvent.click(screen.getByRole("button", { name: /Volver al Dashboard/ }));
    expect(await screen.findByText("PÁGINA DASHBOARD")).toBeInTheDocument();
  });

  it("ofrece los tres resultados de evaluación", async () => {
    await abrirYEsperar("SOL-001");
    expect(screen.getByRole("option", { name: "Apto" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Apto con observaciones" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "No Apto" })).toBeInTheDocument();
  });

  it("si la solicitud ya tenía informe, lo muestra para poder revisarlo", async () => {
    obtenerSolicitud.mockResolvedValueOnce({
      ...MOCK_SOLICITUDES[2],
      cvPath: null,
      evaluacion: { resultado: "Apto con observaciones", informe: "Buen perfil, falta experiencia." },
    });
    await abrirYEsperar("SOL-003");
    expect(screen.getByRole("combobox")).toHaveValue("Apto con observaciones");
    expect(screen.getByPlaceholderText(/Escriba aquí el análisis/)).toHaveValue("Buen perfil, falta experiencia.");
  });

  it("no guarda si faltan el resultado o el informe (campos requeridos)", async () => {
    await abrirYEsperar("SOL-001");
    await userEvent.click(screen.getByRole("button", { name: "Guardar Evaluación" }));
    expect(guardarEvaluacion).not.toHaveBeenCalled();
    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.queryByText("PÁGINA DASHBOARD")).not.toBeInTheDocument();
  });

  it("al completar y guardar envía el informe a la base, avisa y vuelve al dashboard", async () => {
    await abrirYEsperar("SOL-001");
    await userEvent.selectOptions(screen.getByRole("combobox"), "Apto");
    await userEvent.type(screen.getByPlaceholderText(/Escriba aquí el análisis/), "Buen desempeño en la entrevista.");
    await userEvent.click(screen.getByRole("button", { name: "Guardar Evaluación" }));

    expect(guardarEvaluacion).toHaveBeenCalledWith("SOL-001", {
      resultado: "Apto",
      informe: "Buen desempeño en la entrevista.",
    });
    expect(await screen.findByText("PÁGINA DASHBOARD")).toBeInTheDocument();
    expect(window.alert).toHaveBeenCalledWith("¡Informe guardado con éxito para la solicitud SOL-001!");
  });

  it("si falla el guardado muestra el error y se queda en la pantalla", async () => {
    guardarEvaluacion.mockRejectedValueOnce(new Error("No se pudo guardar la evaluación: sin conexión"));
    await abrirYEsperar("SOL-001");
    await userEvent.selectOptions(screen.getByRole("combobox"), "No Apto");
    await userEvent.type(screen.getByPlaceholderText(/Escriba aquí el análisis/), "No cumple el perfil.");
    await userEvent.click(screen.getByRole("button", { name: "Guardar Evaluación" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo guardar la evaluación: sin conexión");
    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.queryByText("PÁGINA DASHBOARD")).not.toBeInTheDocument();
    // los datos escritos se conservan para reintentar
    expect(screen.getByPlaceholderText(/Escriba aquí el análisis/)).toHaveValue("No cumple el perfil.");
  });
});
