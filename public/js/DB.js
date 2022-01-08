let txtUser = document.getElementById("user");

export async function loadInfo(desactivarSpinner) {
  const res = await fetch("/info", {
    method: "GET",
  });
  const info = await res.json();

  try {
    txtUser.innerHTML = info.nombre;
  } catch (err) {
    console.log(err);
  }
  if (desactivarSpinner){
    document.getElementById("loadingSpinner").style.opacity = "0";
    setTimeout(()=>document.getElementById("loadingSpinner").style.display = "none",350);
  }
  return info;
}

export async function actualizarInfo(info) {
  const res = await fetch("/info", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(info),
  });
}

export async function cargarGasto(gasto) {
  const res = await fetch("/nuevoGasto", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gasto),
  });
  const data = await res.json();

  return data;
}

export function cargarInfo(nuevoUsuario) {
  fetch("/nuevoUsuario", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(nuevoUsuario),
  }).then((res) => {
    if (res.status == 200) {
      Swal.fire({
        title: "Bienvenido",
        timer: 2000,
        showCancelButton: false,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "/index.html";
      });
    } else {
      Swal.fire({
        title: "Error",
        timer: 2000,
        showCancelButton: false,
        showConfirmButton: false,
      }).then(() => {
        window.location.refresh();
      });
    }
  });
}

export async function findGasto(codigo) {
  const res = await fetch(`/gastos/${codigo}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const gasto = await res.json();

  return gasto;
}

export async function actualizarGasto(gasto) {
  const res = await fetch(`/gastos/${gasto.codigo}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(gasto),
  });
}

export async function loadGastos(min) {
  const res = await fetch(`/gastos/${min}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const gastos = await res.json();

  if (gastos == null) return [];

  return gastos;
}

export async function loadGastosLength(min) {
  const res = await fetch(`/gastosLength/${min}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const length = await res.json();

  return length.length;
}

export async function findDeuda(param, tipo) {
  let res;
  if (tipo == "name") {
    res = await fetch(`/searchDeuda/${param}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    res = await fetch(`/searchDeuda/${param}*`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const deudor = await res.json();

  return deudor;
}

export async function actualizarDeuda(deuda) {
  await fetch(`/deudasC/${deuda.codigoDeudor}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deuda),
  });
}

export async function removeFromDeudas(deudor) {
  await fetch(`/deudas`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deudor),
  });
}

export async function cargarDeuda(deuda) {
  const res = await fetch("/nuevaDeuda", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(deuda),
  });
  const data = await res.json();

  return data;
}

export async function loadDeudas(soloLista) {
  let res;
  if (soloLista) {
    res = await fetch(`/deudas/lista`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  } else {
    res = await fetch(`/deudas/all`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
  const deudas = await res.json();

  if (deudas == null) return [];

  return deudas;
}

export async function loadPagos() {
  const res = await fetch(`/pagos`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const pagos = await res.json();

  if (pagos == null) return [];

  return pagos;
}

export async function cargarPago(pago) {
  await fetch(`/pagos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pago),
  });
}

export async function deletePago(codigo) {
  await fetch(`/pagos/${codigo}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    }
  });
}

export async function transferOldData(total,totalPropio,totalPapas,dias,efectivoPropio,efectivoPapas,TC,TCPropio,TD){
  await fetch(`/transferOldData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({total,totalPropio,totalPapas,dias,efectivoPropio,efectivoPapas,TC,TCPropio,TD}),
  });
}
