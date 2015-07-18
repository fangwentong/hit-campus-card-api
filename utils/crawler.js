var cheerio = require('cheerio');
var request = require('superagent');
var parse = require('superagentparse');
var config = require('../config/crawler.json');
var querystring = require('querystring');
var eventproxy = require('eventproxy');

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
  .get(config.host + '/homelogin.action')
  .set('host', host)
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
    .get('/getcheckpic.action')
    .query('rand', '4015.2017842046916')
    .set('host', host)
    .set('cookie', cookie)
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
        console.log('Login Success: ', username, password);
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
 * @param {String} accoutId accout number
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
      var costToday = /-([0-9.]*)/.exec(infoToday)[1];
      // Get other information here

      callback(null, costToday);
    }
  });
};


/**
 * get consume information during certain period
 *
 * @param {Date} start
 * @param {Date} end
 * @param {String} cookie  cookie information
 * @param {String} accountId account number
 * @param {Function} callback
 */

exports.getCostDuring = function (start, end, cookie, accoutId, callback) {
  var host = config.host;  // server host
  var ep = new eventproxy();
  var startTime;
  var endTime;

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
    .set('Cookie', config.cookie)
    .send('account='+accoutId)
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
    .set('Cookie', config.cookie)
    .send('inputStartDate=' + startTime)
    .send('inputStartDate=' + endTime)
    .end(function (err, res) {
      if (err) {
        return callback(err);
      } else {
        var $ = cheerio.load(res.text);
        var link3 = $('#accounthisTrjn')[0].attribs.action;
        ep.emit('step3Success', link3);
      }
    });
  });

  // Get result pages
  ep.on('step3Success', function(postUrl) {
    request
    .post(host + postUrl)
    .set('Cookie', config.cookie)
    .end(function (err, res) {
      if (err) {
        return callback(err);
      } else {
        var $ = cheerio.load(res.text);
        var info = $('#tables .bl').last().text();
        var cost = /-([0-9.]*)/.exec(info)[1];
        // Get other information

        callback(null, cost);
      }
    });
  });
};

