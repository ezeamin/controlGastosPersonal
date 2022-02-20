import { loadInfo } from "./DB.js";

let txtSaldoEfectivo = document.getElementById("saldoEfectivo");
let txtSaldoTD = document.getElementById("saldoTD");
let txtSaldoTotal = document.getElementById("saldoTotal");
let txtSaldoADescontar = document.getElementById("saldoADescontar");
let txtSaldoViaje = document.getElementById("saldoViaje");

document.getElementById("loadingScreen").style.display = "none";
let info = await loadInfo(true);


if (info == null) {
  location.href = "pages/newUser.html";
} else {
  txtSaldoEfectivo.innerHTML += info.saldoEfectivo;
  txtSaldoTD.innerHTML += info.saldoTD;

  let total = parseInt(info.saldoEfectivo) + parseInt(info.saldoTD);
  txtSaldoTotal.innerHTML += total;

  txtSaldoViaje.innerHTML += info.saldoViaje;

  let saldoRestante = total - parseFloat(info.pagosPendientes);
  if (info.pagosPendientes != 0)
    txtSaldoADescontar.innerHTML = " ($ " + saldoRestante + ")";
}

document.getElementById("nuevoGasto").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
  location.href = "pages/nuevoGasto.html";
});

document.getElementById("tablas").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
  location.href = "pages/tablas.html";
});

document.getElementById("proxPagos").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
  location.href = "pages/proxPagos.html";
});

document.getElementById("deudas").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
  location.href = "pages/deudas.html";
});

document.getElementById("user").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
});
