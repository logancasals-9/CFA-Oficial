import test from 'node:test';
import assert from 'node:assert/strict';
import { ETIQUETAS_PUESTO_PROFESIONAL, ETIQUETAS_TIPO_CONTRATO, PROVINCIAS_ARGENTINA } from '../src/tipos/dominio.js';

function validarDatosEdicionOferta(formData) {
  const puestoBuscado = String(formData.get("puestoBuscado") ?? "");
  const categoria = String(formData.get("categoria") ?? "").trim();
  const tipoContrato = String(formData.get("tipoContrato") ?? "");
  const provincia = String(formData.get("provincia") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const posicionJuego = puestoBuscado === "jugador"
    ? (String(formData.get("posicionJuego") ?? "").trim() || null)
    : null;

  if (!puestoBuscado || !categoria || !tipoContrato || !provincia || !descripcion) {
    return { error: "Completá todos los campos obligatorios de la oferta." };
  }

  if (!ETIQUETAS_PUESTO_PROFESIONAL[puestoBuscado]) {
    return { error: "Puesto buscado inválido." };
  }

  if (!ETIQUETAS_TIPO_CONTRATO[tipoContrato]) {
    return { error: "Tipo de contrato inválido." };
  }

  if (!PROVINCIAS_ARGENTINA.includes(provincia)) {
    return { error: "Provincia inválida." };
  }

  return {
    datos: {
      puesto_buscado: puestoBuscado,
      posicion_juego: posicionJuego,
      categoria,
      tipo_contrato: tipoContrato,
      provincia,
      descripcion,
    }
  };
}

test('valida correctamente la edición de oferta con campos válidos', () => {
  const form = new FormData();
  form.set("puestoBuscado", "jugador");
  form.set("posicionJuego", "Delantero centro");
  form.set("categoria", "Primera Nacional");
  form.set("tipoContrato", "profesional");
  form.set("provincia", "Buenos Aires");
  form.set("descripcion", "Se busca delantero centro con experiencia en la categoría.");

  const resultado = validarDatosEdicionOferta(form);
  assert.equal(resultado.error, undefined);
  assert.equal(resultado.datos.puesto_buscado, "jugador");
  assert.equal(resultado.datos.posicion_juego, "Delantero centro");
  assert.equal(resultado.datos.categoria, "Primera Nacional");
  assert.equal(resultado.datos.descripcion, "Se busca delantero centro con experiencia en la categoría.");
});

test('rechaza edición de oferta si la descripción está vacía', () => {
  const form = new FormData();
  form.set("puestoBuscado", "jugador");
  form.set("categoria", "Primera Nacional");
  form.set("tipoContrato", "profesional");
  form.set("provincia", "Buenos Aires");
  form.set("descripcion", "   ");

  const resultado = validarDatosEdicionOferta(form);
  assert.ok(resultado.error);
  assert.match(resultado.error, /obligatorios/);
});

test('elimina la posición de juego si el puesto cambia a cuerpo técnico', () => {
  const form = new FormData();
  form.set("puestoBuscado", "director_tecnico");
  form.set("posicionJuego", "Delantero centro");
  form.set("categoria", "Primera");
  form.set("tipoContrato", "profesional");
  form.set("provincia", "Córdoba");
  form.set("descripcion", "Nuevo cuerpo técnico para la temporada 2026.");

  const resultado = validarDatosEdicionOferta(form);
  assert.equal(resultado.error, undefined);
  assert.equal(resultado.datos.puesto_buscado, "director_tecnico");
  assert.equal(resultado.datos.posicion_juego, null);
});
