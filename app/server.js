var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();
app.get('/', function (req, res) {
  res.send('Hello World')
});

app.listen(3000);

console.log('Express server listening on port ' + 3000);