var crypto = require('crypto');
var secret = require('../config/site').secret;

module.exports = function(req, res) {
  var buffer = [];
  var bufferLength = 0;
  req.on('data', function (chunk) {
    buffer.push(chunk);
    bufferLength += chunk.length;
  });
  req.on('end', function (chunk) {
    if (chunk) {
      buffer.push(chunk);
      bufferLength += chunk.length;
    }
    var data;
    if (req.headers['content-type'] === 'application/x-www-form-urlencoded') {
      data = Buffer.concat(buffer, bufferLength).toString();
    } else {
      data = Buffer.concat(buffer, bufferLength);
    }
    var signature = req.headers['x-hub-signature'];
    if(!signature) return res.sendStatus(403);
    signature = signature.replace(/^sha1=/,'');
    var digest = crypto.createHmac('sha1', secret).update(data).digest('hex');
    if (signature !== digest) {
      return res.sendStatus(403);
    }

    var exec = require('child_process').exec;
    var remote = 'origin';
    var branch = 'master';
    var cmdStr = 'git pull ' + remote + ' ' + branch;

    exec(cmdStr, function (err, stdout) {
      if (err) {
        return res.sendStatus(500);
      }
      res.status(200);
      return res.send(stdout);
    });
  });
};

