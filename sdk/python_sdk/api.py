#!/usr/bin/env python
#coding=utf-8

import urllib, httplib, hashlib, hmac, json

httpClient = None

class ApiClient():
    def __init__(self, host, port, token):
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
