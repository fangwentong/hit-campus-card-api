#!/usr/bin/env python
#coding=utf-8

from python_sdk import ApiClient


username = '1100310101'
password = '000000'
start = '20150701'
end = '20150720'

client = ApiClient('localhost', 3000, 'harbin')

print client.get_cost_today(username, password)
print client.get_cost_during(username, password, start, end)
