const express = require("express");
const router = express.Router();
const path = require("path");

const publicPath = path.join(__dirname, "../public");
const DbInfo = require("../models/info");
const DbGastos = require("../models/gastos");
const DbDeudas = require("../models/deudas");
const DbPagos = require("../models/pagos");

router.post("/transfer", (req, res) => {
  console.log(req.body);
  transferir(req.body);
  res.json({ code: 200 });
});

router.post("/nuevoGasto", (req, res) => {
  let gasto = req.body;
  DbGastos.create(gasto)
    .then(() => {
      res.status(200).json({ code: 200 });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ code: 500 });
    });
});

router.get("/info", (req, res) => {
  DbInfo.findOne({})
    .then((info) => {
      res.status(200).json(info);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ code: 500 });
    });
});

router.put("/info", (req, res) => {
  DbInfo.findOneAndUpdate({}, req.body).then(() => {
    res.end();
  });
});

router.post("/nuevoUsuario", (req, res) => {
  let usuario = req.body;
  DbInfo.create(usuario)
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(500);
    });
});

router.get("/gastos/:min", async (req, res) => {
  let min = req.params["min"];

  let gastos;
  if (min == -1) {
    gastos = await DbGastos.find({}, "pago origen importe categoria");
  } else
    gastos = await DbGastos.find({}).sort({ mongoDate: -1 }).skip(min).limit(10);

  res.status(200).json(gastos);
});

router.get("/gastosLength/:min", async (req, res) => {
  let min = req.params["min"];

  const length = (await DbGastos.countDocuments({})) - parseInt(min);

  res.status(200).json({ length });
});

router.get("/gastos/:codigo", async (req, res) => {
  let codigo = req.params["codigo"];

  let gasto = await DbGastos.findOne({ codigo });

  res.status(200).json(gasto);
});

router.put("/gastos/:codigo", async (req, res) => {
  let codigo = req.params["codigo"];

  let gasto = req.body;

  await DbGastos.findOneAndUpdate({ codigo }, gasto);

  res.status(200).json({ code: 200 });
});

router.put("/deudasC/:codigo", async (req, res) => {
  let codigo = req.params["codigo"];

  let deuda = req.body;

  await DbDeudas.findOneAndUpdate({ codigo }, deuda);

  res.status(200).json({ code: 200 });
});

router.delete("/deudas", async (req, res) => {
  let deudor = req.body;
  
  await DbDeudas.deleteOne({ codigoDeudor: deudor.codigoDeudor });

  res.status(200).json({ code: 200 });
});

router.get("/searchDeuda/:param", async (req, res) => {
  let deudor;

  let param = req.params["param"];
  console.log(param);
  if (param.charAt(param.length - 1) == "*") {
    param = param.substring(0, param.length - 1);
    deudor = await DbDeudas.findOne({ codigoDeudor: param });
  } else deudor = await DbDeudas.findOne({ nombre: param });

  res.status(200).json(deudor);
});

router.post("/nuevaDeuda", (req, res) => {
  const deuda = req.body;
  DbDeudas.create(deuda)
    .then(() => {
      res.status(200).json({ code: 200 });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ code: 500 });
    });
});

router.get("/deudas/:opc", (req, res) => {
  let opc = req.params["opc"];

  if (opc == "lista") {
    DbDeudas.find({}, "lista")
      .then((deudas) => {
        res.status(200).json(deudas);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ code: 500 });
      });
  } else {
    DbDeudas.find({})
      .then((deudas) => {
        res.status(200).json(deudas);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ code: 500 });
      });
  }
});

router.get("/pagos", async (req, res) => {
  const pagos = await DbPagos.find({});

  res.status(200).json(pagos);
});

router.post("/pagos", async (req, res) => {
  const pago = req.body;

  DbPagos.create(pago);

  res.sendStatus(200);
});

router.delete("/pagos/:cod", async (req, res) => {
  const cod = req.params["cod"];

  await DbPagos.deleteOne({ codigo: cod });

  res.sendStatus(200);
});

//

router.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

//

class Gasto {
  constructor(concepto,categoria,importe,origen,pago,comentario,codigo,fecha,debo) {
    this.concepto = concepto;
    this.categoria = categoria;
    this.importe = importe;
    this.origen = origen;
    this.pago = pago;
    this.comentario = comentario;
    this.codigo = codigo;
    this.fecha = fecha;
    this.debo = debo;
    this.mongoDate = new Date();
  }
}

const transferir = (datos) => {
  let info = datos.info;
  let gastos = datos.gastos;
  let deudas = datos.deudas;
  let pagos = datos.proxPagos;

  DbInfo.create(info);

  gastos.forEach((gasto) => {
    newGasto = new Gasto(
      gasto.concepto,
      gasto.categoria,
      gasto.importe,
      gasto.origen,
      gasto.pago,
      gasto.comentario,
      gasto.codigo,
      gasto.fecha,
      gasto.debo,
    )

    DbGastos.create(newGasto);
  });

  deudas.forEach(deuda => {
    DbDeudas.create(deuda);
  });

  pagos.forEach(pago => {
    DbPagos.create(pago);
  });
};

module.exports = router;
