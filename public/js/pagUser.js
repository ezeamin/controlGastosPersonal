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
  loadOld,
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
  TD,
  otro,
  otroPapas,
  otroPropio,
  ajena;

document.getElementById("loadingScreen").style.display = "none";
let info = await loadInfo(false);
let anteriores = await loadOld();
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
  document.getElementById("btnAñadir").classList =
    "btn btn-outline-warning mt-2";
});
botonAñadir.addEventListener("click", () => {
  transferencia = false;

  document.getElementById("tituloModal").innerHTML = "Añadir fondos";
  document.getElementById("lblCuenta").innerHTML = "Cuenta";
  document.getElementById("comentario").placeholder = "Devolucion de prestamo";
  document.getElementById("btnAñadir").innerHTML = "Añadir";
  document.getElementById("btnAñadir").classList =
    "btn btn-outline-success mt-2";
});
botonModificarLimite.addEventListener("click", () => {});
document.getElementById("index").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
});
// botonTrasferirDatos.addEventListener("click", () => {
//   transferirDatos();
// });

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
  document.getElementById("btnAñadir").disabled = true;

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
  //limpiarFormulario();

  document.getElementById("btnAñadir").disabled = false;

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

async function cargarGastos() {
  const gastos = await loadGastos(-1);

  efectivoPropio = 0;
  efectivoPapas = 0;
  TC = info.gastoTC;
  TCPropio = 0;
  TD = 0;
  ajena = 0;
  otro = 0;
  otroPropio = 0;
  otroPapas = 0;
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
    else if (gasto.pago == "Otro"){
      otro += parseFloat(gasto.importe);
      if(gasto.origen == "Plata propia")
        otroPropio += parseFloat(gasto.importe);
      else if (gasto.origen == "Plata papas")
        otroPapas += parseFloat(gasto.importe);

    }
    else if (gasto.origen == "Plata ajena") ajena += parseFloat(gasto.importe);

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
  document.getElementById("otro").innerHTML = "$" + otro;
  document.getElementById("debes").innerHTML = "$" + debo;
  document.getElementById("aFavor").innerHTML = "$" + aFavor;

  total = efectivoPropio + efectivoPapas + TC + TD + ajena + otro;
  totalPropio = efectivoPropio + TD + TCPropio + otroPropio;
  totalPapas = efectivoPapas + (TC - TCPropio) + otroPapas;

  let totalPropioPorcentaje;
  let totalPapasPorcentaje;
  let diferenciaPorcentaje = 0;
  if (total != 0) {
    totalPropioPorcentaje = Math.round((totalPropio * 100) / total);
    totalPapasPorcentaje = Math.round((totalPapas * 100) / total);

    if (totalPapasPorcentaje + totalPropioPorcentaje !== 100) {
      diferenciaPorcentaje =
        100 - (totalPapasPorcentaje + totalPropioPorcentaje);
    }
  }

  document.getElementById("totalGastos").innerHTML = "$" + total;
  document.getElementById("totalGastos2").innerHTML = "$" + total;
  document.getElementById("totalGrafico").innerHTML = "$" + total;
  document.getElementById("totalGraficoPropio").innerHTML = "$" + totalPropio;
  if (total != 0 && diferenciaPorcentaje === 0) {
    document.getElementById("porcentajes").innerHTML =
      totalPropioPorcentaje + "% / " + totalPapasPorcentaje + "%";
  } else if (total != 0 && diferenciaPorcentaje !== 0) {
    document.getElementById("porcentajes").innerHTML =
      totalPropioPorcentaje +
      "% / " +
      totalPapasPorcentaje +
      "% / " +
      diferenciaPorcentaje +
      "%";
  } else document.getElementById("porcentajes").innerHTML = "0% / 0%";
  document.getElementById("totalPropio").innerHTML = "$" + totalPropio;

  document.getElementById("name").innerHTML = info.nombre;

  let txtPrimerIngreso = document.getElementById("fechaInicial");
  let fechaInicial = info.fecha.split("/");
  let fechaFinal = new Date();
  let fechaFinalPeriodo = getFechaFinalPeriodo(fechaInicial);
  let fechaFinalPeriodoFormat;
  if (fechaFinalPeriodo.getDate() < 10) {
    if (fechaFinalPeriodo.getMonth() < 10) {
      fechaFinalPeriodoFormat =
        "0" +
        fechaFinalPeriodo.getDate() +
        "/0" +
        (parseInt(fechaFinalPeriodo.getMonth()) + 1) +
        "/" +
        fechaFinalPeriodo.getFullYear();
    } else {
      fechaFinalPeriodoFormat =
        "0" +
        fechaFinalPeriodo.getDate() +
        "/" +
        (parseInt(fechaFinalPeriodo.getMonth()) + 1) +
        "/" +
        fechaFinalPeriodo.getFullYear();
    }
  } else {
    if (fechaFinalPeriodo.getMonth() < 10) {
      fechaFinalPeriodoFormat =
        fechaFinalPeriodo.getDate() +
        "/0" +
        (parseInt(fechaFinalPeriodo.getMonth()) + 1) +
        "/" +
        fechaFinalPeriodo.getFullYear();
    } else {
      fechaFinalPeriodoFormat =
        fechaFinalPeriodo.getDate() +
        "/" +
        (parseInt(fechaFinalPeriodo.getMonth()) + 1) +
        "/" +
        fechaFinalPeriodo.getFullYear();
    }
  }

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

  let diasTotales = diferencia + diasRestantes - 1;

  if (diasRestantes != 1)
    document.getElementById("diasRestantes").innerHTML =
      "Quedan " + diasRestantes + " días";
  else
    document.getElementById("diasRestantes").innerHTML =
      "Queda " + diasRestantes + " día";

  if (diasRestantes <= 3)
    document.getElementById("diasRestantesCont").className =
      "mb-0 text-danger fw-bold";

  txtPrimerIngreso.innerHTML = info.fecha + " - " + fechaFinalPeriodoFormat;
  document.getElementById("dias").innerHTML = diferencia;

  let promedio = Math.round(total / diasTotales);
  let promedioPropio = Math.round(totalPropio / diasTotales);
  document.getElementById("promedio").innerHTML = "$" + promedio;
  document.getElementById("promedioPropio").innerHTML = "$" + promedioPropio;

  document.getElementById("limiteActual").innerHTML = "$" + info.limite;
  document.getElementById("limiteEstado").innerHTML = "$" + info.limite;
  document.getElementById("limiteEstadoBar").innerHTML = "$" + info.limite;

  let simbolo = "&#9650";
  let simboloPropio = "&#9650";
  let estilo = "color: red";
  let estiloPropio = "color: red";

  let mesAnterior;
  if (new Date().getMonth() + 1 == 1) mesAnterior = 12;
  else mesAnterior = new Date().getMonth();

  const infoAnterior = anteriores.find((anterior) => {
    if (parseInt(anterior.fechaInicio.split("/")[1]) == mesAnterior) {
      return anterior;
    }
  });

  if (infoAnterior) {
    let promedioAnterior = infoAnterior.stats.promedioDiario;
    let promedioAnteriorPropio = infoAnterior.stats.promedioDiarioPropio;
    let porcentajeAnterior = Math.round(
      ((promedioAnterior - promedio) / promedioAnterior) * 100
    );
    let porcentajeAnteriorPropio = Math.round(
      ((promedioAnteriorPropio - promedioPropio) / promedioAnteriorPropio) * 100
    );

    if (porcentajeAnterior > 0) {
      simbolo = "&#9660";
      estilo = "color: green";
    } else if (porcentajeAnterior == 0) {
      simbolo = "=";
      estilo = "color: orange; font-weight: bold";
    }

    if (porcentajeAnteriorPropio > 0) {
      simboloPropio = "&#9660";
      estiloPropio = "color: green";
    } else if (porcentajeAnteriorPropio == 0) {
      simboloPropio = "=";
      estiloPropio = "color: orange; font-weight: bold";
    }

    porcentajeAnterior = Math.abs(porcentajeAnterior);
    porcentajeAnteriorPropio = Math.abs(porcentajeAnteriorPropio);

    document.getElementById(
      "promedioComparacion"
    ).innerHTML = ` <span style="${estilo}">${simbolo}</span> ${porcentajeAnterior}%*`;
    document.getElementById(
      "promedioComparacionPropio"
    ).innerHTML = ` <span style="${estiloPropio}">${simboloPropio}</span> ${porcentajeAnteriorPropio}%*`;
    document.getElementById("aclaracionPeriodo").style.display = "block";
  }

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

  generarGraficos(gastos);

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
      fechaInicial[1],
      parseInt(fechaInicial[0])
    );
  else
    fechaFinal = new Date(
      parseInt(fechaInicial[2]) + 1,
      0,
      parseInt(fechaInicial[0])
    );

  return fechaFinal;
}

function getInfo1(gastos) {
  let nombres = [
    "Comida/Merienda",
    "Super/Kiosko/Bebida",
    "Transporte",
    "Entretenimiento",
    "Salida nocturna",
    "Gimnasia",
    "Auto/Nafta",
    "Estudios",
    "Salud",
    "Programados",
    "Varios",
  ];

  let categorias = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  gastos.forEach((gasto) => {
    if (gasto.categoria == "Comida/Merienda") categorias[0] += gasto.importe;
    else if (gasto.categoria == "Super/Kiosko/Bebida")
      categorias[1] += gasto.importe;
    else if (gasto.categoria == "Transporte") categorias[2] += gasto.importe;
    else if (gasto.categoria == "Entretenimiento")
      categorias[3] += gasto.importe;
    else if (gasto.categoria == "Salida nocturna")
      categorias[4] += gasto.importe;
    else if (gasto.categoria == "Gimnasia") categorias[5] += gasto.importe;
    else if (gasto.categoria == "Auto/Nafta") categorias[6] += gasto.importe;
    else if (gasto.categoria == "Estudios") categorias[7] += gasto.importe;
    else if (gasto.categoria == "Salud") categorias[8] += gasto.importe;
    else if (gasto.categoria == "Pago programado")
      categorias[9] += gasto.importe;
    else categorias[10] += gasto.importe;
  });

  let colores = [
    "#fff87f",
    "#4fa8fb",
    "#f86f6f",
    "#ff35c2",
    "#66d7d1",
    "#afcbff",
    "#ffcbc1",
    "#aff8db",
    "#9ad2e6",
    "#c585ed",
    "#b5c5d7",
  ];

  return [nombres, categorias, colores];
}

function getInfo2(gastos) {
  let categorias = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  gastos.forEach((gasto) => {
    if(gasto.origen === "Plata propia"){
      if (gasto.categoria == "Comida/Merienda") categorias[0] += gasto.importe;
      else if (gasto.categoria == "Super/Kiosko/Bebida")
        categorias[1] += gasto.importe;
      else if (gasto.categoria == "Transporte") categorias[2] += gasto.importe;
      else if (gasto.categoria == "Entretenimiento")
        categorias[3] += gasto.importe;
      else if (gasto.categoria == "Salida nocturna")
        categorias[4] += gasto.importe;
      else if (gasto.categoria == "Gimnasia") categorias[5] += gasto.importe;
      else if (gasto.categoria == "Auto/Nafta") categorias[6] += gasto.importe;
      else if (gasto.categoria == "Estudios") categorias[7] += gasto.importe;
      else if (gasto.categoria == "Salud") categorias[8] += gasto.importe;
      else if (gasto.categoria == "Pago programado")
        categorias[9] += gasto.importe;
      else categorias[10] += gasto.importe;
    }
  });

  let colores = [
    "#fff87f",
    "#4fa8fb",
    "#f86f6f",
    "#ff35c2",
    "#66d7d1",
    "#afcbff",
    "#ffcbc1",
    "#aff8db",
    "#9ad2e6",
    "#c585ed",
    "#b5c5d7",
  ];

  return [categorias, colores];
}

async function getInfo3() {
  let totalAnteriores = anteriores.map((periodo) => {
    return periodo.stats.total;
  });
  totalAnteriores.push(total);
  let totalAnterioresPropio = anteriores.map((periodo) => {
    return (
      periodo.stats.gastos.TCPropio +
      periodo.stats.gastos.TD +
      periodo.stats.gastos.efectivoPropio
    );
  });
  totalAnterioresPropio.push(totalPropio);

  let mesActual = new Date().getMonth();

  //meses hasta hoy
  let meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  let mesesHastaHoy = [];
  for (let i = 0; i < mesActual + 1; i++) {
    mesesHastaHoy.push(meses[i]);
  }

  return [mesesHastaHoy, totalAnteriores, totalAnterioresPropio];
}

async function getInfo4() {
  let inicialEfectivoAnteriores =
    anteriores.map((periodo) => {
      return periodo.stats.iniciales.efectivo;
    }) || [];
  inicialEfectivoAnteriores.push(info.iniciales[0]);

  let inicialTDAnteriores =
    anteriores.map((periodo) => {
      return periodo.stats.iniciales.TD;
    }) || [];
  inicialTDAnteriores.push(info.iniciales[1]);

  let totalAnteriores = [];
  for (let i = 0; i < anteriores.length; i++) {
    totalAnteriores.push(inicialEfectivoAnteriores[i] + inicialTDAnteriores[i]);
  }
  totalAnteriores.push(info.iniciales[0] + info.iniciales[1]);

  return [inicialEfectivoAnteriores, inicialTDAnteriores, totalAnteriores];
}

async function generarGraficos(gastos) {
  gastos = gastos.filter((gasto) => {
    return gasto.categoria != "Fondeo" && gasto.categoria != "Pago de deuda";
  });

  const info1 = getInfo1(gastos);
  const info2 = getInfo2(gastos);
  const info3 = await getInfo3(gastos);
  const info4 = await getInfo4(gastos);

  const ctx = document.getElementById("graficoDonut").getContext("2d");
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: info1[0],
      datasets: [
        {
          data: info1[1],
          backgroundColor: info1[2],
        },
      ],
    },
    options: {
      resonsive: true,
    },
  });

  const ctx2 = document.getElementById("graficoDonutPropio").getContext("2d");
  new Chart(ctx2, {
    type: "doughnut",
    data: {
      labels: info1[0],
      datasets: [
        {
          data: info2[0],
          backgroundColor: info2[1],
        },
      ],
    },
    options: {
      resonsive: true,
    },
  });

  const ctx3 = document.getElementById("graficoGastos").getContext("2d");
  new Chart(ctx3, {
    type: "line",
    data: {
      labels: info3[0],
      datasets: [
        {
          label: "Total",
          data: info3[1],
          backgroundColor: "#4fa8fb",
        },
        {
          label: "Total propio",
          data: info3[2],
          backgroundColor: "#f86f6f",
        },
      ],
    },
    options: {
      resonsive: true,
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
        },
      },
    },
  });

  const ctx4 = document.getElementById("graficoFondos").getContext("2d");
  new Chart(ctx4, {
    type: "line",
    data: {
      labels: info3[0],
      datasets: [
        {
          label: "Efectivo",
          data: info4[0],
          backgroundColor: "#5dc92e",
        },
        {
          label: "TD",
          data: info4[1],
          backgroundColor: "#c585ed",
        },
        {
          label: "Total",
          data: info4[2],
          backgroundColor: "#afcbff",
        },
      ],
    },
    options: {
      resonsive: true,
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
        },
      },
    },
  });
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

  //limpiarFormulario();

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
  document.getElementById("reset").disabled = true;

  await transferOldData(
    total,
    totalPropio,
    totalPapas,
    diferencia - 1, //dias
    efectivoPropio,
    efectivoPapas,
    TC,
    TCPropio,
    TD,
    otro,
    otroPropio,
    otroPapas
  );

  document.getElementById("reset").disabled = false;
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

async function guardarLimite(e) {
  e.preventDefault();

  if (isNaN(campoLimite.value) || campoLimite.value == "") {
    campoLimite.className = "form-control is-invalid";
    return;
  }

  document.getElementById("btnModificar").disabled = true;

  info.limite = parseFloat(campoLimite.value);
  await actualizarInfo(info);
  document.getElementById("btnModificar").disabled = false;
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
