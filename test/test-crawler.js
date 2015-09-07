var spider = require('../utils/crawler');

var username = '112031';
var password = '000000';
var start = '20150713';
var end = '20150720';

spider.login(username, password, function(err, cookie, accountId) {
  if (err) {
    console.log(err);
  } else {
    spider.getCostToday(cookie, accountId, function (err, costToday, history, balance) {
      if (err) {
        console.log(err);
      } else {
        console.log('Cost Today: ', costToday);
        console.log(history);
        console.log('余额:' + balance);
      }
    });
    spider.getCostDuring(start, end, cookie, accountId, function (err, cost) {
      if (err) {
      console.log(err);
      } else {
        console.log('Cost During', start, 'and', end, 'is', cost);
      }
    });
  }
});

