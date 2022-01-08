require('dotenv').config();

const express = require('express');
const morgan = require('morgan');

const app = express();
const routes = require('./routes/index');
require('./database/database');

//settings
app.set('port', process.env.PORT || 5000);

//middlewares
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//routes
app.use(routes);

app.listen(app.get("port"), () => {
  console.log(`Server on port ${app.get("port")}`);
});