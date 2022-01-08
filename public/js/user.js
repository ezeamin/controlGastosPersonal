export class User{
    constructor(nombre, saldoEfectivo, saldoTD){
        this.nombre = nombre;
        this.saldoEfectivo = parseFloat(saldoEfectivo);
        this.saldoTD = parseFloat(saldoTD);
        this.gastoTC = 0;
        this.fecha = this.getDate();
        this.iniciales = [parseFloat(saldoEfectivo), parseFloat(saldoTD)];
        this.pagosPendientes = 0;
    }

    get getNombre(){
        return this.nombre;
    }

    get getSaldoEfectivo(){
        return this.saldoEfectivo;
    }

    get getGastoTC(){
        return this.gastoTC;
    }

    get getFecha(){
        return this.fecha;
    }

    get getIniciales(){
        return this.iniciales;
    }

    set setNombre(nombre){
        this.nombre = nombre;
    }

    set setSaldoEfectivo(saldoEfectivo){
        this.saldoEfectivo = saldoEfectivo;
    }

    set setGastoTC(gastoTC){
        this.gastoTC = gastoTC;
    }

    set setFecha(fecha){
        this.fecha = fecha;
    }

    set setIniciales(iniciales){
        this.iniciales = iniciales;
    }

    getDate(){
        let today = new Date();
        let dd = today.getDate();
        let mm = today.getMonth()+1;
        let yyyy = today.getFullYear();

        if(dd<10) {
            dd = '0' + dd;
        } 

        if(mm<10) {
            mm = '0' + mm;
        } 

        today = dd + '/' + mm + '/' + yyyy;
        return today;
    }
}