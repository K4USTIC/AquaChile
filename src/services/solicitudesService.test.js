// src/services/solicitudesService.test.js
// Prueba la "capa de base de datos" con un cliente de Supabase FALSO:
// verificamos qué tabla/columnas se consultan y cómo se transforman las respuestas,
// sin internet y sin tocar tu base real.
import { describe, it, expect, vi } from "vitest";
import {
  createSolicitudesService,
  mapearSolicitud,
  nombreArchivoSeguro,
  MENSAJE_SIN_CONFIGURAR,
} from "./solicitudesService";

// ---- Cliente falso -------------------------------------------------------
// Una consulta falsa: cada método (select, eq, ...) devuelve la misma consulta para poder encadenar,
// y al hacer "await" entrega el resultado que le indicamos (como lo haría Supabase).
function crearConsulta(resultado) {
  const consulta = {};
  ["select", "order", "eq", "insert", "update", "upsert", "single", "maybeSingle"].forEach((metodo) => {
    consulta[metodo] = vi.fn(() => consulta);
  });
  consulta.then = (resolver, rechazar) => Promise.resolve(resultado).then(resolver, rechazar);
  return consulta;
}

// resultados: { solicitudes: { data, error }, evaluaciones: { data, error } }
// storage:    { upload, createSignedUrl, remove } (resultados que devuelve el Storage)
function crearClienteFalso({ resultados = {}, storage = {} } = {}) {
  const consultas = {};
  const bucket = {
    upload: vi.fn(async () => storage.upload ?? { data: {}, error: null }),
    createSignedUrl: vi.fn(async () => storage.createSignedUrl ?? { data: { signedUrl: "https://ejemplo.test/firmada" }, error: null }),
    remove: vi.fn(async () => storage.remove ?? { data: [], error: null }),
  };
  const cliente = {
    from: vi.fn((tabla) => {
      consultas[tabla] = crearConsulta(resultados[tabla] ?? { data: null, error: null });
      return consultas[tabla];
    }),
    storage: { from: vi.fn(() => bucket) },
  };
  return { cliente, consultas, bucket };
}

const FILA_DB = {
  id: "SOL-001",
  candidato: "Juan Pérez",
  familia_cargo: "Recursos Humanos",
  cargo: "Analista de Selección",
  fecha_solicitud: "2026-10-05",
  estado: "Pendiente",
  cv_path: "123-abc-cv.pdf",
};

// ---- Funciones puras -----------------------------------------------------
describe("mapearSolicitud", () => {
  it("convierte las columnas de la base (snake_case) al formato de la app (camelCase)", () => {
    expect(mapearSolicitud(FILA_DB)).toEqual({
      id: "SOL-001",
      candidato: "Juan Pérez",
      familiaCargo: "Recursos Humanos",
      cargo: "Analista de Selección",
      fechaSolicitud: "2026-10-05",
      estado: "Pendiente",
      cvPath: "123-abc-cv.pdf",
      evaluacion: null,
    });
  });

  it("si no hay CV deja cvPath en null", () => {
    expect(mapearSolicitud({ ...FILA_DB, cv_path: null }).cvPath).toBeNull();
  });

  it("incluye la evaluación cuando viene como objeto", () => {
    const fila = { ...FILA_DB, evaluaciones: { resultado: "Apto", informe: "Muy bien" } };
    expect(mapearSolicitud(fila).evaluacion).toEqual({ resultado: "Apto", informe: "Muy bien" });
  });

  it("incluye la evaluación cuando viene dentro de un arreglo", () => {
    const fila = { ...FILA_DB, evaluaciones: [{ resultado: "No Apto", informe: "Revisar" }] };
    expect(mapearSolicitud(fila).evaluacion).toEqual({ resultado: "No Apto", informe: "Revisar" });
  });

  it("un arreglo vacío de evaluaciones significa que aún no hay evaluación", () => {
    expect(mapearSolicitud({ ...FILA_DB, evaluaciones: [] }).evaluacion).toBeNull();
  });
});

describe("nombreArchivoSeguro", () => {
  it("quita tildes y reemplaza espacios y símbolos por guion bajo", () => {
    expect(nombreArchivoSeguro("Currículum Juan Pérez.pdf")).toBe("Curriculum_Juan_Perez.pdf");
    expect(nombreArchivoSeguro("cv (final)#2.docx")).toBe("cv__final__2.docx");
  });
});

// ---- Servicio ------------------------------------------------------------
describe("solicitudesService sin configurar", () => {
  it("si no hay cliente de Supabase avisa con un mensaje claro", async () => {
    const servicio = createSolicitudesService(null);
    await expect(servicio.listarSolicitudes()).rejects.toThrow(MENSAJE_SIN_CONFIGURAR);
    await expect(servicio.obtenerSolicitud("SOL-001")).rejects.toThrow(MENSAJE_SIN_CONFIGURAR);
  });
});

describe("listarSolicitudes", () => {
  it("consulta la tabla solicitudes, de la más nueva a la más antigua, y entrega el formato de la app", async () => {
    const { cliente, consultas } = crearClienteFalso({ resultados: { solicitudes: { data: [FILA_DB], error: null } } });
    const lista = await createSolicitudesService(cliente).listarSolicitudes();

    expect(cliente.from).toHaveBeenCalledWith("solicitudes");
    expect(consultas.solicitudes.select).toHaveBeenCalledWith("*");
    expect(consultas.solicitudes.order).toHaveBeenCalledWith("created_at", { ascending: false });
    expect(lista).toHaveLength(1);
    expect(lista[0].familiaCargo).toBe("Recursos Humanos");
  });

  it("devuelve un arreglo vacío si no hay solicitudes", async () => {
    const { cliente } = crearClienteFalso({ resultados: { solicitudes: { data: [], error: null } } });
    expect(await createSolicitudesService(cliente).listarSolicitudes()).toEqual([]);
  });

  it("si Supabase responde con error, lo informa", async () => {
    const { cliente } = crearClienteFalso({ resultados: { solicitudes: { data: null, error: { message: "sin permiso" } } } });
    await expect(createSolicitudesService(cliente).listarSolicitudes()).rejects.toThrow(
      "No se pudieron cargar las solicitudes: sin permiso"
    );
  });
});

describe("obtenerSolicitud", () => {
  it("busca por ID e incluye la evaluación asociada", async () => {
    const { cliente, consultas } = crearClienteFalso({ resultados: { solicitudes: { data: FILA_DB, error: null } } });
    const solicitud = await createSolicitudesService(cliente).obtenerSolicitud("SOL-001");

    expect(consultas.solicitudes.select).toHaveBeenCalledWith("*, evaluaciones(resultado, informe)");
    expect(consultas.solicitudes.eq).toHaveBeenCalledWith("id", "SOL-001");
    expect(solicitud.id).toBe("SOL-001");
  });

  it("devuelve null si el ID no existe", async () => {
    const { cliente } = crearClienteFalso({ resultados: { solicitudes: { data: null, error: null } } });
    expect(await createSolicitudesService(cliente).obtenerSolicitud("SOL-999")).toBeNull();
  });

  it("si Supabase responde con error, lo informa", async () => {
    const { cliente } = crearClienteFalso({ resultados: { solicitudes: { data: null, error: { message: "caído" } } } });
    await expect(createSolicitudesService(cliente).obtenerSolicitud("SOL-001")).rejects.toThrow(
      "No se pudo cargar la solicitud: caído"
    );
  });
});

describe("crearSolicitud", () => {
  const cv = new File(["cv"], "Currículum Juan.pdf", { type: "application/pdf" });
  const datos = {
    nombreCandidato: "  Juan Pérez ",
    familiaCargo: "Recursos Humanos",
    nombreCargo: "Analista de Selección",
    cv,
  };

  it("sube el CV al bucket «cvs» y guarda la solicitud con la ruta del archivo", async () => {
    const { cliente, consultas, bucket } = crearClienteFalso({
      resultados: { solicitudes: { data: { ...FILA_DB, id: "SOL-004" }, error: null } },
    });
    const creada = await createSolicitudesService(cliente).crearSolicitud(datos);

    expect(cliente.storage.from).toHaveBeenCalledWith("cvs");
    const [ruta, archivo, opciones] = bucket.upload.mock.calls[0];
    expect(ruta).toMatch(/^\d+-[a-z0-9]+-Curriculum_Juan\.pdf$/);
    expect(archivo).toBe(cv);
    expect(opciones).toEqual({ contentType: "application/pdf", upsert: false });

    expect(consultas.solicitudes.insert).toHaveBeenCalledWith({
      candidato: "Juan Pérez", // sin espacios sobrantes
      familia_cargo: "Recursos Humanos",
      cargo: "Analista de Selección",
      cv_path: ruta,
    });
    expect(creada.id).toBe("SOL-004");
  });

  it("si falla la subida del CV no guarda la solicitud", async () => {
    const { cliente } = crearClienteFalso({ storage: { upload: { data: null, error: { message: "archivo muy grande" } } } });
    await expect(createSolicitudesService(cliente).crearSolicitud(datos)).rejects.toThrow(
      "No se pudo subir el CV: archivo muy grande"
    );
    expect(cliente.from).not.toHaveBeenCalled();
  });

  it("si falla el guardado, borra el CV que ya se había subido", async () => {
    const { cliente, bucket } = crearClienteFalso({
      resultados: { solicitudes: { data: null, error: { message: "violación de política" } } },
    });
    await expect(createSolicitudesService(cliente).crearSolicitud(datos)).rejects.toThrow(
      "No se pudo guardar la solicitud: violación de política"
    );
    const rutaSubida = bucket.upload.mock.calls[0][0];
    expect(bucket.remove).toHaveBeenCalledWith([rutaSubida]);
  });
});

describe("guardarEvaluacion", () => {
  it("guarda el informe y marca la solicitud como Completada", async () => {
    const { cliente, consultas } = crearClienteFalso();
    await createSolicitudesService(cliente).guardarEvaluacion("SOL-001", { resultado: "Apto", informe: "Excelente" });

    expect(consultas.evaluaciones.upsert).toHaveBeenCalledWith(
      { solicitud_id: "SOL-001", resultado: "Apto", informe: "Excelente" },
      { onConflict: "solicitud_id" }
    );
    expect(consultas.solicitudes.update).toHaveBeenCalledWith({ estado: "Completada" });
    expect(consultas.solicitudes.eq).toHaveBeenCalledWith("id", "SOL-001");
  });

  it("si falla al guardar el informe, no cambia el estado de la solicitud", async () => {
    const { cliente } = crearClienteFalso({ resultados: { evaluaciones: { data: null, error: { message: "rechazado" } } } });
    await expect(
      createSolicitudesService(cliente).guardarEvaluacion("SOL-001", { resultado: "Apto", informe: "x" })
    ).rejects.toThrow("No se pudo guardar la evaluación: rechazado");
    expect(cliente.from).not.toHaveBeenCalledWith("solicitudes");
  });
});

describe("obtenerUrlCV", () => {
  it("pide una URL temporal de 60 segundos", async () => {
    const { cliente, bucket } = crearClienteFalso();
    const url = await createSolicitudesService(cliente).obtenerUrlCV("123-abc-cv.pdf");

    expect(bucket.createSignedUrl).toHaveBeenCalledWith("123-abc-cv.pdf", 60);
    expect(url).toBe("https://ejemplo.test/firmada");
  });

  it("si no se puede firmar la URL, lo informa", async () => {
    const { cliente } = crearClienteFalso({ storage: { createSignedUrl: { data: null, error: { message: "no existe" } } } });
    await expect(createSolicitudesService(cliente).obtenerUrlCV("x.pdf")).rejects.toThrow("No se pudo obtener el CV: no existe");
  });
});
