校园卡消费查询API
---

### 获取信息

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

目前提供了 [python](sdk/python_sdk) 和 [Node.js](sdk/node-sdk) 版本的SDK.

### Deploy

```
./service start|stop|restart
```
