#!/usr/bin/env python
#coding=utf-8

import urllib, httplib, hashlib, hmac, json

httpClient = None
site = {
    'host': '',
    'port': 80,
    'token': 'harbin',
}

class ApiClient():
    def __init__(self, host = site["host"], port = site["port"], token = site["token"]):
        self.host = host
        self.port = port
        self.token = token

    def generateSignature(self, data):
        return hmac.new(self.token, data, hashlib.sha1).hexdigest()

    def get_cost_today(self, username, password):
        host = self.host + (':' + str(self.port) if self.port != 80 else '')
        try:
            postData = urllib.urlencode(dict(username = username, password = password))
            headers = {
                'Host': host,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len(postData),
                'x-api-signature': self.generateSignature(postData)
            }
            httpClient = httplib.HTTPConnection(self.host, self.port)
            httpClient.request('POST', '/api/today', postData, headers);
            res = httpClient.getresponse()
            data = res.read()
            httpClient.close()
            return json.loads(data)
        except Exception, e:
            print e

    def get_cost_during(self, username, password, start, end):
        host = self.host + (':' + str(self.port) if self.port != 80 else '')
        try:
            postData = urllib.urlencode(dict(
                username = username,
                password = password,
                start = start,
                end = end,
            ))
            headers = {
                'Host': host,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len(postData),
                'x-api-signature': self.generateSignature(postData)
            }
            httpClient = httplib.HTTPConnection(self.host, self.port)
            httpClient.request('POST', '/api/during', postData, headers);
            res = httpClient.getresponse()
            data = res.read()
            httpClient.close()
            return json.loads(data)
        except Exception, e:
            print e

    def get_general(self, username, password):
        host = self.host + (':' + str(self.port) if self.port != 80 else '')
        try:
            postData = urllib.urlencode(dict(username = username, password = password))
            headers = {
                'Host': host,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len(postData),
                'x-api-signature': self.generateSignature(postData)
            }
            httpClient = httplib.HTTPConnection(self.host, self.port)
            httpClient.request('POST', '/api/general', postData, headers);
            res = httpClient.getresponse()
            data = res.read()
            httpClient.close()
            return json.loads(data)
        except Exception, e:
            print e

    def verify(self, username, password):
        host = self.host + (':' + str(self.port) if self.port != 80 else '')
        try:
            postData = urllib.urlencode(dict(username = username, password = password))
            headers = {
                'Host': host,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len(postData),
                'x-api-signature': self.generateSignature(postData)
            }
            httpClient = httplib.HTTPConnection(self.host, self.port)
            httpClient.request('POST', '/api/verification', postData, headers);
            res = httpClient.getresponse()
            data = res.read()
            httpClient.close()
            result = json.loads(data)
            if result.get('errcode', '') == 0:
                return True
            else:
                return False
        except ValueError:
            return None
        except Exception:
            return False

    def report_loss(self, username, password):
        host = self.host + (':' + str(self.port) if self.port != 80 else '')
        try:
            postData = urllib.urlencode(dict(username = username, password = password))
            headers = {
                'Host': host,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len(postData),
                'x-api-signature': self.generateSignature(postData)
            }
            httpClient = httplib.HTTPConnection(self.host, self.port)
            httpClient.request('POST', '/api/reportloss', postData, headers)
            res = httpClient.getresponse()
            data = res.read()
            httpClient.close()
            return json.loads(data)
        except Exception, e:
            print str(e)

    def cancel_report_loss(self, username, password):
        host = self.host + (':' + str(self.port) if self.port != 80 else '')
        try:
            postData = urllib.urlencode(dict(username = username, password = password))
            headers = {
                'Host': host,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': len(postData),
                'x-api-signature': self.generateSignature(postData)
            }
            httpClient = httplib.HTTPConnection(self.host, self.port)
            httpClient.request('POST', '/api/unreportloss', postData, headers)
            res = httpClient.getresponse()
            data = res.read()
            httpClient.close()
            return json.loads(data)
        except Exception, e:
            print str(e)
