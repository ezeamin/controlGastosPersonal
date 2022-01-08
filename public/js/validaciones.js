export function campoRequerido(campo) {
  if (campo.value.trim() == "") {
    campo.className = "form-control is-invalid";
    return false;
  } else {
    campo.className = "form-control";
    return true;
  }
}

export function campoRequeridoSelect(campo) {
  if (campo.value == "0") {
    campo.className = "form-select is-invalid";
    return false;
  } else {
    campo.className = "form-select";
    return true;
  }
}

export function validarNumeros(input) {
  let patron = /^[+]?((\d+(\.\d*)?)|(\.\d+))$/;
  if (!patron.test(input.value)) {
    input.className = "form-control is-invalid";
    return false;
  } else {
    input.className = "form-control";
    return true;
  }
}

export function validarFecha(input) {
  let patron = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
  if (input.value.length == 0 || !patron.test(input.value)) {
    input.className = "form-control is-invalid";
    return false;
  } else {
    input.className = "form-control";
    return true;
  }
}

export function validarFechaFutura(input) {
  let fechaActual = new Date().getTime();
  let fechaPago = new Date(input.value).getTime();

  if (fechaPago <= fechaActual) {
    input.className = "form-control is-invalid";
    return false;
  } else {
    input.className = "form-control";
    return true;
  }
}

export function validarCampos() {
  let error = false;
  let campos = document.getElementsByClassName("form-control");
  if (!campoRequerido(campos[0])) error = true;
  if (!campoRequerido(campos[1]) && !validarNumeros(campos[1])) error = true;

  campos = document.getElementsByClassName("form-select");
  if (!campoRequeridoSelect(campos[0])) error = true;
  if (!campoRequeridoSelect(campos[1])) error = true;
  if (!campoRequeridoSelect(campos[2])) error = true;

  if (error) {
    return false;
  }
  return true;
}

export function validarCamposNuevoUsuario() {
  let error = false;
  let campos = document.getElementsByClassName("form-control");
  if (!campoRequerido(campos[0])) error = true;
  if (!campoRequerido(campos[1]) || !validarNumeros(campos[1])) error = true;
  if (!campoRequerido(campos[2]) || !validarNumeros(campos[2])) error = true;
  if (!campoRequerido(campos[3]) || !validarNumeros(campos[3])) error = true;

  if (error) {
    return false;
  }
  return true;
}

export function validarCamposNuevoIngreso() {
  let error = false;
  let campos = document.getElementsByClassName("form-control");
  if (!campoRequerido(campos[0])) error = true;
  if (!campoRequeridoSelect(campos[1])) error = true;

  if (error) {
    return false;
  }
  return true;
}

export function validarCamposDeuda() {
  let error = false;
  let campos = document.getElementsByClassName("form-control");
  if (!campoRequerido(campos[1])) error = true; //desde el 1 porque el 0 es el comentario del form anterior
  if (!campoRequerido(campos[2]) && !validarNumeros(campos[2])) error = true;
  if (!campoRequerido(campos[3])) error = true;

  campos = document.getElementsByClassName("form-select");
  if (!campoRequeridoSelect(campos[1])) error = true;
  if (campos[1].value == "Plata propia" && !campoRequeridoSelect(campos[2])) error = true;

  if (error) {
    return false;
  }
  return true;
}

export function validarCamposPago() {
  let error = false;
  let campos = document.getElementsByClassName("form-control");
  for (let i = 1; i < campos.length-1; i++) {
    //desde 1 porque el 0 es el comentario del otro modal
    if (!campoRequerido(campos[i])) error = true;
  }

  if (!validarNumeros(campos[2])) error = true;
  if (validarFecha(campos[3])) {
    if (!validarFechaFutura(campos[3])) {
      document.getElementById("fechaIncorrecta").innerHTML =
        "La fecha no puede ser anterior a la actual";
      error = true;
    }
  }
  else error=true;  

  if (error) {
    return false;
  }
  return true;
}
