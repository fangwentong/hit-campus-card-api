var api = require('../../sdk/node-sdk');

var username = '11x0010101';
var password = 'xxxxxx';
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
