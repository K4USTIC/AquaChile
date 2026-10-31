// src/components/EvaluacionDetalle/EvaluacionDetalle.test.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EvaluacionDetalle from "./EvaluacionDetalle";
import { renderEnRuta } from "../../test/renderConRutas";

const abrir = (id) =>
  renderEnRuta(<EvaluacionDetalle />, {
    path: "/evaluacion/:id",
    url: `/evaluacion/${id}`,
    marcadores: { "/dashboard": "PÁGINA DASHBOARD" },
  });

describe("EvaluacionDetalle", () => {
  beforeEach(() => {
    vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  it("muestra los datos de la solicitud indicada en la URL", () => {
    abrir("SOL-001");
    expect(screen.getByRole("heading", { name: "Evaluación de Candidato" })).toBeInTheDocument();
    expect(screen.getByText("Solicitud: SOL-001")).toBeInTheDocument();
    expect(screen.getByText(/Juan Pérez/, { selector: ".dato-item" })).toBeInTheDocument();
    expect(screen.getByText(/Recursos Humanos/)).toBeInTheDocument();
    expect(screen.getByText(/Analista de Selección/)).toBeInTheDocument();
  });

  it("personaliza el botón de descarga con el primer nombre del candidato", () => {
    abrir("SOL-002");
    expect(screen.getByRole("button", { name: /Descargar CV de María/ })).toBeInTheDocument();
  });

  it("con un ID inexistente muestra el error y permite volver", async () => {
    abrir("SOL-999");
    expect(screen.getByRole("heading", { name: "Error: Solicitud no encontrada" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Volver al Dashboard/ }));
    expect(await screen.findByText("PÁGINA DASHBOARD")).toBeInTheDocument();
  });

  it("el botón «Volver» regresa al dashboard", async () => {
    abrir("SOL-001");
    await userEvent.click(screen.getByRole("button", { name: /Volver al Dashboard/ }));
    expect(await screen.findByText("PÁGINA DASHBOARD")).toBeInTheDocument();
  });

  it("ofrece los tres resultados de evaluación", () => {
    abrir("SOL-001");
    expect(screen.getByRole("option", { name: "Apto" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Apto con observaciones" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "No Apto" })).toBeInTheDocument();
  });

  it("no guarda si faltan el resultado o el informe (campos requeridos)", async () => {
    abrir("SOL-001");
    await userEvent.click(screen.getByRole("button", { name: "Guardar Evaluación" }));
    expect(window.alert).not.toHaveBeenCalled();
    expect(screen.queryByText("PÁGINA DASHBOARD")).not.toBeInTheDocument();
  });

  it("al completar y guardar avisa y vuelve al dashboard", async () => {
    abrir("SOL-001");
    await userEvent.selectOptions(screen.getByRole("combobox"), "Apto");
    await userEvent.type(screen.getByPlaceholderText(/Escriba aquí el análisis/), "Buen desempeño en la entrevista.");
    await userEvent.click(screen.getByRole("button", { name: "Guardar Evaluación" }));

    expect(window.alert).toHaveBeenCalledWith("¡Informe guardado con éxito para la solicitud SOL-001!");
    expect(await screen.findByText("PÁGINA DASHBOARD")).toBeInTheDocument();
  });
});
