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

// VALIDACIONES PARA EL LOGIN

export function validarCorreoInstitucional(correo) {
  if (!correo || correo.trim() === "") {
    return "El correo es obligatorio.";
  }
  if (!correo.includes("@aquachile.com")) {
    return "Acceso permitido solo para correos institucionales (@aquachile.com).";
  }
  return null;
}

export function validarPasswordSegura(password) {
  if (!password || password.trim() === "") {
    return "La contraseña es obligatoria.";
  }
  if (password.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Debe incluir al menos una letra mayúscula.";
  }
  if (!/[a-z]/.test(password)) {
    return "Debe incluir al menos una letra minúscula.";
  }
  if (!/\d/.test(password)) {
    return "Debe incluir al menos un número.";
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return "Debe incluir al menos un carácter especial (ej: @, #, $, %).";
  }
  return null;
}

export function validarFormularioLogin(datos) {
  return {
    correo: validarCorreoInstitucional(datos.correo),
    password: validarPasswordSegura(datos.password),
  };
}