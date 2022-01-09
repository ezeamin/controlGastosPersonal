import {
  campoRequerido,
  validarNumeros,
  campoRequeridoSelect,
  validarCamposNuevoIngreso,
} from "./validaciones.js";
import { Gasto } from "./gasto.js";
import {
  loadInfo,
  actualizarInfo,
  cargarGasto,
  loadGastos,
  loadDeudas,
  transferOldData,
} from "./DB.js";

let campoImporte = document.getElementById("importe");
let campoCuenta = document.getElementById("cuenta");
let campoComentario = document.getElementById("comentario");
let campoLimite = document.getElementById("limite");
let botonBorrar = document.getElementById("reset");
let formulario = document.getElementById("formularioFondeo");
let formularioLimite = document.getElementById("formularioLimite");
let botonTransferencia = document.getElementById("btnTransferir");
let botonAñadir = document.getElementById("btnAgregarFondos");
let botonTrasferirDatos = document.getElementById("btnTransferirDatos");
let botonModificarLimite = document.getElementById("btnModificarLimite");
let progressBar = document.getElementById("progressBar");

let transferencia = false;
let total,
  totalPropio,
  totalPapas,
  diferencia,
  efectivoPropio,
  efectivoPapas,
  TC,
  TCPropio,
  TD;
let info = await loadInfo(false);
cargarGastos().then(() => {
  progressBar.style.width = "0%";
  document.getElementById("loadingSpinner").style.opacity = "0";
  setTimeout(() => {
    document.getElementById("loadingSpinner").style.display = "none";
    loadProgressBar();
  }, 350);
});

campoImporte.addEventListener("blur", () => {
  campoRequerido(campoImporte);
  validarNumeros(campoImporte);
});
campoCuenta.addEventListener("blur", () => {
  campoRequeridoSelect(campoCuenta);
});
campoLimite.addEventListener("blur", () => {
  campoRequerido(campoLimite);
  validarNumeros(campoImporte);
});
botonBorrar.addEventListener("click", () => {
  document.getElementById("reset").disabled = true;
  iniciarNuevoPeriodo();
});
botonTransferencia.addEventListener("click", () => {
  transferencia = true;

  document.getElementById("tituloModal").innerHTML = "Transferir fondos";
  document.getElementById("lblCuenta").innerHTML = "Cuenta Destino";
  document.getElementById("comentario").placeholder = "Comentario";
  document.getElementById("btnAñadir").innerHTML = "Transferir";
  document.getElementById("btnAñadir").classList = "btn btn-warning mt-2";
});
botonAñadir.addEventListener("click", () => {
  transferencia = false;

  document.getElementById("tituloModal").innerHTML = "Añadir fondos";
  document.getElementById("lblCuenta").innerHTML = "Cuenta";
  document.getElementById("comentario").placeholder = "Devolucion de prestamo";
  document.getElementById("btnAñadir").innerHTML = "Añadir";
  document.getElementById("btnAñadir").classList = "btn btn-success mt-2";
});
botonModificarLimite.addEventListener("click", () => {});
/*botonTrasferirDatos.addEventListener("click", () => {
  transferirDatos();
});*/

formulario.addEventListener("submit", guardarFondeo);
formularioLimite.addEventListener("submit", guardarLimite);

function guardarFondeo(e) {
  e.preventDefault();

  if (validarCamposNuevoIngreso()) {
    if (!transferencia) cargarFondo();
    else cargarTransferencia();
  }
}

async function cargarFondo() {
  switch (campoCuenta.value) {
    case "Efectivo": {
      info.saldoEfectivo += parseFloat(campoImporte.value);
      break;
    }
    default: {
      info.saldoTD += parseFloat(campoImporte.value);
      break;
    }
  }

  await actualizarInfo(info);

  agregarATabla();
  limpiarFormulario();

  Swal.fire({
    title: "Importe cargado",
    text: "Se ha añadido correctamente el valor",
    icon: "success",
    timer: 2000,
    showCancelButton: false,
    showConfirmButton: false,
  }).then(() => {
    window.location.reload();
  });
}

async function agregarATabla() {
  let gasto = new Gasto(
    "Fondeo",
    "Fondeo",
    campoImporte.value,
    "Plata propia",
    campoCuenta.value,
    campoComentario.value
  );

  await cargarGasto(gasto);
}

function limpiarFormulario() {
  campoImporte.value = "";
  campoCuenta.value = "0";
  campoComentario.value = "";
}

async function cargarGastos() {
  const gastos = await loadGastos(-1);

  efectivoPropio = 0;
  efectivoPapas = 0;
  TC = info.gastoTC;
  TCPropio = 0;
  TD = 0;
  let debo = 0;
  let aFavor = 0;

  gastos.forEach((gasto) => {
    if (
      gasto.pago == "Efectivo" &&
      gasto.origen == "Plata propia" &&
      gasto.categoria != "Fondeo"
    )
      efectivoPropio += parseFloat(gasto.importe);
    else if (gasto.pago == "Efectivo" && gasto.origen == "Plata papas")
      efectivoPapas += parseFloat(gasto.importe);
    else if (gasto.pago == "TC" && gasto.origen == "Plata propia")
      TCPropio += parseFloat(gasto.importe);
    else if (gasto.pago == "TD" && gasto.categoria != "Fondeo")
      TD += parseFloat(gasto.importe);

    if (gasto.debo) debo += parseFloat(gasto.importe);
  });

  const deudas = await loadDeudas(true);

  deudas.forEach((deuda) => {
    for (let i = 0; i < deuda.lista.length; i++) {
      aFavor += parseFloat(deuda.lista[i].importe);
    }
  });

  document.getElementById("efectivoPropio").innerHTML = "$" + efectivoPropio;
  document.getElementById("efectivoPapas").innerHTML = "$" + efectivoPapas;
  document.getElementById("TC").innerHTML = "$" + TC;
  document.getElementById("TD").innerHTML = "$" + TD;
  document.getElementById("debes").innerHTML = "$" + debo;
  document.getElementById("aFavor").innerHTML = "$" + aFavor;

  total = efectivoPropio + efectivoPapas + TC + TD;
  totalPropio = efectivoPropio + TD + TCPropio;
  totalPapas = efectivoPapas + (TC - TCPropio);

  let totalPropioPorcentaje;
  let totalPapasPorcentaje;
  if (total != 0) {
    totalPropioPorcentaje = Math.round((totalPropio * 100) / total);
    totalPapasPorcentaje = Math.round((totalPapas * 100) / total);
  }

  document.getElementById("totalGastos").innerHTML = "$" + total;
  document.getElementById("totalGastos2").innerHTML = "$" + total;
  if (total != 0)
    document.getElementById("porcentajes").innerHTML =
      totalPropioPorcentaje + "% / " + totalPapasPorcentaje + "%";
  else document.getElementById("porcentajes").innerHTML = "0% / 0%";
  document.getElementById("totalPropio").innerHTML = "$" + totalPropio;

  document.getElementById("name").innerHTML = info.nombre;

  let txtPrimerIngreso = document.getElementById("fechaInicial");
  let fechaInicial = info.fecha.split("/");
  let fechaFinal = new Date();
  let fechaFinalPeriodo = getFechaFinalPeriodo(fechaInicial);
  diferencia =
    Math.floor(
      (fechaFinal.getTime() -
        new Date(
          fechaInicial[2],
          fechaInicial[1] - 1,
          fechaInicial[0]
        ).getTime()) /
        (1000 * 3600 * 24)
    ) + 1;
  let diasRestantes =
    Math.floor(
      (fechaFinalPeriodo.getTime() - fechaFinal.getTime()) / (1000 * 3600 * 24)
    ) + 1;

  if (diasRestantes != 1)
    document.getElementById("diasRestantes").innerHTML =
      "Quedan " + diasRestantes + " días";
  else
    document.getElementById("diasRestantes").innerHTML = "Queda " + diasRestantes + " día";

  if (diasRestantes <= 3) document.getElementById("diasRestantesCont").className = "mb-0 text-danger fw-bold"

  fechaFinal =
    fechaFinal.getDate() +
    "/" +
    (fechaFinal.getMonth() + 1) +
    "/" +
    fechaFinal.getFullYear();

  txtPrimerIngreso.innerHTML = info.fecha + " - " + fechaFinal;
  document.getElementById("dias").innerHTML = diferencia;

  let promedio = Math.round(total / diferencia);
  let promedioPropio = Math.round(totalPropio / diferencia);
  document.getElementById("promedio").innerHTML = "$" + promedio;
  document.getElementById("promedioPropio").innerHTML = "$" + promedioPropio;

  document.getElementById("limiteActual").innerHTML = "$" + info.limite;
  document.getElementById("limiteEstado").innerHTML = "$" + info.limite;
  document.getElementById("limiteEstadoBar").innerHTML = "$" + info.limite;

  if (diasRestantes <= 0) {
    Swal.fire({
      title: "¡Periodo finalizado!",
      text: "El periodo de este mes ya ha finalizado. Se iniciará uno nuevo.",
      timer: 2500,
      showCancelButton: false,
      showConfirmButton: false,
    }).then(async () => {
      await iniciarNuevoPeriodo();
    });
  }

  return total;
}

function loadProgressBar() {
  let limite = info.limite;

  let progreso = Math.round((total / limite) * 100);
  progressBar.style.width = progreso + "%";
  progressBar.innerHTML = progreso + "%";

  if (progreso >= 85) {
    progressBar.className =
      "progress-bar bg-danger progress-bar-striped progress-bar-animated";
  } else if (progreso >= 75) {
    progressBar.className =
      "progress-bar bg-warning progress-bar-striped progress-bar-animated";
  }

  let restante = limite - total;
  document.getElementById("saldoRestante").innerHTML = "$" + restante;
}

function getFechaFinalPeriodo(fechaInicial) {
  let fechaFinal;
  if (fechaInicial[0] == 31) {
    if (fechaInicial[1] != 7 && fechaInicial[1] != 12) fechaInicial[0] = 30;
  }
  if (fechaInicial[0] > 28 && fechaInicial[1] == 1) {
    fechaInicial[0] -= 28;
    fechaInicial[1] = 3;
  }

  if (fechaInicial[1] != 12)
    fechaFinal = new Date(
      fechaInicial[2],
      fechaInicial[1] - 1,
      parseInt(fechaInicial[0]) - 1
    );
  else
    fechaFinal = new Date(
      parseInt(fechaInicial[2]) + 1,
      0,
      parseInt(fechaInicial[0]) - 1
    );

  return fechaFinal;
}

async function cargarTransferencia() {
  switch (campoCuenta.value) {
    case "Efectivo": {
      if (info.saldoTD >= parseFloat(campoImporte.value)) {
        info.saldoEfectivo += parseFloat(campoImporte.value);
        info.saldoTD -= parseFloat(campoImporte.value);
      } else {
        Swal.fire({
          title: "Error",
          text: "No tienes saldo suficiente",
          icon: "error",
          confirmButtonText: "Sad",
        });
        return;
      }
      break;
    }
    default: {
      if (info.saldoEfectivo >= parseFloat(campoImporte.value)) {
        info.saldoEfectivo -= parseFloat(campoImporte.value);
        info.saldoTD += parseFloat(campoImporte.value);
      } else {
        Swal.fire({
          title: "Error",
          text: "No tienes saldo suficiente",
          icon: "error",
          confirmButtonText: "Sad",
        });
        return;
      }
      break;
    }
  }

  await actualizarInfo(info);

  limpiarFormulario();

  Swal.fire({
    title: "Transferencia realizada",
    text: "Se ha transferido correctamente el importe",
    icon: "success",
    timer: 2000,
    showCancelButton: false,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = "/pages/user.html";
  });
}

async function iniciarNuevoPeriodo() {
  await transferOldData(
    total,
    totalPropio,
    totalPapas,
    diferencia,
    efectivoPropio,
    efectivoPapas,
    TC,
    TCPropio,
    TD
  );
  Swal.fire({
    title: "Nuevo periodo",
    text: "Felicidades, sobreviviste un nuevo mes",
    timer: 2500,
    showCancelButton: false,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = "/index.html";
  });
}

function guardarLimite(e) {
  e.preventDefault();
  info.limite = parseFloat(campoLimite.value);
  actualizarInfo(info);
  Swal.fire({
    title: "Limite actualizado",
    text: "Se ha actualizado correctamente el limite",
    icon: "success",
    timer: 2000,
    showCancelButton: false,
    showConfirmButton: false,
  }).then(() => {
    window.location.href = "/pages/user.html";
  });
}

const transferirDatos = async () => {
  let gastos = JSON.parse(localStorage.getItem("gastos"));
  let deudas = JSON.parse(localStorage.getItem("deudas"));
  let proxPagos = JSON.parse(localStorage.getItem("pagos"));
  let info = JSON.parse(localStorage.getItem("info"));

  const res = await fetch("/transfer", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      info: info,
      gastos: gastos,
      deudas: deudas,
      proxPagos: proxPagos,
    }),
  });
  let body = await res.text();
  body = JSON.parse(body);

  if (body.code == "200") {
    Swal.fire({
      title: "Transferencia realizada",
      text: "Se han transferido correctamente los datos",
      icon: "success",
      timer: 2000,
      showCancelButton: false,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "/pages/user.html";
    });
  }
};
