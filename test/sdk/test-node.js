var config = {
  'host': '127.0.0.1',
  'port': 3000,
  'token': 'harbin',
  'timeout': 5000
};

var api = require('../../sdk/node-sdk')(config);


var username = '1xx0xx0101';
var password = '000000';
var start = '20150713';
var end = '20150720';

api.getCostToday(username, password, function (err, result) {
  if (err) {
    console.log('Error:', err);
  } else {
    console.log(result);
  }
});

api.getCostDuring(username, password, start, end, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log(result);
  }
});
