import { campoRequerido } from "./validaciones.js";
import { validarCampos } from "./validaciones.js";
import { validarNumeros } from "./validaciones.js";
import { campoRequeridoSelect } from "./validaciones.js";
import {
  loadInfo,
  actualizarInfo,
  actualizarGasto,
  findGasto
} from "./DB.js";

let campoConcepto = document.getElementById("concepto");
let campoCategoria = document.getElementById("categoria");
let campoImporte = document.getElementById("importe");
let campoPago = document.getElementById("pago");
let campoOrigen = document.getElementById("origen");
let campoComentario = document.getElementById("comentario");
let formulario = document.getElementById("nuevoGasto");
let invImp = document.getElementById("invalidImporte");
document.getElementById("disponible").style.display = "none";

let info = await loadInfo(false);
let gasto;
traerInfo().then(gastoC => {
  gasto = gastoC;
  document.getElementById("loadingSpinner").style.opacity = "0";
  setTimeout(()=>document.getElementById("loadingSpinner").style.display = "none",350);
});

async function traerInfo() {
  let id = getId();

  let gasto = await findGasto(id);

  campoConcepto.value = gasto.concepto;
  campoCategoria.value = gasto.categoria;
  campoImporte.value = gasto.importe;
  campoOrigen.value = gasto.origen;
  campoPago.value = gasto.pago;

  //eliminar "modificado" del comentario
  let comentario = gasto.comentario;
  let index;
  index = comentario.indexOf("(Modificado)");
  if (index != -1) {
    comentario = comentario.substring(0, index);
  }
  campoComentario.value = comentario;

  if(gasto.origen == "Plata ajena") campoPago.disabled = true;

  return gasto;
}

function getId() {
  let url = new URL(window.location.href);
  let search_params = url.searchParams;

  let id = search_params.get("cod");

  return id;
}

campoConcepto.addEventListener("blur", () => {
  campoRequerido(campoConcepto);
});
campoCategoria.addEventListener("blur", () => {
  campoRequeridoSelect(campoCategoria);
});
campoImporte.addEventListener("blur", () => {
  invImp.innerHTML = "El importe es requerido";
  campoRequerido(campoImporte);
  validarNumeros(campoImporte);
});
campoOrigen.addEventListener("change", () => {
  if (campoOrigen.value == "Plata papas") {
    document.getElementById("pagoTD").disabled = true;
  } else document.getElementById("pagoTD").disabled = false;

  if(campoOrigen.value == "Plata ajena"){
    campoPago.value = "Otro";
    campoPago.disabled = true;
  }
  else campoPago.disabled = false;
});
campoPago.addEventListener("change", () => {
  document.getElementById("disponible").style.display = "none";

  let campo = document.getElementById("saldoDisponible");
  switch (campoOrigen.value) {
    case "Efectivo": {
      document.getElementById("disponible").style.display = "block";
      campo.innerHTML = info.saldoEfectivo;
      break;
    }
    case "TD": {
      document.getElementById("disponible").style.display = "block";
      campo.innerHTML = info.saldoTD;
      break;
    }
  }
});
campoOrigen.addEventListener("blur", () => {
  campoRequeridoSelect(campoOrigen);
});
campoPago.addEventListener("blur", () => {
  campoRequeridoSelect(campoPago);
});
formulario.addEventListener("submit", guardarGasto);

async function guardarGasto(e) {
  e.preventDefault();
  invImp.innerHTML = "El importe es requerido";

  if (validarCampos()) {
    let importe = parseFloat(campoImporte.value);

    info = resetearSaldos(info);

    switch (campoOrigen.value) {
      case "Efectivo": {
        let saldoDisp = parseFloat(info.saldoEfectivo);

        if (importe > saldoDisp) {
          invImp.innerHTML =
            "El importe no puede ser mayor al fondo disponible";
          campoImporte.className = "form-control is-invalid";
          return;
        }

        break;
      }
      case "TD": {
        let saldoDisp = parseFloat(info.saldoTD);

        if (importe > saldoDisp) {
          invImp.innerHTML =
            "El importe no puede ser mayor al fondo disponible";
          campoImporte.className = "form-control is-invalid";
          return;
        }

        break;
      }
    }

    await editarGasto();
  }
}

function resetearSaldos(info) {
  switch (gasto.pago) {
    case "Efectivo": {
      info.saldoEfectivo += parseFloat(gasto.importe);
      break;
    }
    case "TC": {
      info.gastoTC -= parseFloat(gasto.importe);
      break;
    }
    case "TD": {
      info.saldoTD += parseFloat(gasto.importe);
      break;
    }
  }

  return info;
}

async function editarGasto() {
  let comentario = campoComentario.value.trim();

  if (comentario != "") {
    //eliminar "modificado" del comentario
    let index = comentario.indexOf("(Modificado)");
    if (index != -1) {
      comentario = comentario.substring(0, index);
    }

    comentario += " (Modificado)";
  } else comentario = "(Modificado)";

  gasto.concepto = campoConcepto.value;
  gasto.categoria = campoCategoria.value;
  gasto.importe = campoImporte.value;
  gasto.origen = campoOrigen.value;
  gasto.pago = campoPago.value;
  gasto.comentario = comentario;

  if (gasto.pago == "TC" && gasto.origen == "Plata propia") gasto.debo = true;
  else gasto.debo = false;

  await actualizarGasto(gasto);

  await descontarDinero(campoOrigen.value, campoPago.value, campoImporte.value);

  limpiarFormulario();

  Swal.fire({
    title: "Exito",
    text: "Gasto modificado correctamente",
    icon: "success",
    timer: 2000,
    showCancelButton: false,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = "/pages/tablas.html";
  });
}

function limpiarFormulario() {
  campoConcepto.value = "";
  campoCategoria.value = "0";
  campoImporte.value = "";
  campoPago.value = "0";
  campoOrigen.value = "0";
  campoComentario.value = "";

  document.getElementById("disponible").style.display = "none";
}

async function descontarDinero(origen, pago, importe) {
  if (origen == "Plata propia" && pago == "Efectivo") {
    info.saldoEfectivo -= parseFloat(importe);
  } else if (pago == "TC") {
    info.gastoTC += parseFloat(importe);
  } else if (pago == "TD") {
    info.saldoTD -= parseFloat(importe);
  }
  
  await actualizarInfo(info);
}
