// src/test/setup.js – se ejecuta antes de cada archivo de pruebas
import "@testing-library/jest-dom/vitest"; // agrega matchers como toBeInTheDocument()
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Limpia el DOM entre pruebas para que una no afecte a la siguiente
afterEach(() => cleanup());
