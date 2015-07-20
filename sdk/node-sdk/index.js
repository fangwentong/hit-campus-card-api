var http = require('http');
var config = require('./config.json');
var crypto = require('crypto');

/**
 * Sync
 * @param {String} token Token
 * @param {String} data data to be signatured
 * @return {String} Signature
 */
function generateSignature(token, data) {
  return crypto.createHmac('sha1', token).update(data).digest('hex');
}

/**
 * async
 * @param {String} username Username
 * @param {String} password Password
 * @param {Function} callback Callback function
 */
function getCostToday(username, password, callback) {
  var postData = JSON.stringify({
    'username': username,
    'password': password,
  });

  var options = {
    hostname: config.host,
    port: config.port,
    path: '/api/today',
    method: 'POST',
    headers: {
      'Host': config.host,
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
      'x-api-signature': generateSignature(config.token, postData),
    }
  };

  var req = http.request(options, function(res) {
    var buffer = [];
    var bufferLength = 0;
    res.on('data', function (chunk) {
      buffer.push(chunk);
      bufferLength += chunk.length;
    });
    res.on('end', function (chunk) {
      if (chunk) {
        buffer.push(chunk);
        bufferLength += chunk.length;
      }
      var data = Buffer.concat(buffer, bufferLength);
      var result;

      try {
        result = JSON.parse(data);
      } catch (e) {
        result = false;
      }
      callback(null, result);
    });
  });

  req.setTimeout(config.timeout, function() {
    callback('Request timeout.');
  });

  req.on('error', function (err) {
    callback(err);
  });

  req.write(postData);
  req.end();
}

/**
 * async
 * @param {String} username Username
 * @param {String} password Password
 * @param {String} start Start date
 * @param {String} end End date
 * @param {Function} callback Callback
 */
function getCostDuring(username, password, start, end, callback) {
  var postData = JSON.stringify({
    'start': start,
    'end': end,
    'username': username,
    'password': password,
  });

  var options = {
    hostname: config.host,
    port: config.port,
    path: '/api/during',
    method: 'POST',
    headers: {
      'Host': config.host,
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
      'x-api-signature': generateSignature(config.token, postData),
    }
  };

  var req = http.request(options, function(res) {
    var buffer = [];
    var bufferLength = 0;
    res.on('data', function (chunk) {
      buffer.push(chunk);
      bufferLength += chunk.length;
    });
    res.on('end', function (chunk) {
      if (chunk) {
        buffer.push(chunk);
        bufferLength += chunk.length;
      }
      var data = Buffer.concat(buffer, bufferLength);
      var result;

      try {
        result = JSON.parse(data);
      } catch (e) {
        result = false;
      }

      callback(null, result);
    });
  });

  req.setTimeout(config.timeout, function() {
    callback('Request timeout.');
  });

  req.on('error', function (err) {
    callback(err);
  });

  req.write(postData);
  req.end();
}

exports.getCostToday = getCostToday;
exports.getCostDuring = getCostDuring;
exports.generateSignature = generateSignature;
