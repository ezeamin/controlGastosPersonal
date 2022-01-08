export class Deuda {
    constructor(nombre,detalle){
        this.nombre = nombre;
        this.lista = [];
        this.total = 0;
        this.codigoDeudor = this.generarCodigo();
        
        this.cargarDetalle(detalle);
    }

    cargarDetalle(detalle){
        this.lista.push(detalle);

        this.total+=parseFloat(detalle.importe);
    }

    generarCodigo() {
        let codigo = "";
        let caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let longitud = caracteres.length;
        for (let i = 0; i < 5; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * longitud));
        }
        return codigo;
    }
}
