import {
  campoRequerido,
  validarNumeros,
  validarCamposDeuda,
  campoRequeridoSelect,
} from "./validaciones.js";
import { Detalle } from "./detalle.js";
import { Deuda } from "./deuda.js";
import { Gasto } from "./gasto.js";
import {
  loadInfo,
  actualizarInfo,
  actualizarDeuda,
  loadDeudas,
  findDeuda,
  cargarDeuda,
  removeFromDeudas,
  cargarGasto
} from "./DB.js";

let info = await loadInfo(false);
let deudas;
loadDeudas(false).then((deudasC) => {
  deudas = deudasC;
  cargarTabla();
  document.getElementById("loadingSpinner").style.opacity = "0";
  setTimeout(()=>document.getElementById("loadingSpinner").style.display = "none",350);
});

let campoNombre = document.getElementById("nombre");
let campoImporte = document.getElementById("importe");
let campoComentario = document.getElementById("comentario");
let campoComentario2 = document.getElementById("comentarioCancelar");
let campoCuenta = document.getElementById("cuenta");
let campoCuentaAgregar = document.getElementById("cuentaAgregar");
let campoOrigen = document.getElementById("origen");
let formularioNuevaDeuda = document.getElementById("formularioAgregarDeuda");

campoNombre.addEventListener("blur", () => {
  campoRequerido(campoNombre);
});
campoImporte.addEventListener("blur", () => {
  campoRequerido(campoImporte);
  validarNumeros(campoImporte);
});
campoComentario.addEventListener("blur", () => {
  campoRequerido(campoComentario);
});
campoCuenta.addEventListener("blur", () => {
  campoRequeridoSelect(campoCuenta);
});
campoCuentaAgregar.addEventListener("blur", () => {
  campoRequeridoSelect(campoCuentaAgregar);
});
campoOrigen.addEventListener("blur", () => {
  campoRequeridoSelect(campoOrigen);
});
campoOrigen.addEventListener("change", () => {
  if (campoOrigen.value == "Plata papas") {
    campoCuentaAgregar.disabled = true;
    campoCuentaAgregar.value = "0";
  } else {
    campoCuentaAgregar.disabled = false;
  }
});

formularioNuevaDeuda.addEventListener("submit", agregarDeuda);

async function agregarDeuda(e) {
  e.preventDefault();

  if (validarCamposDeuda("form-control")) {
    await guardarDeuda();
  }
}

async function guardarDeuda() {
  let nombre = capitalizeFirstLetter(campoNombre.value);
  let comentario = campoComentario.value.trim();

  let detalle = new Detalle(
    campoImporte.value,
    comentario,
    campoOrigen.value,
    campoCuentaAgregar.value
  );

  let deuda = await findDeuda(nombre,"name");

  if (deuda != null) {
    deuda.lista.push(detalle);
    deuda.total += parseFloat(detalle.importe);

    await actualizarDeuda(deuda)
  } else {
    let nuevaDeuda = new Deuda(nombre, detalle);

    await cargarDeuda(nuevaDeuda);
  }

  if (campoCuentaAgregar.value != "None") {
    let cuenta = campoCuentaAgregar.value;

    if (cuenta == "Efectivo") info.saldoEfectivo -= parseFloat(detalle.importe);
    else if (cuenta == "TD") info.saldoTD -= parseFloat(detalle.importe);

    await actualizarInfo(info);
  }

  limpiarFormulario();

  Swal.fire({
    title: "Deuda agregada",
    text: "La deuda se ha agregado correctamente",
    icon: "success",
    timer: 2000,
    showCancelButton: false,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = "/pages/deudas.html";
  });
}

function limpiarFormulario() {
  campoNombre.value = "";
  campoImporte.value = "";
  campoComentario.value = "";
  campoOrigen.value = "";
  campoCuentaAgregar.value = "";
}

//mostrar fondeo de cuenta

function cargarTabla() {
    deudas.reverse();
    //cargar filas en tabla
    deudas.forEach((itemDeuda) => {
      crearFila(itemDeuda);
    });
}

function crearFila(deuda) {
  let fila = document.getElementById("tablaDeudas");

  let detalles = deuda.lista;

  for (let i = 0; i < detalles.length; i++) {
    if (i == 0) {
      fila.innerHTML += `
                <tr class="linea_${deuda.codigoDeudor}">
                <td id="cat_${deuda.nombre}"> </td>
                  <th >${deuda.nombre}</th>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>$ ${deuda.total}</td>
                  <td></td>
              </tr>`;
    }

    fila.innerHTML += `
              <tr class="linea_${deuda.codigoDeudor}">
              <td id="cat_${deuda.nombre}"> </td>
                <th> </th>
                <td>${deuda.lista[i].fecha}</td>
                <td>$ ${deuda.lista[i].importe}</td>
                <td>${deuda.lista[i].origen}</td>
                <td>${deuda.lista[i].comentario}</td>
                <td> </td>
                <td>
                  <button class="btn btn-danger my-1" data-bs-toggle="modal" data-bs-target="#modalCancelarDeuda" onclick="prepararCancelarDeuda('${deuda.codigoDeudor}','${deuda.lista[i].codigoDeuda}')">Cancelar</button>
                </td>
            </tr>`;
  }

  if (detalles.length > 0) {
    let lineas = document.getElementsByClassName(`linea_${deuda.codigoDeudor}`);
    for (let i = 0; i < lineas.length - 1; i++) {
      lineas[i].style.borderColor = "transparent";
    }
  }

  //hacer randomnizador de colores y probar todo esto

  let cat = document.getElementById(`cat_${deuda.nombre}`);
  let colorAleatorio = Math.floor(Math.random() * (5 - 1 + 1)) + 1;
  cat.style.backgroundColor = `var(--color${colorAleatorio})`;
}

window.prepararCancelarDeuda = async function (codigoDeudor, codigoDeuda) {
  location.href = "#cod1=" + codigoDeudor + "&cod2=" + codigoDeuda;

  let deuda = await findDeuda(codigoDeudor,"cod");

  let detalleIndex = deuda.lista.findIndex((itemDetalle) => {
    return itemDetalle.codigoDeuda == codigoDeuda;
  });

  let detalle = deuda.lista[detalleIndex];

  if (detalle.cuenta == "Efectivo") campoCuenta.value = "Efectivo";
  else if (detalle.cuenta == "TD") campoCuenta.value = "TD";
  else campoCuenta.value = "0";
};

let formularioCancelar = document.getElementById("formularioCancelarDeuda");
formularioCancelar.addEventListener("submit", cancelarDeuda);

async function cancelarDeuda(e) {
  e.preventDefault();

  if (campoRequeridoSelect(campoCuenta)) {
    let codDeudor = getDeudor();
    let codDeuda = getDeuda();

    let deudor = await findDeuda(codDeudor,"cod");

    let deudaIndex = deudor.lista.findIndex((itemDeuda) => {
      return itemDeuda.codigoDeuda == codDeuda;
    });

    let deuda = deudor.lista[deudaIndex];

    let comentarioDeuda = deuda.comentario;
    if (comentarioDeuda.includes(" - No agregar")) {
      comentarioDeuda = comentarioDeuda.replace(" - No agregar", "");
    }

    let importe = deuda.importe;
    let nombreDeudor = deudor.nombre;

    deudor.total -= parseFloat(deuda.importe);

    if (!document.getElementById("ignorar").checked) {
      if (campoCuenta.value == "Efectivo") {
        info.saldoEfectivo += parseFloat(importe);
      } else info.saldoTD += parseFloat(importe);

      actualizarInfo(info);
    }

    deudor.lista.splice(deudaIndex, 1);

    await actualizarDeuda(deudor);

    if (deudor.lista.length == 0) {
      await removeFromDeudas(deudor);
    }

    agregarATabla(
      importe,
      comentarioDeuda,
      nombreDeudor,
      document.getElementById("ignorar").checked
    );

    Swal.fire({
      title: "Deuda cancelada",
      text: "La deuda se ha cancelado correctamente",
      icon: "success",
      timer: 2000,
      showCancelButton: false,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "/pages/deudas.html";
    });
  }
}

async function agregarATabla(importe, comentarioDeuda, deudor, ignorar) {
  let comentario = comentarioDeuda;
  if (ignorar) {
    if (campoComentario2.value != "")
      comentario += " - " + campoComentario2.value;
  }
  let concepto = "Pago " + deudor;

  let gasto = new Gasto(concepto, "Pago de deuda", importe, "", "", comentario);

  await cargarGasto(gasto);

  if (!ignorar) {
    gasto = new Gasto(
      "Pago de deuda",
      "Fondeo",
      importe,
      "Plata propia",
      campoCuenta.value,
      campoComentario2.value
    );

    await cargarGasto(gasto);
  }
}

function getDeudor() {
  return location.href.split("=")[1].split("&")[0];
}

function getDeuda() {
  return location.href.split("=")[2];
}

function capitalizeFirstLetter(string) {
  string.toLowerCase();
  return string.charAt(0).toUpperCase() + string.slice(1);
}
