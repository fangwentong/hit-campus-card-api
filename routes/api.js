var express = require('express');
var router = express.Router();
var spider = require('../utils/crawler.js');
var crypto = require('crypto');
var secret = require('../config/site.json').secret;
var querystring = require('querystring');

router.all('*', function(req, res, next) {
  // 签名验证
  var body = req.rawBody.toString();
  var signature = req.headers['x-api-signature'];
  var err = {};
  if(!signature) {
    err.status = 80002;
    next(err);
  }

  var digest = crypto.createHmac('sha1', secret).update(body).digest('hex');
  if (signature !== digest) {
    err.status = 80003;
    next(err);
  } else {
    try {
      if ('application/x-www-form-urlencoded' === req.headers['content-type']) {
        req.body = querystring.parse(body);
      } else {
        req.body = JSON.parse(body);
      }
    } catch (e) {
      req.body = {};
    }
    next();
  }
});

router.post('/verification', function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  spider.login(username, password, function(err) {
    if (err) {
      err.status = 80004;
      next(err);
    } else {
      res.send({
        errcode: 0,
      });
    }
  });
});

router.post('/today', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  spider.login(username, password, function(err, cookie, userInfo) {
    if (err) {
      next(err);
    } else {
      spider.getCostToday(cookie, userInfo.accountId, function (err, costToday, history) {
        if (err) {
          next(err);
        } else {
          res.send({
            errcode: 0,
            cost: costToday,
            detail: history,
            balance: userInfo.balance,
          });
        }
      });
    }
  });
});

router.post('/during', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var start = req.body.start;
  var end = req.body.end;

  spider.login(username, password, function(err, cookie, userInfo) {
    if (err) {
      err.status = 80004;
      next(err);
    } else {
      spider.getCostDuring(start, end, cookie, userInfo.accountId, function (err, cost) {
        if (err) {
          next(err);
        } else {
          res.send({
            errcode: 0,
            cost: cost,
          });
        }
      });
    }
  });
});

router.post('/reportloss', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  spider.login(username, password, function(err, cookie, userInfo) {
    if (err) {
      err.status = 80004;
      next(err);
    } else {
      spider.reportLoss(cookie, userInfo.accountId, password, function (err, feedback) {
        if (err) {
          err.status = 80005;
          next(err);
        } else {
          res.send({
            errcode: 0,
            errmsg: feedback,
          });
        }
      });
    }
  });
});

router.post('/unreportloss', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  spider.login(username, password, function(err, cookie, userInfo) {
    if (err) {
      err.status = 80004;
      next(err);
    } else {
      spider.reportLoss(cookie, userInfo.accountId, password, function (err, feedback) {
        if (err) {
          err.status = 80005;
          next(err);
        } else {
          res.send({
            errcode: 0,
            errmsg: feedback,
          });
        }
      });
    }
  });
});

router.post('/general', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  spider.login(username, password, function(err, cookie, userInfo) {
    if (err) {
      err.status = 80004;
      next(err);
    } else {
      spider.getGeneral(cookie, userInfo.accountId, function (err, cost) {
        if (err) {
          next(err);
        } else {
          res.send({
            errcode: 0,
            today: cost.today,
            last7: cost.last7,
            last30: cost.last30,
          });
        }
      });
    }
  });
});

module.exports = router;
