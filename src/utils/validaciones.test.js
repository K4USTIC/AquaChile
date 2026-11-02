// src/utils/validaciones.test.js
// Pruebas unitarias de las funciones puras de validación (no necesitan React).
import { describe, it, expect } from "vitest";
import {
  validarNombreCandidato,
  validarFamiliaCargo,
  validarNombreCargo,
  validarArchivoCV,
  validarFormulario,
  formularioTieneErrores,
  validarCorreoInstitucional,
  validarPasswordSegura,
  validarFormularioLogin,
} from "./validaciones";

const archivo = (nombre, tipo) => new File(["contenido"], nombre, { type: tipo });

describe("validarNombreCandidato", () => {
  it("acepta nombre y apellido", () => {
    expect(validarNombreCandidato("Juan Pérez")).toBeNull();
  });
  it("acepta más de dos palabras y espacios extra", () => {
    expect(validarNombreCandidato("  María   José  González ")).toBeNull();
  });
  it.each([["vacío", ""], ["solo espacios", "   "], ["undefined", undefined], ["null", null]])(
    "rechaza un nombre %s como obligatorio",
    (_caso, valor) => {
      expect(validarNombreCandidato(valor)).toBe("El nombre del candidato es obligatorio.");
    }
  );
  it("rechaza un nombre sin apellido", () => {
    expect(validarNombreCandidato("Juan")).toBe("Ingrese nombre y apellido del candidato.");
  });
});

describe("validarFamiliaCargo", () => {
  it("acepta una familia seleccionada", () => {
    expect(validarFamiliaCargo("Finanzas")).toBeNull();
  });
  it.each([["", ""], ["espacios", "  "], ["undefined", undefined]])("rechaza %s", (_c, valor) => {
    expect(validarFamiliaCargo(valor)).toBe("Debe seleccionar una familia de cargo.");
  });
});

describe("validarNombreCargo", () => {
  it("acepta un cargo", () => {
    expect(validarNombreCargo("Analista Contable")).toBeNull();
  });
  it.each([["", ""], ["espacios", "  "], ["undefined", undefined]])("rechaza %s", (_c, valor) => {
    expect(validarNombreCargo(valor)).toBe("El nombre del cargo es obligatorio.");
  });
});

describe("validarArchivoCV", () => {
  it.each([
    ["PDF", "cv.pdf", "application/pdf"],
    ["DOC", "cv.doc", "application/msword"],
    ["DOCX", "cv.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ])("acepta un archivo %s", (_t, nombre, tipo) => {
    expect(validarArchivoCV(archivo(nombre, tipo))).toBeNull();
  });
  it("exige adjuntar el CV", () => {
    expect(validarArchivoCV(null)).toBe("Debe adjuntar el Curriculum Vitae.");
  });
  it.each([["texto plano", "cv.txt", "text/plain"], ["imagen", "cv.png", "image/png"]])(
    "rechaza un archivo de tipo %s",
    (_t, nombre, tipo) => {
      expect(validarArchivoCV(archivo(nombre, tipo))).toBe("El archivo debe ser formato PDF, DOC o DOCX.");
    }
  );
});

describe("validarFormulario y formularioTieneErrores", () => {
  const datosValidos = {
    nombreCandidato: "Juan Pérez",
    familiaCargo: "Finanzas",
    nombreCargo: "Analista Contable",
    cv: archivo("cv.pdf", "application/pdf"),
  };

  it("un formulario completo no tiene errores", () => {
    const errores = validarFormulario(datosValidos);
    expect(errores).toEqual({ nombreCandidato: null, familiaCargo: null, nombreCargo: null, cv: null });
    expect(formularioTieneErrores(errores)).toBe(false);
  });

  it("un formulario vacío reporta un error por cada campo", () => {
    const errores = validarFormulario({ nombreCandidato: "", familiaCargo: "", nombreCargo: "", cv: null });
    expect(Object.values(errores).every((e) => typeof e === "string")).toBe(true);
    expect(formularioTieneErrores(errores)).toBe(true);
  });

  it("detecta un único error entre campos válidos", () => {
    const errores = validarFormulario({ ...datosValidos, cv: null });
    expect(errores.cv).toBe("Debe adjuntar el Curriculum Vitae.");
    expect(errores.nombreCandidato).toBeNull();
    expect(formularioTieneErrores(errores)).toBe(true);
  });

  it("formularioTieneErrores es false con un objeto sin errores o vacío", () => {
    expect(formularioTieneErrores({ a: null, b: null })).toBe(false);
    expect(formularioTieneErrores({})).toBe(false);
  });
});

describe("validarCorreoInstitucional", () => {
  it("acepta un correo @aquachile.com", () => {
    expect(validarCorreoInstitucional("ana@aquachile.com")).toBeNull();
  });
  it("exige el correo", () => {
    expect(validarCorreoInstitucional("")).toBe("El correo es obligatorio.");
    expect(validarCorreoInstitucional("   ")).toBe("El correo es obligatorio.");
  });
  it("rechaza dominios que no son institucionales", () => {
    expect(validarCorreoInstitucional("ana@gmail.com")).toBe(
      "Acceso permitido solo para correos institucionales (@aquachile.com)."
    );
  });
});

describe("validarPasswordSegura", () => {
  it("acepta una contraseña que cumple todas las reglas", () => {
    expect(validarPasswordSegura("AquaChile2026!")).toBeNull();
  });
  it.each([
    ["vacía", "", "La contraseña es obligatoria."],
    ["corta (menos de 8)", "Aa1!aaa", "La contraseña debe tener al menos 8 caracteres."],
    ["sin mayúscula", "aquachile2026!", "Debe incluir al menos una letra mayúscula."],
    ["sin minúscula", "AQUACHILE2026!", "Debe incluir al menos una letra minúscula."],
    ["sin número", "AquaChile!!!!", "Debe incluir al menos un número."],
    ["sin carácter especial", "AquaChile2026", "Debe incluir al menos un carácter especial (ej: @, #, $, %)."],
  ])("rechaza una contraseña %s", (_caso, valor, mensaje) => {
    expect(validarPasswordSegura(valor)).toBe(mensaje);
  });
  it("acepta exactamente 8 caracteres si cumple las demás reglas", () => {
    expect(validarPasswordSegura("Aa1!aaaa")).toBeNull();
  });
});

describe("validarFormularioLogin", () => {
  it("devuelve null en ambos campos con datos válidos", () => {
    expect(validarFormularioLogin({ correo: "ana@aquachile.com", password: "AquaChile2026!" })).toEqual({
      correo: null,
      password: null,
    });
  });
  it("devuelve un error por cada campo inválido", () => {
    const errores = validarFormularioLogin({ correo: "", password: "" });
    expect(errores.correo).toBe("El correo es obligatorio.");
    expect(errores.password).toBe("La contraseña es obligatoria.");
  });
});
