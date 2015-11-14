校园卡消费查询API
---

HIT校园卡消费信息查询系统, 也适用于其他新中新电子网站查询系统,
通过hacks解决验证码问题, 能够获取用户今日、 特定时间段消费信息,
挂失/解挂失饭卡等操作.

### 设计

核心是一个机器人, 模拟登陆网站，抓取特定数据. 为了提高易用性, 又借助Express将其封装为独立站点, 对外提供Web API 和 SDK.

另外, 为验证用户代理的身份, 增加了数字签名, 目前所有请求均通过POST动词完成,
以site_secret为密钥, 生成报文body的数字签名,作为Request Headers中 `x-api-signature` 的值被一同发送.

只有通过签名验证的消息才能被继续处理, 否则将得到 `80002` 或 `80003` 的错误码.

目前该系统运用于哈工大饮食中心微信平台, 工大学生可以绑定查询消费信息.

![](https://github.com/fangwentong/foodcenter/raw/master/static/image/show/qrcode.jpg)

### 文件列表

```
|
|-- bin
|    |-- listen        # 调用 node-supervisor 监听站点, 用于调试
|    `-- service       # 部署脚本 (作为一种部署方案)
|
|-- config             # 站点配置信息
|    |-- nginx
|    |    `-- nginx.conf                   #  Nginx 配置
|    |
|    |-- supervisord
|    |    `-- CampusCardQueriesCard.conf   # [Supervisor](https://github.com/Supervisor/supervisor) 部署配置
|    |
|    |-- crawler.json  # 新中新服务网络地址配置
|    |-- feedback.json # 全局返回信息配置
|    `-- site.json     # 站点部署信息(host, port, 站点密钥secret等信息)
|
|-- logs
|    |-- access.log    # 访问日志
|    `-- error.log     # 错误日志
|
|-- routes
|    |-- api.js        # Express 站点路由处理逻辑
|    `-- webhook.js    # Github webhook 支持, 用于自动更新
|
|-- sdk
|    |-- node-sdk
|    `-- python_sdk
|
|-- test               # 简单的功能测试， 并没有写单元测试
|
|-- utils
|    `-- crawler.js    # 爬虫机器人核心代码
|
|-- app.js             # 服务集成处
`-- package.json       # 包描述
```


### 身份验证

- 验证身份信息

    POST /api/verification

    Headers required:

        * Host
        * Content-Type: `application/x-www-form-urlencoded` or `application/json`
        * Content-Length
        * x-api-signature: HMAC hex digest of the payload, using site's secret as the key.

    Payload:

        * username
        * password

    Returns @ JSON:

        * errcode: 返回码
        * errmsg: 说明


### 获取消费信息

- 获取今日消费信息

    POST /api/today

    Headers required:

      * Host
      * Content-Type: `application/x-www-form-urlencoded` or `application/json`
      * Content-Length
      * x-api-signature: HMAC hex digest of the payload, using site's secret as the key.

    Payload:

      * username
      * password

    Returns @ JSON:

      * errcode: 返回码
      * cost: 今日消费数额
      * detail: 今日详细消费记录
      * balance: 余额


- 获取特定时间段消费信息

    POST /api/during

    Headers required:

      * Host
      * Content-Type: `application/x-www-form-urlencoded` or `application/json`
      * Content-Length
      * x-api-signature: HMAC hex digest of the payload, using site's secret as the key.

    Payloads:

      * username
      * password
      * start: start date, such as '20150105'
      * end: end date, such as '20150720'

    Returns @ JSON:

      * errcode: 返回码
      * cost: 消费数额

### 挂失/取消挂失操作

- 校园卡挂失

    POST /api/reportloss

    Headers required:

      * Host
      * Content-Type: `application/x-www-form-urlencoded` or `application/json`
      * Content-Length
      * x-api-signature: HMAC hex digest of the payload, using site's secret as the key.

    Payload:

      * username
      * password

    Returns @ JSON:

      * errcode: 返回码
      * errmsg: 说明

- 校园卡取消挂失

    POST /api/unreportloss

    Headers required:

      * Host
      * Content-Type: `application/x-www-form-urlencoded` or `application/json`
      * Content-Length
      * x-api-signature: HMAC hex digest of the payload, using site's secret as the key.

    Payload:

      * username
      * password

    Returns @ JSON:

      * errcode: 返回码
      * errmsg: 说明


### 全局返回码

|返回码|说明|
|:-:|:-:|
|-1|系统繁忙|
|0|请求成功|
|80001|没有权限|
|80002|缺少签名|
|80003|签名验证错误|
|80004|客户端数据有误|
|80005|服务器错误|

### SDK

目前提供了 [Python](sdk/python_sdk) 和 [Node.js](sdk/node-sdk) 版本的SDK.

### 部署

依赖解决:

```
npm install -g supervisor
npm install
```

方案一:

```
./bin/service start|stop|restart
```

方案二:

借助[Supervisor](https://github.com/Supervisor/supervisor)部署站点

``` shell
# Ubuntu
sudo pip install supervisor
sudo ln -s `pwd` /var/www/query
sudo cp config/supervisord/CampusCardQueries.conf /etc/supervisor/conf.d
sudo service supervisor restart
```
