import { campoRequeridoSelect } from "./validaciones.js";
import {
  loadInfo,
  actualizarInfo,
  actualizarGasto,
  loadGastosLength,
  loadGastos,
  findGasto,
} from "./DB.js";

let campoFiltroCategoria = document.getElementById("filtroCategoria");
let campoFiltroOrigen = document.getElementById("filtroOrigen");
let campoFiltroPago = document.getElementById("filtroPago");
let campoOrigen = document.getElementById("origen");
let btnCargarMas = document.getElementById("cargarMas");

let max = 10;
let info = await loadInfo(false);
cargarGastos().then(() => {
  document.getElementById("loadingSpinner").style.opacity = "0";
  setTimeout(()=>document.getElementById("loadingSpinner").style.display = "none",350);
});

campoOrigen.addEventListener("blur", () => {
  campoRequeridoSelect(campoOrigen);
});

campoFiltroCategoria.addEventListener("change", () => {
  filtrarTabla(
    campoFiltroCategoria.value,
    campoFiltroPago.value,
    campoFiltroOrigen.value
  );
});
campoFiltroPago.addEventListener("change", () => {
  filtrarTabla(
    campoFiltroCategoria.value,
    campoFiltroPago.value,
    campoFiltroOrigen.value
  );
});
campoFiltroOrigen.addEventListener("change", () => {
  filtrarTabla(
    campoFiltroCategoria.value,
    campoFiltroPago.value,
    campoFiltroOrigen.value
  );
});
btnCargarMas.addEventListener("click", async () => {
  document.getElementById("loadingScreen").style.display = "flex";
  await cargarGastos();
  document.getElementById("loadingScreen").style.display = "none";
});

async function filtrarTabla(categoria, pago, origen) {
  document.getElementById("loadingScreen").style.display = "flex";
  let listaFiltrada = await loadGastos(-2);

  if (categoria == 0 && origen == 0 && pago == 0) {
    limpiarTabla();
    max = 10;
    cargarGastos().then(() => {
      document.getElementById("loadingScreen").style.display = "none";
    });
    return;
  }

  btnCargarMas.style.display = "none";

  if (categoria != "0" || origen != "0" || pago != "0") {
    if (categoria == "0") {
      if (origen == "0") {
        listaFiltrada = listaFiltrada.filter((gasto) => {
          return gasto.pago == pago;
        });
      } else {
        if (pago == "0") {
          listaFiltrada = listaFiltrada.filter((gasto) => {
            return gasto.origen == origen && gasto.categoria != "Fondeo";
          });
        } else {
          listaFiltrada = listaFiltrada.filter((gasto) => {
            return (
              gasto.origen == origen &&
              gasto.categoria != "Fondeo" &&
              gasto.pago == pago
            );
          });
        }
      }
    } else {
      if (origen == "0") {
        if (pago == "0") {
          listaFiltrada = listaFiltrada.filter((gasto) => {
            return gasto.categoria == categoria;
          });
        } else {
          listaFiltrada = listaFiltrada.filter((gasto) => {
            return gasto.categoria == categoria && gasto.pago == pago;
          });
        }
      } else if (pago == "0") {
        listaFiltrada = listaFiltrada.filter((gasto) => {
          return gasto.categoria == categoria && gasto.origen == origen;
        });
      } else {
        listaFiltrada = listaFiltrada.filter((gasto) => {
          return (
            gasto.categoria == categoria &&
            gasto.origen == origen &&
            gasto.pago == pago
          );
        });
      }
    }

    limpiarTabla();
    listaFiltrada.forEach((itemGasto) => {
      crearFila(itemGasto);
    });
    document.getElementById("loadingScreen").style.display = "none";
  }
}

function limpiarTabla() {
  let tabla = document.getElementById("tablaGastos");
  tabla.innerHTML = "";
}

//mostrar fondeo de cuenta

async function cargarGastos() {
  const length = await loadGastosLength(max - 10);
  if (length != 0) {
    let gastos = await loadGastos(max - 10);
    if (length > 10) btnCargarMas.style.display = "block";
    else btnCargarMas.style.display = "none";

    //cargar filas en tabla
    gastos.forEach((itemGasto) => {
      crearFila(itemGasto);
    });
    max += 10;
  } else btnCargarMas.style.display = "none";
}

function crearFila(gasto) {
  let fila = document.getElementById("tablaGastos");

  let debo = "No";
  if (gasto.debo) debo = "Si";

  if (gasto.categoria == "Fondeo" || gasto.categoria == "Pago de deuda") {
    fila.innerHTML += `
            <tr>
            <td id="cat_${gasto.codigo}"> </td>
              <th class="fond_${gasto.codigo}">${gasto.categoria}</th>
              <td class="fond_${gasto.codigo}">${gasto.fecha}</td>
              <td class="fond_${gasto.codigo}">${gasto.concepto}</td>
              <td class="fond_${gasto.codigo}">${gasto.origen}</td>
              <td class="fond_${gasto.codigo}">${gasto.pago}</td>
              <td class="fond_${gasto.codigo}">${gasto.comentario}</td>
              <td class="fond_${gasto.codigo}">${debo}</td>
              <td class="fond_${gasto.codigo}">$ ${gasto.importe}</td>
              <td class="fond_${gasto.codigo}"> </td>
          </tr>`;

    if (gasto.categoria == "Fondeo") {
      let elementos = document.getElementsByClassName(`fond_${gasto.codigo}`);

      for (let i = 0; i < elementos.length; i++) {
        elementos[i].style.backgroundColor = "#c6e5b1";
      }
    }
  } else if (debo == "Si") {
    fila.innerHTML += `
            <tr>
              <td id="cat_${gasto.codigo}"> </td>
              <th class="deb_${gasto.codigo}">${gasto.categoria}</th>
              <td class="deb_${gasto.codigo}">${gasto.fecha}</td>
              <td class="deb_${gasto.codigo}">${gasto.concepto}</td>
              <td class="deb_${gasto.codigo}">${gasto.origen}</td>
              <td class="deb_${gasto.codigo}">${gasto.pago}</td>
              <td class="deb_${gasto.codigo}">${gasto.comentario}</td>
              <td class="deb_${gasto.codigo}">${debo}</td>
              <td class="deb_${gasto.codigo}">$ ${gasto.importe}</td>
              <td class="deb_${gasto.codigo}">
                <button class="btn btn-warning my-1" onclick="prepararEdicionGasto('${gasto.codigo}')">Editar</button>
                <button class="btn btn-danger my-1" data-bs-toggle="modal" data-bs-target="#modalCancelarDeuda" onclick="prepararDevolverDeuda('${gasto.codigo}')">Cancelar deuda</button>
              </td>
          </tr>`;

    let elementos = document.getElementsByClassName(`deb_${gasto.codigo}`);

    for (let i = 0; i < elementos.length; i++) {
      elementos[i].style.backgroundColor = "#FAA0A0";
    }
  } else {
    fila.innerHTML += `
            <tr>
              <td id="cat_${gasto.codigo}"> </td>
              <th>${gasto.categoria}</th>
              <td>${gasto.fecha}</td>
              <td>${gasto.concepto}</td>
              <td>${gasto.origen}</td>
              <td>${gasto.pago}</td>
              <td>${gasto.comentario}</td>
              <td>${debo}</td>
              <td>$ ${gasto.importe}</td>
              <td>
                <button class="btn btn-warning my-1" onclick="prepararEdicionGasto('${gasto.codigo}')">Editar</button>
              </td>
          </tr>`;
  }

  let cat = document.getElementById(`cat_${gasto.codigo}`);
  switch (gasto.categoria) {
    case "Comida/Merienda": {
      cat.style.backgroundColor = "#fff87f";
      break;
    }
    case "Transporte": {
      cat.style.backgroundColor = "#f86f6f";
      break;
    }
    case "Varios": {
      cat.style.backgroundColor = "#b5c5d7";
      break;
    }
    case "Entretenimiento": {
      cat.style.backgroundColor = "#ff35c2";
      break;
    }
    case "Super/Kiosko/Bebida": {
      cat.style.backgroundColor = "#4fa8fb";
      break;
    }
    case "Salida nocturna": {
      cat.style.backgroundColor = "#66d7d1";
      break;
    }
    case "Fondeo": {
      cat.style.backgroundColor = "#b5d57b";
      break;
    }
    case "Gimnasia": {
      cat.style.backgroundColor = "#afcbff";
      break;
    }
    case "Auto/Nafta": {
      cat.style.backgroundColor = "#ffcbc1";
      break;
    }
    case "Estudios": {
      cat.style.backgroundColor = "#aff8db";
      break;
    }
    case "Pago de deuda": {
      cat.style.backgroundColor = "#fdfd96";
      break;
    }
  }
}

window.prepararEdicionGasto = function (codigo) {
  location.href = `editarGasto.html?cod=${codigo}`;
};

window.prepararDevolverDeuda = function (codigo) {
  location.href = "#cod=" + codigo;
};

let formulario = document.getElementById("formularioDeuda");
formulario.addEventListener("submit", cancelarDeuda);

async function cancelarDeuda(e) {
  e.preventDefault();

  campoOrigen.className = "form-control";
  if (campoRequeridoSelect(campoOrigen)) {
    let codigo = location.href.split("=")[1];

    let gasto = await findGasto(codigo);

    let campoIgnorar = document.getElementById("ignorar");
    let ignorar = campoIgnorar.checked;

    if (!ignorar) {
      if (campoOrigen.value == "Efectivo") {
        if (info.saldoEfectivo < parseFloat(gasto.importe)) {
          document.getElementById("errorSelect").innerHTML =
            "El saldo en efectivo es insuficiente";
          campoOrigen.className = "form-control is-invalid";
          return;
        } else info.saldoEfectivo -= parseFloat(gasto.importe);
      } else if (info.saldoTD < parseFloat(gasto.importe)) {
        document.getElementById("errorSelect").innerHTML =
          "El saldo en TD es insuficiente";
        campoOrigen.className = "form-control is-invalid";
        return;
      } else info.saldoTD -= parseFloat(gasto.importe);
    }

    gasto.debo = false;
    if (gasto.comentario.indexOf("(Cancelado)") == -1)
      gasto.comentario += " (Cancelado)";
    gasto.comentario.trimStart();

    await actualizarGasto(gasto);
    if (!ignorar) await actualizarInfo(info);

    Swal.fire({
      title: "Deuda cancelada",
      text: "El gasto se ha cancelado correctamente",
      icon: "success",
      timer: 2000,
      showCancelButton: false,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "/pages/tablas.html";
    });
  } else {
    campoOrigen.className = "form-control is-invalid";
  }
}
