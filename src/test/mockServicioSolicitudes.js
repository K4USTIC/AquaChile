// src/test/mockServicioSolicitudes.js
// Servicio falso para los tests de componentes: responde con los datos de ejemplo
// sin tocar Supabase ni la red. Se usa dentro de vi.mock(...) en cada test.
import { vi } from "vitest";
import { MOCK_SOLICITUDES } from "../constants/mockSolicitudes";

export function crearServicioMock() {
  return {
    listarSolicitudes: vi.fn(async () => MOCK_SOLICITUDES.map((s) => ({ ...s }))),
    obtenerSolicitud: vi.fn(async (id) => {
      const solicitud = MOCK_SOLICITUDES.find((s) => s.id === id);
      return solicitud ? { ...solicitud, cvPath: "cvs/cv-ejemplo.pdf", evaluacion: null } : null;
    }),
    crearSolicitud: vi.fn(async () => ({ id: "SOL-004" })),
    guardarEvaluacion: vi.fn(async () => undefined),
    obtenerUrlCV: vi.fn(async () => "https://ejemplo.test/cv.pdf"),
  };
}
