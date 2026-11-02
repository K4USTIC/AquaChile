// src/services/solicitudesService.js
// Toda la comunicación con Supabase vive aquí. Los componentes NO conocen Supabase:
// solo llaman a estas funciones. Así es fácil de testear y de cambiar.
import { supabase } from "../lib/supabaseClient";

const TABLA_SOLICITUDES = "solicitudes";
const TABLA_EVALUACIONES = "evaluaciones";
const BUCKET_CVS = "cvs";
const SEGUNDOS_URL_CV = 60; // la URL para descargar un CV caduca a los 60 segundos

export const MENSAJE_SIN_CONFIGURAR =
  "Supabase no está configurado. Revisa REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en el archivo .env.";

// La base guarda snake_case (familia_cargo); la app usa camelCase (familiaCargo).
export function mapearSolicitud(fila) {
  // Al pedir "evaluaciones(...)" junto a la solicitud, Supabase la devuelve como objeto o como arreglo
  const evaluacion = Array.isArray(fila.evaluaciones) ? fila.evaluaciones[0] : fila.evaluaciones;
  return {
    id: fila.id,
    candidato: fila.candidato,
    familiaCargo: fila.familia_cargo,
    cargo: fila.cargo,
    fechaSolicitud: fila.fecha_solicitud,
    estado: fila.estado,
    cvPath: fila.cv_path ?? null,
    evaluacion: evaluacion ? { resultado: evaluacion.resultado, informe: evaluacion.informe } : null,
  };
}

// "Currículum Juan Pérez.pdf" -> "Curriculum_Juan_Perez.pdf" (Storage no acepta tildes ni espacios en rutas)
export function nombreArchivoSeguro(nombre) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

// Fábrica: recibe el cliente de Supabase. En la app se usa el real; en los tests, uno falso.
export function createSolicitudesService(client) {
  function db() {
    if (!client) throw new Error(MENSAJE_SIN_CONFIGURAR);
    return client;
  }

  return {
    async listarSolicitudes() {
      const { data, error } = await db()
        .from(TABLA_SOLICITUDES)
        .select("*")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false });
      if (error) throw new Error(`No se pudieron cargar las solicitudes: ${error.message}`);
      return data.map(mapearSolicitud);
    },

    // Devuelve la solicitud (con su evaluación si ya existe) o null si el ID no existe
    async obtenerSolicitud(id) {
      const { data, error } = await db()
        .from(TABLA_SOLICITUDES)
        .select("*, evaluaciones(resultado, informe)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw new Error(`No se pudo cargar la solicitud: ${error.message}`);
      return data ? mapearSolicitud(data) : null;
    },

    // Sube el CV al Storage y luego inserta la fila. Si el insert falla, borra el CV subido.
    async crearSolicitud({ nombreCandidato, familiaCargo, nombreCargo, cv }) {
      const cliente = db();
      let cvPath = null;

      if (cv) {
        cvPath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${nombreArchivoSeguro(cv.name)}`;
        const { error: errorSubida } = await cliente.storage
          .from(BUCKET_CVS)
          .upload(cvPath, cv, { contentType: cv.type, upsert: false });
        if (errorSubida) throw new Error(`No se pudo subir el CV: ${errorSubida.message}`);
      }

      const { data, error } = await cliente
        .from(TABLA_SOLICITUDES)
        .insert({
          candidato: nombreCandidato.trim(),
          familia_cargo: familiaCargo,
          cargo: nombreCargo,
          cv_path: cvPath,
        })
        .select()
        .single();

      if (error) {
        if (cvPath) {
          try {
            await cliente.storage.from(BUCKET_CVS).remove([cvPath]);
          } catch {
            /* si no se puede limpiar, igual avisamos del error original */
          }
        }
        throw new Error(`No se pudo guardar la solicitud: ${error.message}`);
      }
      return mapearSolicitud(data);
    },

    // Guarda (o actualiza) el informe y marca la solicitud como Completada
    async guardarEvaluacion(id, { resultado, informe }) {
      const cliente = db();
      const { error } = await cliente
        .from(TABLA_EVALUACIONES)
        .upsert({ solicitud_id: id, resultado, informe }, { onConflict: "solicitud_id" });
      if (error) throw new Error(`No se pudo guardar la evaluación: ${error.message}`);

      const { error: errorEstado } = await cliente
        .from(TABLA_SOLICITUDES)
        .update({ estado: "Completada" })
        .eq("id", id);
      if (errorEstado) throw new Error(`No se pudo actualizar el estado: ${errorEstado.message}`);
    },

    // URL temporal para descargar el CV (el bucket es privado)
    async obtenerUrlCV(cvPath) {
      const { data, error } = await db().storage.from(BUCKET_CVS).createSignedUrl(cvPath, SEGUNDOS_URL_CV);
      if (error) throw new Error(`No se pudo obtener el CV: ${error.message}`);
      return data.signedUrl;
    },
  };
}

// Instancia lista para usar en la app (conectada al Supabase real)
export const {
  listarSolicitudes,
  obtenerSolicitud,
  crearSolicitud,
  guardarEvaluacion,
  obtenerUrlCV,
} = createSolicitudesService(supabase);
