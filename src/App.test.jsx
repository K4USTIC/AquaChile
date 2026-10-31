// src/App.test.jsx – pruebas de integración: navegación entre pantallas con el router real
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// App usa BrowserRouter, que lee la URL del navegador simulado: la fijamos antes de renderizar
function abrirApp(url = "/") {
  window.history.pushState({}, "", url);
  return render(<App />);
}

describe("App (navegación)", () => {
  beforeEach(() => window.history.pushState({}, "", "/"));

  it("la raíz muestra la portada", () => {
    abrirApp("/");
    expect(screen.getByRole("heading", { name: "Conectamos el talento del Sur de Chile" })).toBeInTheDocument();
    expect(screen.getByText("AQUACHILE")).toBeInTheDocument();
  });

  it("el botón LOGIN de la portada lleva al login", async () => {
    abrirApp("/");
    await userEvent.click(screen.getByRole("button", { name: "LOGIN" }));
    expect(await screen.findByLabelText("Correo Institucional")).toBeInTheDocument();
  });

  it("el botón FORMULARIO de la portada lleva al formulario de solicitud", async () => {
    abrirApp("/");
    await userEvent.click(screen.getByRole("button", { name: "FORMULARIO" }));
    expect(await screen.findByRole("heading", { name: "Solicitud de Evaluación Psicolaboral" })).toBeInTheDocument();
  });

  it("flujo completo: login válido -> dashboard con el layout privado", async () => {
    abrirApp("/login");
    await userEvent.type(screen.getByLabelText("Correo Institucional"), "ana@aquachile.com");
    await userEvent.type(screen.getByLabelText("Contraseña"), "AquaChile2026!");
    await userEvent.click(screen.getByRole("button", { name: "Ingresar al Panel" }));

    expect(await screen.findByRole("heading", { name: "Panel de Evaluación Psicolaboral" })).toBeInTheDocument();
    expect(screen.getByText("AquaChile · Portal Evaluadores")).toBeInTheDocument();
  });

  it("las pestañas del layout filtran el dashboard", async () => {
    abrirApp("/dashboard");
    expect(screen.getByRole("heading", { name: "Listado de Todos los Candidatos" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: "Pendientes" }));
    expect(await screen.findByRole("heading", { name: "Candidatos Pendientes" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("link", { name: "Completados" }));
    expect(await screen.findByRole("heading", { name: "Evaluaciones Completadas" })).toBeInTheDocument();
  });

  it("desde el dashboard se llega al detalle y se puede volver", async () => {
    abrirApp("/dashboard/pendientes");
    await userEvent.click(screen.getByRole("button", { name: "Evaluar" }));
    expect(await screen.findByText("Solicitud: SOL-001")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Volver al Dashboard/ }));
    expect(await screen.findByRole("heading", { name: "Panel de Evaluación Psicolaboral" })).toBeInTheDocument();
  });

  it("«Cerrar Sesión» vuelve a la portada", async () => {
    abrirApp("/dashboard");
    await userEvent.click(screen.getByRole("button", { name: "Cerrar Sesión" }));
    expect(await screen.findByRole("heading", { name: "Conectamos el talento del Sur de Chile" })).toBeInTheDocument();
  });

  it("una URL inexistente redirige a la portada", () => {
    abrirApp("/ruta-que-no-existe");
    expect(screen.getByRole("heading", { name: "Conectamos el talento del Sur de Chile" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/");
  });
});
