// src/components/SolicitudEvaluacionForm/FormField.test.jsx
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FormField from "./FormField";

describe("FormField", () => {
  it("renderiza un input asociado a su label", () => {
    render(<FormField label="Nombre" name="nombre" value="" onChange={() => {}} />);
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre").tagName).toBe("INPUT");
  });

  it("muestra el placeholder y el valor recibido", () => {
    render(<FormField label="Nombre" name="nombre" value="Ana" placeholder="Ej: Juan" onChange={() => {}} />);
    expect(screen.getByLabelText("Nombre")).toHaveValue("Ana");
    expect(screen.getByPlaceholderText("Ej: Juan")).toBeInTheDocument();
  });

  it("avisa cuando el usuario escribe", async () => {
    const onChange = vi.fn();
    render(<FormField label="Nombre" name="nombre" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Nombre"), "ab");
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("como select, lista la opción por defecto y las opciones recibidas", () => {
    render(<FormField label="Familia" name="familia" as="select" value="" onChange={() => {}} options={["Finanzas", "Comercial"]} />);
    const select = screen.getByLabelText("Familia");
    expect(select.tagName).toBe("SELECT");
    expect(screen.getByRole("option", { name: "Seleccione una opción" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Finanzas" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Comercial" })).toBeInTheDocument();
  });

  it("muestra el mensaje de error y marca el campo", () => {
    render(<FormField label="Nombre" name="nombre" value="" onChange={() => {}} error="Campo obligatorio" />);
    expect(screen.getByText("Campo obligatorio")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveClass("form-field__input--error");
  });

  it("no muestra error cuando no hay", () => {
    render(<FormField label="Nombre" name="nombre" value="" onChange={() => {}} error={null} />);
    expect(screen.getByLabelText("Nombre")).not.toHaveClass("form-field__input--error");
  });
});
