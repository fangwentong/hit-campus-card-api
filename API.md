API Reference
---

### 获取信息

#### POST 方法

- Get consumption information today

    **POST /api/today**

    Headers required:

      * Host
      * Content-Type: `application/x-www-form-urlencoded` or `application/json`
      * Content-Length
      * x-api-signature: HMAC hex digest of the payload, using site secret as the key.

    Payload:

      * username
      * password



- Get consumption information during certain time period

    **POST /api/during**

    Headers:

      * Host
      * Content-Type: `application/x-www-form-urlencoded` or `application/json`
      * Content-Length
      * x-api-signature: HMAC hex digest of the payload, using site secret as the key.

    Payloads:

      * username
      * password
      * start: start date, such as '20150105'
      * end: end date, such as '20150720'

#### GET 方法

**api_key注册功能尚未完善**


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
