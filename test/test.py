#!/usr/bin/env python
#coding=utf-8

import sys, os
current_path = os.path.dirname(__file__)
sys.path.insert(0, os.path.join(current_path, '../sdk'))    # 网站根目录加入搜索路径

from python_sdk import ApiClient

username = '1100310101'
password = '000000'
start = '20150701'
end = '20150720'

client = ApiClient('localhost', 3000, 'harbin')

print client.get_cost_today(username, password)
print client.get_cost_during(username, password, start, end)
