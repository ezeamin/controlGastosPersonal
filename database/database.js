const { mongodb } = require("./keys");
const mongoose = require("mongoose");

mongoose
  .connect(mongodb.URI, { useNewUrlParser: true})
  .then((db) => console.log("DB is connected"))
  .catch((err) => console.log(err));
