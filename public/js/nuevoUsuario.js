import {
  validarCamposNuevoUsuario,
  validarNumeros,
  campoRequerido,
} from "./validaciones.js";
import { User } from "./user.js";
import { cargarInfo } from "./DB.js";

let campoNombre = document.getElementById("nombre");
let campoSaldoEfectivo = document.getElementById("saldoEfectivo");
let campoSaldoTD = document.getElementById("saldoTD");
let campoLimite = document.getElementById("limite");
let formulario = document.getElementById("nuevoUsuario");

campoNombre.addEventListener("blur", () => {
  campoRequerido(campoNombre);
});
campoSaldoEfectivo.addEventListener("blur", () => {
  campoRequerido(campoSaldoEfectivo);
  validarNumeros(campoSaldoEfectivo);
});
campoSaldoTD.addEventListener("blur", () => {
  campoRequerido(campoSaldoTD);
  validarNumeros(campoSaldoTD);
});
campoLimite.addEventListener("blur", () => {
  campoRequerido(campoSaldoTD);
  validarNumeros(campoSaldoTD);
});

formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  if (validarCamposNuevoUsuario()) {
    guardar();
  }
});

function guardar() {
  let nuevoUsuario = new User(
    capitalizeFirstLetter(campoNombre.value),
    campoSaldoEfectivo.value,
    campoSaldoTD.value,
    campoLimite.value,
  );

  cargarInfo(nuevoUsuario);
}

function capitalizeFirstLetter(string) {
  string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}
