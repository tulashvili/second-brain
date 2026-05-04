---
type:
state:
Область:
  - "[[Инфраструктура]]"
Родитель:
  - "[[S3 хранилище данных]]"
url:
updated: 2026-04-09T12:47:08+03:00
tags:
  - public
date: 2026-04-08T14:58:58+03:00
check_before_public: false
---
Я уже писал о том, как настроить [[Awscli]] - клиент для взаимодействия с [[S3 хранилище данных|S3 хранилищем]].

Для взаимодействия с [[Minio]] я буду использовать Minio Client. Вот, как его настроить и передать тестовый файл.
```shell
curl -O https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
mv mc /usr/local/bin/mc-minio
```
Мы перемещаем с новым именем с той целью, чтобы избежать конфликта с [[Midnight Comander (mc)]]

Устанавливаем alias:
```shell
mc-minio alias set prod-minio \
> https://prod-minio.com
mc-minio: Configuration written to `/home/otulashvili/.mc-minio/config.json`. Please update your access credentials.
mc-minio: Successfully created `/home/otulashvili/.mc-minio/share`.
mc-minio: Initialized share uploads `/home/otulashvili/.mc-minio/share/uploads.json` file.
mc-minio: Initialized share downloads `/home/otulashvili/.mc-minio/share/downloads.json` file.
Enter Access Key: o.tulashvili
Enter Secret Key:
```

При возникновении ошибки в `/home/otulashvili/.mc-minio/config.json` создано ничего не будет, поэтому можно заново попробовать добавить и исправить сразу ошибку:
```sh
otulashvili@dev-lgaming [lgaming] :~ $ mc-minio alias set prod-minio \
>   https://prod-minio.com \
>   o.tulashvili
Enter Secret Key:
Added `prod-minio` successfully.
```

Проверяем:
```shell
mc-minio ls prod-minio
[2026-04-08 14:37:04 MSK]     0B infosec/
```

Пробуем загрузить файл:
```shell
echo "test" > test.txt
mc-minio cp test.txt prod-minio/infosec/
/home/otulashvili/test.txt:  5 B / 5 B ┃▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓┃ 171 B/s 0

mc-minio ls prod-minio/infosec/
[2026-04-08 15:19:22 MSK]     5B STANDARD test.txt
```









