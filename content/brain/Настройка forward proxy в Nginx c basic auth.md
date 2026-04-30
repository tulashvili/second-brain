---
slug: brain/nastroyka-forward-proxy-v-nginx-c-basic-auth
title:
draft: false
tags:
  - tutorials
  - public
date: 2025-01-16
updated: 2026-04-06T15:11:30+03:00
url:
  - https://www.baeldung.com/nginx-forward-proxy
  - https://www.digitalocean.com/community/tutorials/how-to-set-up-password-authentication-with-nginx-on-ubuntu-20-04
---
## [[Nginx]]

### Настройка [[Proxy]]

В `/etc/nginx.nginx.conf` или `/etc/nginx/sites-enabled/<name>` добавляем следующий конфиг:

```
server {

    listen 8888;
    error_log /var/log/nginx/nginx_proxy_debug.log debug;

    location / {

        resolver 8.8.8.8;

        proxy_pass http://$http_host$uri$is_args$args;

    }

}
```

- где `resolver` можем указать другие, например `91.228.153.88 5.187.2.187`. главное, чтобы эти резолверы были доступны публично

### Настройка базовой авторизации

```
sudo htpasswd -c /etc/nginx/.htpasswd <login>
```

- Сохраняем введенный логин и пароль


> [!NOTE] Title
> Если требуется еще один юзер, то необходимо ввести ту же команду, но без `-c`:  
`sudo htpasswd /etc/nginx/.htpasswd <another_user>`


- Добавляем в `/etc/nginx/sites-enabled/<name>`, в котором настроили ранее proxy, следующие строки:

```
auth_basic "Restricted Content";
auth_basic_user_file /etc/nginx/.htpasswd;
```

Итоговый конфиг будет таким:

```
server {

    listen 8888;
    error_log /var/log/nginx/nginx_proxy_debug.log debug;
    
    auth_basic "Restricted Content";
    auth_basic_user_file /etc/nginx/.htpasswd;

    location / {

        resolver 8.8.8.8;

        proxy_pass http://$http_host$uri$is_args$args;

    }

}
```

## Client

- Заводим клиент, тк forward proxy работает на уровне приложения.

```
npm init
npm install request
mkdir test_proxy

echo 'var request = require('request');

request({
    'url':'http://www.google.com/',
    'method': "GET",
    'proxy':'http://192.168.100.40:8888'
},function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
    }
})' >> test_proxy/proxytest.js

node proxytest.js 
```

## Проверка

```
curl -x http://<proxy_server_ip>:8888 -U <login_htpaswd> http://google.com
```

- Я получаю ошибку
- Это связано с тем, что у меня не установлен модуль `ngx_http_proxy_connect_module` (проверить с помощью `nginx -V`)

```
tail -n 50 /var/log/nginx/nginx_proxy_debug.log
```

- Должны увидеть что-то вроде:

```
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 reusable connection: 0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 posix_memalign: 000055F7A60A6CD0:4096 @16
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http process request line
2025/01/16 15:45:33 [info] 1614335#1614335: *1 client sent invalid request while reading client request line, client: 91.228.154.209, server: , request: "CONNECT www.google.com:443 HTTP/1.1"
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http finalize request: 400, "?" a:1, c:1
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 event timer del: 3: 6234368627
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http special response: 400, "?"
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http set discard body
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 xslt filter header
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 HTTP/1.1 400 Bad Request
Server: nginx/1.18.0 (Ubuntu)
Date: Thu, 16 Jan 2025 15:45:33 GMT
Content-Type: text/html
Content-Length: 166
Connection: close

2025/01/16 15:45:33 [debug] 1614335#1614335: *1 write new buf t:1 f:0 000055F7A60A7AA0, pos 000055F7A60A7AA0, size: 161 file: 0, size: 0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http write filter: l:0 f:0 s:161
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http output filter "?"
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http copy filter: "?"
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 image filter
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 xslt filter body
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http postpone filter "?" 000055F7A60A7C90
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 write old buf t:1 f:0 000055F7A60A7AA0, pos 000055F7A60A7AA0, size: 161 file: 0, size: 0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 write new buf t:0 f:0 0000000000000000, pos 000055F7A4971780, size: 104 file: 0, size: 0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 write new buf t:0 f:0 0000000000000000, pos 000055F7A4971C80, size: 62 file: 0, size: 0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http write filter: l:1 f:0 s:327
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http write filter limit 0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 writev: 327 of 327
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http write filter 0000000000000000
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http copy filter: 0 "?"
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http finalize request: 0, "?" a:1, c:1
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 event timer add: 3: 5000:6234313627
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http lingering close handler
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 recv: eof:1, avail:-1
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 recv: fd:3 -1 of 4096
2025/01/16 15:45:33 [info] 1614335#1614335: *1 recv() failed (104: Unknown error) while reading client request line, client: 91.228.154.209, server: , request: "CONNECT www.google.com:443 HTTP/1.1"
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 lingering read: -1
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http request count:1 blk:0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http close request
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 http log handler
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 posix_memalign: 000055F7A60A7CE0:4096 @16
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 geoip2 http log handler
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 free: 000055F7A60A6CD0, unused: 0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 free: 000055F7A60A7CE0, unused: 3928
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 close http connection: 3
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 event timer del: 3: 6234313627
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 reusable connection: 0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 free: 000055F7A60A1AB0
2025/01/16 15:45:33 [debug] 1614335#1614335: *1 free: 000055F7A60EE6C0, unused: 136
```
