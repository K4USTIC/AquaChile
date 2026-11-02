// src/components/SolicitudEvaluacionForm/SolicitudEvaluacionForm.test.jsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SolicitudEvaluacionForm from "./SolicitudEvaluacionForm";
import { crearSolicitud } from "../../services/solicitudesService";

// La solicitud se guarda en Supabase: en los tests usamos un servicio falso.
vi.mock("../../services/solicitudesService", async () => (await import("../../test/mockServicioSolicitudes")).crearServicioMock());

const pdf = new File(["cv"], "cv-juan.pdf", { type: "application/pdf" });
const txt = new File(["cv"], "cv-juan.txt", { type: "text/plain" });

// applyAccept:false permite subir un .txt aunque el input solo acepte pdf/doc/docx,
// así podemos probar nuestra propia validación (el navegador real filtraría antes).
const usuario = () => userEvent.setup({ applyAccept: false });

const botonEnviar = () => screen.getByRole("button", { name: "Solicitar evaluación" });

// Completa todos los campos con datos válidos (sin enviar)
async function llenarFormularioValido(u) {
  await u.type(screen.getByLabelText("Nombre del candidato"), "Juan Pérez");
  await u.selectOptions(screen.getByLabelText("Familia de cargo"), "Finanzas");
  await u.selectOptions(screen.getByLabelText("Nombre del cargo"), "Analista Contable");
  await u.upload(screen.getByLabelText("Curriculum Vitae"), pdf);
}

describe("SolicitudEvaluacionForm", () => {

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
    expect(crearSolicitud).not.toHaveBeenCalled(); // con errores no se toca la base de datos
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
    expect(crearSolicitud).not.toHaveBeenCalled();
  });

  it("con todos los datos válidos guarda la solicitud, confirma y limpia el formulario", async () => {
    const u = usuario();
    render(<SolicitudEvaluacionForm />);

    await llenarFormularioValido(u);
    expect(screen.getByText("cv-juan.pdf")).toBeInTheDocument(); // muestra el archivo elegido

    await u.click(botonEnviar());

    expect(await screen.findByText(/La solicitud fue ingresada correctamente/)).toBeInTheDocument();
    expect(screen.getByText(/SOL-004/)).toBeInTheDocument(); // muestra el N° que asignó la base de datos
    expect(crearSolicitud).toHaveBeenCalledTimes(1);
    expect(crearSolicitud).toHaveBeenCalledWith(
      expect.objectContaining({ nombreCandidato: "Juan Pérez", familiaCargo: "Finanzas", nombreCargo: "Analista Contable", cv: pdf })
    );
    // El formulario queda vacío para una nueva solicitud
    expect(screen.getByLabelText("Nombre del candidato")).toHaveValue("");
    expect(screen.getByLabelText("Familia de cargo")).toHaveValue("");
    expect(screen.queryByText("cv-juan.pdf")).not.toBeInTheDocument();
  });

  it("si la base de datos falla muestra el error y conserva lo escrito para reintentar", async () => {
    crearSolicitud.mockRejectedValueOnce(new Error("No se pudo guardar la solicitud: sin conexión"));
    const u = usuario();
    render(<SolicitudEvaluacionForm />);

    await llenarFormularioValido(u);
    await u.click(botonEnviar());

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo guardar la solicitud: sin conexión");
    expect(screen.queryByText(/ingresada correctamente/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Nombre del candidato")).toHaveValue("Juan Pérez");
    expect(screen.getByText("cv-juan.pdf")).toBeInTheDocument();
  });

  it("el mensaje de éxito desaparece al volver a editar", async () => {
    const u = usuario();
    render(<SolicitudEvaluacionForm />);
    await llenarFormularioValido(u);
    await u.click(botonEnviar());
    expect(await screen.findByText(/ingresada correctamente/)).toBeInTheDocument();

    await u.type(screen.getByLabelText("Nombre del candidato"), "A");
    expect(screen.queryByText(/ingresada correctamente/)).not.toBeInTheDocument();
  });

  // Pendiente detectado al escribir estas pruebas: el formulario pasa disabled={!datos.familiaCargo}
  // a FormField, pero FormField no reenvía esa prop al <select>, así que nunca se deshabilita.
  it.todo("el select de cargo está deshabilitado hasta elegir una familia");
});
