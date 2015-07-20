var spider = require('../utils/crawler');

var username = '11x0010101';
var password = 'xxxxxx';
var start = '20150713';
var end = '20150720';

spider.login(username, password, function(err, cookie, accountId) {
  if (err) {
    console.log(err);
  } else {
    spider.getCostToday(cookie, accountId, function (err, costToday) {
      if (err) {
        console.log(err);
      } else {
        console.log('Cost Today: ', costToday);
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

