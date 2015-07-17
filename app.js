var express = require('express');
var morgan = require('morgan');
var fs = require('fs');
var http = require('http');

var site = require('./config/site.json');
var msgs = require('./config/feedback.json');
// var register = require('./register');
// var info = require('./info');

var logDirectory = __dirname + '/logs';
if(!fs.existsSync(logDirectory))  fs.mkdirSync(logDirectory, '0755');
var accessLogfile =
  fs.createWriteStream(logDirectory + '/access.log', { flags: 'a' });
var errorLogfile =
  fs.createWriteStream(logDirectory + '/error.log', { flags: 'a' });

var app = express();

if (app.get('env') === 'development') app.use(morgan('dev'));
if (app.get('env') === 'production') {
  app.use(morgan('combined', {stream: accessLogfile}));
}

// register
// app.use('/api/register', register);
// // get information
// app.use('/api/information', info);

// Github webhook
app.post('/update_hook', require('./routes/webhook'));


// 未定义路由
app.use(function(req, res, next) {
  var err = new Error('');
  err.status = 80001;
  next(err);
});

/**
 * 错误处理
 */
app.use(function(err, req, res, next) {
  var meta = '[' + new Date() + ']' + req.url + '\n';
  errorLogfile.write(meta + err.stack + '\n', 'utf-8');
  var errcode = err.status || 80005;
  res.send({errcode: errcode, errmsg: msgs[errcode]});
});


var port = process.env.PORT || site.port;
app.set('port', port);
var server = http.createServer(app);
server.listen(site.port, function () {
  console.log('Sevice is running at ' + site.root + ':' + site.port);
});

server.on('error', function (error) {
  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
});
