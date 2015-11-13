校园卡消费查询API
---

### 身份验证

- 验证身份是否合法

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

### 挂失操作

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

### Deploy

```
npm install
./service start|stop|restart
```
