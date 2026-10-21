// src/utils/validaciones.js

// Funciones puras de validación, independientes de React,
// para que puedan reutilizarse o testearse por separado.

const TIPOS_ARCHIVO_PERMITIDOS = [
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

export function validarNombreCandidato(nombre) {
  if (!nombre || nombre.trim() === "") {
    return "El nombre del candidato es obligatorio.";
  }
  const partes = nombre.trim().split(/\s+/);
  if (partes.length < 2) {
    return "Ingrese nombre y apellido del candidato.";
  }
  return null;
}

export function validarFamiliaCargo(familia) {
  if (!familia || familia.trim() === "") {
    return "Debe seleccionar una familia de cargo.";
  }
  return null;
}

export function validarNombreCargo(cargo) {
  if (!cargo || cargo.trim() === "") {
    return "El nombre del cargo es obligatorio.";
  }
  return null;
}

export function validarArchivoCV(archivo) {
  if (!archivo) {
    return "Debe adjuntar el Curriculum Vitae.";
  }
  if (!TIPOS_ARCHIVO_PERMITIDOS.includes(archivo.type)) {
    return "El archivo debe ser formato PDF, DOC o DOCX.";
  }
  return null;
}

export function validarFormulario(datos) {
  return {
    nombreCandidato: validarNombreCandidato(datos.nombreCandidato),
    familiaCargo: validarFamiliaCargo(datos.familiaCargo),
    nombreCargo: validarNombreCargo(datos.nombreCargo),
    cv: validarArchivoCV(datos.cv),
  };
}

export function formularioTieneErrores(errores) {
  return Object.values(errores).some((error) => error !== null);
}
