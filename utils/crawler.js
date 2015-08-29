var cheerio = require('cheerio');
var request = require('superagent');
var parse = require('superagentparse');
var config = require('../config/crawler.json');
var querystring = require('querystring');
var eventproxy = require('eventproxy');
var moment = require('moment');

/**
 * Login with username and password
 * @param {String} username Username
 * @param {String} password Password
 * @param {funcition} callback callback
 */
exports.login = function(username, password, callback) {
  var host = config.host;  // server host
  var ep  = new eventproxy();

  /* GET cookie*/
  request
  .get(host + '/homeLogin.action')
  .set('host', host)
  .set('User-Agent', config.userAgent)
  .end(function (err, res) {
    if (err) {
      return callback(err);
    } else {
      var cookie = res.header['set-cookie'][0].split(';')[0];
      if (!cookie) {
        return callback('cookie not set!');
      } else {
        return ep.emit('cookieGot', cookie);
      }
    }
  });

  /*set verification code to 4015*/
  ep.on('cookieGot', function(cookie) {
    request
    .get(host + '/getCheckpic.action')
    .query('rand=4015.2017842046916')
    .set('host', host)
    .set('cookie', cookie)
    .set('User-Agent', config.userAgent)
    .end(function (err) {
      if (err) {
        return callback(err);
      } else {
        return ep.emit('codeSet', cookie, '4015');
      }
    });
  });

  /*Login with cookie and verification code */
  ep.on('codeSet', function(cookie, code) {
    var postData = querystring.stringify({
      'name': username,
      'userType': 1,
      'passwd': password,
      'loginType': 2,
      'rand': code,
    });
    request
    .post(host+'/loginstudent.action')
    .set('Cookie', cookie)
    .send(postData)
    .end(function (err) {
      if (err) {
        return callback(err);
      } else {
        return ep.emit('loginSuccess', cookie);
      }
    });
  });

  /* Fetch User id */
  ep.on('loginSuccess', function(cookie) {
    request
    .get(host + '/accounthisTrjn.action')
    .set('Cookie', cookie)
    .end(function (err, res) {
      if (err) {
        return callback(err);
      } else {
        var $ = cheerio.load(res.text);
        var accountId = $('#account').val();
        callback(null, cookie, accountId);
      }
    });
  });
};


/**
 * consumption today
 * @param {String} cookie Cookie infomation
 * @param {String} accountId account number
 * @param {Function} callback Callback function
 */
exports.getCostToday = function (cookie, accountId, callback) {
  var host = config.host;  // server host

  request
  .post(host + '/accounttodatTrjnObject.action')
  .set('Cookie', cookie)
  .send('account=' + accountId)
  .send('inputObject=15')
  .parse(parse('gbk'))
  .end(function (err, res) {
    if (err) {
      callback(err);
    } else {
      var $ = cheerio.load(res.text);
      var infoToday = $('#tables .bl').last().text();
      var regCostToday = /:([0-9\.-]*)（/;
      var costToday = regCostToday.exec(infoToday)[1];
      // Get other information here

      if (costToday[0] === '-') costToday = costToday.slice(1);
      callback(null, costToday);
    }
  });
};


/**
 * get consume information during certain period
 *
 * @param {String} start date start
 * @param {String} end date end
 * @param {String} cookie  cookie information
 * @param {String} accountId account number
 * @param {Function} callback
 */

exports.getCostDuring = function (start, end, cookie, accountId, callback) {
  var host = config.host;  // server host
  var ep = new eventproxy();
  var startTime = start;
  var endTime =  end;

  //
  request
  .get(host + '/accounthisTrjn.action')
  .set('Cookie', cookie)
  .end(function (err, res) {
    if (err) {
      return callback(err);
    } else {
      var $ = cheerio.load(res.text);
      var link = $('#accounthisTrjn')[0].attribs.action;
      ep.emit('step1Success', link);
    }
  });

  ep.on('step1Success', function(postUrl) {
    request
    .post(host + postUrl)
    .set('Cookie', cookie)
    .send('account='+accountId)
    .send('inputObject=15')
    .end(function (err, res) {
      if (err) {
        return callback(err);
      } else {
        var $ = cheerio.load(res.text);
        var link2 = $('#accounthisTrjn')[0].attribs.action;
        ep.emit('step2Success', link2);
      }
    });
  });

  // Post selected date interval
  ep.on('step2Success', function(postUrl) {
    request
    .post(host + postUrl)
    .set('Cookie', cookie)
    .send('inputStartDate=' + startTime)
    .send('inputEndDate=' + endTime)
    .end(function (err, res) {
      if (err) {
        return callback(err);
      } else {
        var $ = cheerio.load(res.text);
        var link3 = $('form[name=form1]')[0].attribs.action;
        ep.emit('step3Success', link3);
      }
    });
  });

  // Get result pages
  ep.on('step3Success', function(postUrl) {
    request
    .get(host + '/accounthisTrjn.action' + postUrl)
    .set('Cookie', cookie)
    .parse(parse('gbk'))
    .end(function (err, res) {
      if (err) {
        return callback(err);
      } else {
        var $ = cheerio.load(res.text);
        var info = $('#tables .bl').last().text();
        var regCostDuring = /:([0-9\.-]*)（/;
        var cost = regCostDuring.exec(info)[1];
        // Get other information

        if (cost[0] === '-') cost = cost.slice(1);
        callback(null, cost);
      }
    });
  });
};

exports.getGeneral = function (cookie, accountId, callback) {
  var ep = new eventproxy();
  var now = moment();
  var today = now.format('YYYYMMDD');
  var last7 = now.add(-7, 'days').format('YYYYMMDD');
  var last30 = now.add(-30, 'days').format('YYYYMMDD');
  exports.getCostToday(cookie, accountId, function(err, cost) {
    if (err) {
      callback(err);
    } else {
      return ep.emit('today', cost);
    }
  });
  exports.getCostDuring(last7, today, cookie, accountId, function(err, cost) {
    if (err) {
      callback(err);
    } else {
      return ep.emit('last7', cost);
    }
  });
  exports.getCostDuring(last30, today, cookie, accountId, function(err, cost) {
    if (err) {
      callback(err);
    } else {
      return ep.emit('last30', cost);
    }
  });
  ep.all('today', 'last7', 'last30', function(today, last7, last30) {
    return callback(null, {
      'today': today,
      'last7': last7,
      'last30': last30,
    });
  });
};
