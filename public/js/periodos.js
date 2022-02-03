import { loadInfo, loadOld } from "./DB.js";

document.getElementById("loadingScreen").style.display = "none";
loadOld().then(async (periodos) => {    
 if(periodos.length != 0){
    periodos.map((old, index) => {
        crearElemento(old,index);
    });
    document.getElementById("datosVacios").style.display = "none";
  }
    await loadInfo(true);
});

document.getElementById("user").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
});
document.getElementById("index").addEventListener("click", () => {
  document.getElementById("loadingScreen").style.display = "flex";
});

function crearElemento(old, index) {
  let fila = document.getElementById("acordeonPeriodos");

  fila.innerHTML += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="${"heading" + index}">
            <button class="accordion-button bg-light collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${"collapse" + index}" aria-expanded="false" aria-controls="${"collapse" + index}">
            Periodo ${old.fechaInicio} - ${old.fechaFin}
            </button>
        </h2>
        <div id="${"collapse" + index}" class="accordion-collapse collapse" aria-labelledby="${"heading" + index}" data-bs-parent="acordeonPeriodos">
            <div class="accordion-body bg-light">
                <p>Dias transcurridos: ${old.dias}</p>
                <p>Gastos realizados: ${old.gastos.length}</p>
                <p>Total gastado: $ ${old.stats.total}</p>
                <ul>
                    <li>Efectivo propio: $ ${
                      old.stats.gastos.efectivoPropio
                    }</li>
                    <li>Efectivo papas: $ ${old.stats.gastos.efectivoPapas}</li>
                    <li>Tarjeta de crédito (total): $ ${
                      old.stats.gastos.TC
                    }</li>
                    <li>Tarjeta de crédito propio: $ ${
                      old.stats.gastos.TCPropio
                    }</li>
                    <li>Tarjeta de débito: $ ${old.stats.gastos.TD}</li>
                </ul>
                <p>Promedios</p>
                <ul>
                    <li>Diario: $ ${old.stats.promedioDiario}</li>
                    <li>Diario propio: $ ${old.stats.promedioDiarioPropio}</li>
                    <li>Porcentaje propio: ${old.stats.porcentajePropio}%</li>
                    <li>Porcentaje papas: ${old.stats.porcentajePapas}%</li>
                    <li>Porcentaje ajeno: ${old.stats.porcentajeAjeno}%</li>
                </ul>
                <p>Valores Iniciales / Finales</p>
                <ul>
                    <li>Efectivo: $ ${old.stats.iniciales.efectivo} / $${
    old.stats.finales.efectivo
  }</li>
                    <li>Tarjeta de débito: $ ${old.stats.iniciales.TD} / $${
    old.stats.finales.TD
  }</li>
                </ul>
            </div>
        </div>
    </div>`;
}
