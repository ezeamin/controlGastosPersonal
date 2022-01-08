import { loadInfo } from "./DB.js";

let txtSaldoEfectivo = document.getElementById("saldoEfectivo");
let txtSaldoTD = document.getElementById("saldoTD");
let txtSaldoTotal = document.getElementById("saldoTotal");
let txtSaldoADescontar = document.getElementById("saldoADescontar");

let info = await loadInfo(true);

if (info == null) {
  location.href = "pages/newUser.html";
} else {
  txtSaldoEfectivo.innerHTML += info.saldoEfectivo;
  txtSaldoTD.innerHTML += info.saldoTD;

  let total = parseInt(info.saldoEfectivo) + parseInt(info.saldoTD);
  txtSaldoTotal.innerHTML += total;

  let saldoRestante = total - parseFloat(info.pagosPendientes);
  if (info.pagosPendientes != 0)
    txtSaldoADescontar.innerHTML = " ($ " + saldoRestante + ")";
}
