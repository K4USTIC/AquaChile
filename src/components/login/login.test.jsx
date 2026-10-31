// src/components/login/login.test.jsx
import React from "react";
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./login";
import { renderEnRuta } from "../../test/renderConRutas";

const abrirLogin = () =>
  renderEnRuta(<Login />, { path: "/login", url: "/login", marcadores: { "/dashboard": "PÁGINA DASHBOARD" } });

describe("Login", () => {
  it("muestra el formulario de acceso", () => {
    abrirLogin();
    expect(screen.getByRole("heading", { name: "AquaChile" })).toBeInTheDocument();
    expect(screen.getByLabelText("Correo Institucional")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar al Panel" })).toBeInTheDocument();
  });

  it("al enviar vacío muestra ambos errores y no entra", async () => {
    abrirLogin();
    await userEvent.click(screen.getByRole("button", { name: "Ingresar al Panel" }));
    expect(screen.getByText("El correo es obligatorio.")).toBeInTheDocument();
    expect(screen.getByText("La contraseña es obligatoria.")).toBeInTheDocument();
    expect(screen.queryByText("PÁGINA DASHBOARD")).not.toBeInTheDocument();
  });

  it("rechaza un correo que no es institucional", async () => {
    abrirLogin();
    await userEvent.type(screen.getByLabelText("Correo Institucional"), "ana@gmail.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "AquaChile2026!");
    await userEvent.click(screen.getByRole("button", { name: "Ingresar al Panel" }));
    expect(screen.getByText(/solo para correos institucionales/)).toBeInTheDocument();
    expect(screen.queryByText("PÁGINA DASHBOARD")).not.toBeInTheDocument();
  });

  it("rechaza una contraseña débil", async () => {
    abrirLogin();
    await userEvent.type(screen.getByLabelText("Correo Institucional"), "ana@aquachile.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "abc");
    await userEvent.click(screen.getByRole("button", { name: "Ingresar al Panel" }));
    expect(screen.getByText("La contraseña debe tener al menos 8 caracteres.")).toBeInTheDocument();
    expect(screen.queryByText("PÁGINA DASHBOARD")).not.toBeInTheDocument();
  });

  it("con datos válidos navega al dashboard", async () => {
    abrirLogin();
    await userEvent.type(screen.getByLabelText("Correo Institucional"), "ana@aquachile.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "AquaChile2026!");
    await userEvent.click(screen.getByRole("button", { name: "Ingresar al Panel" }));
    expect(await screen.findByText("PÁGINA DASHBOARD")).toBeInTheDocument();
  });
});
