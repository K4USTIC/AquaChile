// src/components/SolicitudEvaluacionForm/SolicitudEvaluacionForm.test.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SolicitudEvaluacionForm from "./SolicitudEvaluacionForm";

const pdf = new File(["cv"], "cv-juan.pdf", { type: "application/pdf" });
const txt = new File(["cv"], "cv-juan.txt", { type: "text/plain" });

// applyAccept:false permite subir un .txt aunque el input solo acepte pdf/doc/docx,
// así podemos probar nuestra propia validación (el navegador real filtraría antes).
const usuario = () => userEvent.setup({ applyAccept: false });

const botonEnviar = () => screen.getByRole("button", { name: "Solicitar evaluación" });

describe("SolicitudEvaluacionForm", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {}); // el formulario hace console.log al enviar
  });

  it("muestra el título y los campos", () => {
    render(<SolicitudEvaluacionForm />);
    expect(screen.getByRole("heading", { name: "Solicitud de Evaluación Psicolaboral" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre del candidato")).toBeInTheDocument();
    expect(screen.getByLabelText("Familia de cargo")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre del cargo")).toBeInTheDocument();
    expect(screen.getByLabelText("Curriculum Vitae")).toBeInTheDocument();
  });

  it("al enviar vacío muestra un error por cada campo", async () => {
    render(<SolicitudEvaluacionForm />);
    await usuario().click(botonEnviar());
    expect(screen.getByText("El nombre del candidato es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("Debe seleccionar una familia de cargo.")).toBeInTheDocument();
    expect(screen.getByText("El nombre del cargo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("Debe adjuntar el Curriculum Vitae.")).toBeInTheDocument();
    expect(screen.queryByText(/ingresada correctamente/)).not.toBeInTheDocument();
  });

  it("al elegir una familia ofrece solo los cargos de esa familia", async () => {
    render(<SolicitudEvaluacionForm />);
    await usuario().selectOptions(screen.getByLabelText("Familia de cargo"), "Operaciones");
    expect(screen.getByRole("option", { name: "Jefe de Centro" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Operario de Producción" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Analista Contable" })).not.toBeInTheDocument();
  });

  it("al cambiar de familia se reinicia el cargo elegido", async () => {
    const u = usuario();
    render(<SolicitudEvaluacionForm />);
    await u.selectOptions(screen.getByLabelText("Familia de cargo"), "Finanzas");
    await u.selectOptions(screen.getByLabelText("Nombre del cargo"), "Analista Contable");
    expect(screen.getByLabelText("Nombre del cargo")).toHaveValue("Analista Contable");

    await u.selectOptions(screen.getByLabelText("Familia de cargo"), "Comercial");
    expect(screen.getByLabelText("Nombre del cargo")).toHaveValue("");
  });

  it("rechaza un CV que no es PDF/DOC/DOCX", async () => {
    const u = usuario();
    render(<SolicitudEvaluacionForm />);
    await u.upload(screen.getByLabelText("Curriculum Vitae"), txt);
    await u.click(botonEnviar());
    expect(screen.getByText("El archivo debe ser formato PDF, DOC o DOCX.")).toBeInTheDocument();
  });

  it("con todos los datos válidos confirma el envío y limpia el formulario", async () => {
    const u = usuario();
    render(<SolicitudEvaluacionForm />);

    await u.type(screen.getByLabelText("Nombre del candidato"), "Juan Pérez");
    await u.selectOptions(screen.getByLabelText("Familia de cargo"), "Finanzas");
    await u.selectOptions(screen.getByLabelText("Nombre del cargo"), "Analista Contable");
    await u.upload(screen.getByLabelText("Curriculum Vitae"), pdf);
    expect(screen.getByText("cv-juan.pdf")).toBeInTheDocument(); // muestra el archivo elegido

    await u.click(botonEnviar());

    expect(screen.getByText(/La solicitud fue ingresada correctamente/)).toBeInTheDocument();
    expect(console.log).toHaveBeenCalledWith(
      "Datos de la solicitud:",
      expect.objectContaining({ nombreCandidato: "Juan Pérez", familiaCargo: "Finanzas", nombreCargo: "Analista Contable" })
    );
    // El formulario queda vacío para una nueva solicitud
    expect(screen.getByLabelText("Nombre del candidato")).toHaveValue("");
    expect(screen.getByLabelText("Familia de cargo")).toHaveValue("");
    expect(screen.queryByText("cv-juan.pdf")).not.toBeInTheDocument();
  });

  it("el mensaje de éxito desaparece al volver a editar", async () => {
    const u = usuario();
    render(<SolicitudEvaluacionForm />);
    await u.type(screen.getByLabelText("Nombre del candidato"), "Juan Pérez");
    await u.selectOptions(screen.getByLabelText("Familia de cargo"), "Finanzas");
    await u.selectOptions(screen.getByLabelText("Nombre del cargo"), "Analista Contable");
    await u.upload(screen.getByLabelText("Curriculum Vitae"), pdf);
    await u.click(botonEnviar());
    expect(screen.getByText(/ingresada correctamente/)).toBeInTheDocument();

    await u.type(screen.getByLabelText("Nombre del candidato"), "A");
    expect(screen.queryByText(/ingresada correctamente/)).not.toBeInTheDocument();
  });

  // Pendiente detectado al escribir estas pruebas: el formulario pasa disabled={!datos.familiaCargo}
  // a FormField, pero FormField no reenvía esa prop al <select>, así que nunca se deshabilita.
  it.todo("el select de cargo está deshabilitado hasta elegir una familia");
});
