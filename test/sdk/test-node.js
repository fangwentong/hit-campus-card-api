var api = require('../../sdk/node-sdk');

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
