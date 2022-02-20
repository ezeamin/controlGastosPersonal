import { campoRequerido } from "./validaciones.js";
import { validarCampos } from "./validaciones.js";
import { validarNumeros } from "./validaciones.js";
import { campoRequeridoSelect } from "./validaciones.js";
import { Gasto } from "./gasto.js";
import { loadInfo, actualizarInfo, cargarGasto } from "./DB.js";

let campoConcepto = document.getElementById("concepto");
let campoCategoria = document.getElementById("categoria");
let campoImporte = document.getElementById("importe");
let campoPago = document.getElementById("pago");
let campoOrigen = document.getElementById("origen");
let campoComentario = document.getElementById("comentario");
let formulario = document.getElementById("nuevoGasto");
let invImp = document.getElementById("invalidImporte");
document.getElementById("disponible").style.display = "none";

document.getElementById("loadingScreen").style.display = "none";
let info = await loadInfo(true);

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
  if(campoOrigen.value == "Plata papas"){
    document.getElementById("pagoTD").disabled = true; 
  }
  else document.getElementById("pagoTD").disabled = false;
  
  if(campoOrigen.value == "Plata ajena"){
    campoPago.value = "Otro";
    campoPago.disabled = true;
  }
  else campoPago.disabled = false;

  activarSaldoDisponible();
});
campoPago.addEventListener("change", () => {
  document.getElementById("disponible").style.display = "none";

  activarSaldoDisponible();
});
campoOrigen.addEventListener("blur", () => {
  campoRequeridoSelect(campoOrigen);
});
campoPago.addEventListener("blur", () => {
  campoRequeridoSelect(campoPago);
});
document.getElementById("user").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
});
document.getElementById("index").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
});

formulario.addEventListener("submit", guardarGasto);

function activarSaldoDisponible(){
  if(campoOrigen.value == "Plata propia"){
    let campo = document.getElementById("saldoDisponible");
    switch (campoPago.value) {
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
  }
  else{
    document.getElementById("disponible").style.display = "none";
  }
}

function guardarGasto(e) {
  e.preventDefault();
  invImp.innerHTML = "El importe es requerido";

  if (validarCampos()) {
    let importe = parseFloat(campoImporte.value);

    switch (campoPago.value) {
      case "Efectivo": {
        if(campoOrigen.value === "Plata propia"){
          let saldoDisp = parseFloat(info.saldoEfectivo);

          if (importe > saldoDisp) {
            invImp.innerHTML =
              "El importe no puede ser mayor al fondo disponible";
            campoImporte.className = "form-control is-invalid";
            return;
          }
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

    crearGasto();
  }
}

async function crearGasto() {
  document.getElementById("btnGuardar").disabled = true;
  let comentario = campoComentario.value.trim();

  let gastoNuevo = new Gasto(
    campoConcepto.value,
    campoCategoria.value,
    campoImporte.value,
    campoOrigen.value,
    campoPago.value,
    comentario
  );

  descontarDinero(campoOrigen.value, campoPago.value, campoImporte.value);

  //limpiarFormulario();

  const data = await cargarGasto(gastoNuevo);
  if (data.code == "200") {
    document.getElementById("btnGuardar").disabled = false;
    Swal.fire({
      title: "Exito",
      text: "Gasto cargado correctamente",
      icon: "success",
      timer: 2000,
      showCancelButton: false,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "/pages/tablas.html";
    });
  } else {
    Swal.fire({
      title: "Error",
      text: "No se pudo cargar el gasto. Revise la conexion y vuelva a intentarlo",
      icon: "error",
      confirmButtonText: "Ok",
    });
  }
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

async function descontarDinero(origen, pago,importe) {
  if (origen == "Plata propia" && pago == "Efectivo") {
    info.saldoEfectivo -= parseFloat(importe);
  } else if (pago == "TC") {
    info.gastoTC += parseFloat(importe);
  } else if (pago == "TD") {
    info.saldoTD -= parseFloat(importe);
  } 

  info.saldoViaje += parseFloat(importe);

  await actualizarInfo(info);
}
