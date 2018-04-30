const request = require('request');
const express = require("express")
const python = require("python").shell;
const routes = require("./routes.js")
const app = express();
const uuidv1 = require('uuid/v1')
const bodyParser = require('body-parser')


app.listen(8002, () => console.log('Server Activated port: 8002!'));

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(bodyParser.json({
  extended: true
}));
app.use(express.static(__dirname + '/public'));

app.use("/", routes);





