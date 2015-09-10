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
    .get(host + '/accountcardUser.action')
    .set('Cookie', cookie)
    .end(function (err, res) {
      if (err) {
        return callback(err);
      } else {
        var $ = cheerio.load(res.text);
        var name = $('.neiwen div')[1].children[0].data;
        var accountId = $('.neiwen div')[3].children[0].data;
        var studentId = $('.neiwen div')[9].children[0].data;
        var balance = $('.neiwen')[46].children[0].data.split('（', 2)[0];
        var userInfo = {
          'name': name,
          'accountId': accountId,
          'studnetId': studentId,
          'balance': balance,
        };
        callback(null, cookie, userInfo);
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
      var list = $('#tables .listbg');
      var list2 = $('#tables .listbg2');
      var history = '';

      var getConRecord = function(item) {
        var time = item.children[1].children[0].data.trim().split(' ')[1];
        var location = item.children[9].children[0].data.trim();
        var cost = item.children[13].children[0].data.trim();
        return [time, location, cost].join('  ') + '元\n';
      };

      for (var i = 0; i < list2.length; i++) {
        history += getConRecord(list[i]);
        history += getConRecord(list2[i]);
      }

      if (list.length > list2.length) {
        history += getConRecord(list[list.length-1]);
      }

      if (costToday[0] === '-') costToday = costToday.slice(1);
      callback(null, costToday, history);
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

/**
 * Report loss of campus card
 *
 * @param {String} cookie  cookie information
 * @param {String} accountId account number
 * @param {String} password
 * @param {Function} callback
 */
exports.reportLoss = function (cookie, accountId, password, callback) {
  var host = config.host;  // server host

  request
  .post(host + '/accountDoLoss.action')
  .set('Cookie', cookie)
  .send('account=' + accountId)
  .send('passwd=' + password)
  .parse(parse('gbk'))
  .end(function (err, res) {
    if (err) {
      callback(err);
    } else {
      var $ = cheerio.load(res.text);
      var feedback = $('p.biaotou')[0].children[0].data;
      callback(null, feedback);
    }
  });
};

/**
 * Cancel report loss of campus card
 *
 * @param {String} cookie  cookie information
 * @param {String} accountId account number
 * @param {String} password
 * @param {Function} callback
 */
exports.unreportLoss = function (cookie, accountId, password, callback) {
  var host = config.host;  // server host

  request
  .post(host + '/accountDoreLoss.action')
  .set('Cookie', cookie)
  .send('account=' + accountId)
  .send('passwd=' + password)
  .parse(parse('gbk'))
  .end(function (err, res) {
    if (err) {
      callback(err);
    } else {
      var $ = cheerio.load(res.text);
      var feedback = $('p.biaotou')[0].children[0].data;
      callback(null, feedback);
    }
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
