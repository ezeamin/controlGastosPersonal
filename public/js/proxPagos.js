import {
  campoRequerido,
  campoRequeridoSelect,
  validarNumeros,
  validarFecha,
  validarFechaFutura,
  validarCamposPago,
} from "./validaciones.js";
import { Pago } from "./pago.js";
import {
  loadInfo,
  actualizarInfo,
  loadPagos,
  cargarPago,
  deletePago
} from "./DB.js";

let campoConcepto = document.getElementById("concepto");
let campoImporte = document.getElementById("importe");
let campoComentario = document.getElementById("comentario");
let campoFecha = document.getElementById("fecha");
let formulario1 = document.getElementById("formularioAgregarPago");

let campoCuenta = document.getElementById("cuenta");
let formulario2 = document.getElementById("formularioPagarPago");

let info = await loadInfo(false);
let pagos;
loadPagos().then(pagosC=>{
  if(pagosC.length>0){
    document.getElementById("datosVacios").style.display = "none";
    pagos = pagosC;
    cargarDatosTabla();
  } else document.getElementById("tabla").style.display = "none"; 

  document.getElementById("loadingSpinner").style.opacity = "0";
  setTimeout(()=>document.getElementById("loadingSpinner").style.display = "none",350);
});

campoConcepto.addEventListener("blur", () => {
  campoRequerido(campoConcepto);
});
campoImporte.addEventListener("blur", () => {
  validarNumeros(campoImporte);
});
campoFecha.addEventListener("blur", () => {
  document.getElementById("fechaIncorrecta").innerHTML =
    "Ingrese un parametro valido";

  if (validarFecha(campoFecha)) {
    if (!validarFechaFutura(campoFecha)) {
      document.getElementById("fechaIncorrecta").innerHTML =
        "La fecha no puede ser anterior a la actual";
    }
  }
});

formulario1.addEventListener("submit", guardarPago);

campoCuenta.addEventListener("blur", () => {
  campoRequeridoSelect(campoCuenta);
});

formulario2.addEventListener("submit", cancelarPago);

function guardarPago(e) {
  e.preventDefault();

  if (validarCamposPago()) {
    cargarPagos();
  }
}

async function cargarPagos() {
  document.getElementById("btnGuardar").disabled = true;
  let nuevoPago = new Pago(
    campoConcepto.value,
    campoImporte.value,
    campoFecha.value,
    campoComentario.value.trim()
  );

  await cargarPago(nuevoPago);

  //limpiarFormulario();

  document.getElementById("btnGuardar").disabled = false;
  Swal.fire({
    title: "Pago agregado",
    text: "El pago se ha agregado correctamente",
    icon: "success",
    timer: 2000,
    showCancelButton: false,
    showConfirmButton: false,
  }).then(() => {
    window.location.reload();
  });
}

function limpiarFormulario() {
  campoConcepto.value = "";
  campoImporte.value = "";
  campoComentario.value = "";
  campoFecha.value = "";
  document.getElementById("fechaIncorrecta").innerHTML =
    "Ingrese un parametro valido";
}

async function cargarDatosTabla() {
  let total = 0;
  let tabla = document.getElementById("tablaPagos");
  let menorDias = [0, 0];

  pagos.sort((a, b) => comparar(a, b));

  tabla.innerHTML = "";

  pagos.map((pago, index) => {
    let dias = fechaCercana(pago.fechaVencimiento);
    tabla.innerHTML += `
        <tr>
          <th class="pag_${pago.codigo}">${pago.concepto}</th>
          <td class="pag_${pago.codigo}">${pago.fechaRegistro}</td>
          <td class="pag_${pago.codigo}">${pago.fechaVencimiento} ${dias} dias</td>
          <td class="pag_${pago.codigo}">$ ${pago.importe}</td>
          <td class="pag_${pago.codigo}">${pago.comentario}</td>
          <td class="pag_${pago.codigo}">
            <button class="btn btn-outline-danger btn-tabla my-1" data-bs-toggle="modal" data-bs-target="#modalPagarPago" onclick="prepararCancelarPago('${pago.codigo}')">Cancelar</button>
          </td>
      </tr>`;

    if (dias <= 5) {
      let elementos = document.getElementsByClassName(`pag_${pago.codigo}`);

      for (let i = 0; i < elementos.length; i++) {
        elementos[i].style.backgroundColor = "#FAA0A0";
      }
    }

    total += parseInt(pago.importe);

    if (dias > menorDias[0]) {
      menorDias[0] = dias;
      menorDias[1] = index;
    }
  });

  document.getElementById("totalPagos").innerHTML = `$ ${total}`;
  if (pagos.length > 0) {
    document.getElementById("fechaPago").style.display = "inline";
    document.getElementById("fechaPago").innerHTML +=
      " hasta el " + pagos[menorDias[1]].fechaVencimiento;
  } else document.getElementById("fechaPago").style.display = "none";

  info.pagosPendientes = total;
  await actualizarInfo(info);
}

function comparar(a, b) {
  let fechaA = a.fechaVencimiento.split("/");
  let fechaB = b.fechaVencimiento.split("/");

  let fechaADate = new Date(fechaA[2], fechaA[1] - 1, fechaA[0]);
  let fechaBDate = new Date(fechaB[2], fechaB[1] - 1, fechaB[0]);

  if (fechaADate.getTime() > fechaBDate.getTime()) {
    return 1;
  } else if (fechaADate.getTime() < fechaBDate.getTime()) {
    return -1;
  }
}

function fechaCercana(fechaVencimiento) {
  let fechaVencimientoSplit = fechaVencimiento.split("/");
  let fechaFinalDate = new Date(
    fechaVencimientoSplit[2],
    fechaVencimientoSplit[1] - 1,
    fechaVencimientoSplit[0]
  );
  let fechaInicial = new Date();

  let diferencia = Math.floor(
    (fechaFinalDate.getTime() - fechaInicial.getTime()) / (1000 * 3600 * 24)
  );

  return diferencia;
}

window.prepararCancelarPago = function (codigo) {
  location.href = "#cod=" + codigo;
};

function cancelarPago(e) {
  e.preventDefault();

  if (campoRequeridoSelect(campoCuenta)) {
    eliminarPago();
  }
}

async function eliminarPago() {
  document.getElementById("btnPagar").disabled = true;
  let pago = pagos.find(
    (pago) => pago.codigo == location.href.split("#cod=")[1]
  );

  document.getElementById("cuenta").className = "form-select";
  document.getElementById("errorSelect").innerHTML = "Seleccione una opcion";
  switch (campoCuenta.value) {
    case "Efectivo": {
      if (info.saldoEfectivo < pago.importe) {
        document.getElementById("errorSelect").innerHTML = "Saldo insuficiente";
        document.getElementById("cuenta").className = "form-select is-invalid";
        document.getElementById("btnPagar").disabled = false;
        return;
      }

      info.saldoEfectivo -= parseInt(pago.importe);
      break;
    }
    case "TD": {
      if (info.saldoTD < pago.importe) {
        document.getElementById("errorSelect").innerHTML = "Saldo insuficiente";
        document.getElementById("cuenta").className = "form-select is-invalid";
        document.getElementById("btnPagar").disabled = false;
        return;
      }

      info.saldoTD -= parseInt(pago.importe);
      break;
    }
  }

  info.pagosPendientes -= parseInt(pago.importe);
  await actualizarInfo(info);

  let comentario = document.getElementById("comentarioPagar").value;

  agregarATabla(
    pago.concepto,
    pago.importe,
    campoCuenta.value,
    comentario
  );

  await deletePago(location.href.split("#cod=")[1]);

  document.getElementById("btnPagar").disabled = false;
  Swal.fire({
    title: "Pago cancelado",
    text: "El pago se ha cancelado correctamente",
    icon: "success",
    timer: 2000,
    showCancelButton: false,
    showConfirmButton: false,
  }).then(() => {
    window.location.reload();
  });
}

async function agregarATabla(detalle, importe, cuenta, comentarioPago) {
  let concepto = "Pago: "+ detalle;

  let gasto = new Gasto(concepto, "Pago programado", importe, "Plata propia", cuenta, comentario);

  await cargarGasto(gasto);
}
