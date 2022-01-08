export class Pago{
    constructor(concepto,importe,fecha,comentario){
        this.codigo = this.generarCodigo();
        this.concepto = concepto;
        this.importe = importe;
        this.fechaVencimiento = this.convertirFecha(fecha);
        this.fechaRegistro = this.getDate();
        this.comentario = comentario;
    }

    convertirFecha(fecha){
        let fechaSplit = fecha.split("-");

        return `${fechaSplit[2]}/${fechaSplit[1]}/${fechaSplit[0]}`;
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
    
        let fecha = dd + '/' + mm + '/' + yyyy;
    
        let hour=today.getHours();
        let minute=today.getMinutes();
        let second=today.getSeconds();
    
        if(hour<10) {
            hour = '0' + hour;
        }
    
        if(minute<10) {
            minute = '0' + minute;
        }
    
        if(second<10) {
            second = '0' + second;
        }
    
        fecha += ' - ' + hour + ':' + minute + ':' + second;
    
        return fecha;
    }
}