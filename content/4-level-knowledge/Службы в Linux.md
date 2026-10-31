---
version: "1.0"
up:
  - "[[Linux]]"
draft: false
modified: 2026-10-23T11:57:24+03:00
created: 2026-10-14T08:57:51+03:00
---
В заметке [[Процессы в Linux]] я упоминал, что процесс — это запущенный экземпляр программы. Каждый процесс в Linux имеет набор информации о себе: PID, TTY, CMD и так далее. Все это описывает процесс как то, что выполняется прямо сейчас.

## Фундамент
Службы (`service`) в Linux, с точки зрения операционной системы Linux, представляют собой один или несколько процессов, который работают в фоновом режиме и выполняют определенные системные или прикладные задачи.
Например, такими службами могут быть SSH-сервер, который принимает подключения, Nginx, которые принимает HTTP-запросы или Elastic агент, который собирает логи.
Правило для службы называется **unit** и обычно хранится в файле с окончанием **.service**. Пример такого правила для веб-сервера [[Nginx]]:

```sh
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=syslog.target network-online.target remote-fs.target nss-lookup.target
Wants=network-online.target

[Service]
# systemd ожидает, что процесс сделает fork и основной вызов завершится
Type=forking
PIDFile=/run/nginx.pid

# Команды для проверки конфигурации, запуска, перезагрузки и остановки демона
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/usr/sbin/nginx -s reload
ExecStop=/bin/kill -s QUIT $MAINPID

# Поведение при сбое (демон будет автоматически перезапущен)
PrivateTmp=true
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

Важно разделять понятия "службы" и "процесса". Все-таки, служба может состоять из нескольких процессов — как Nginx, например.

Также, у нас есть демоны (`daemon`) - это программа, которая работает в фоне длительное время. Служба описывает способ управления работы такой программы. Некоторые службы запускают демонов, а некоторые выполняют задачу один раз.

Еще у нас есть `systemd` - он читает правила запуска, запускает службы и следит за их состоянием, собирает сведения для диагностики.

Системные сервисы в Linux обеспечивают управление процессами и службами: запускают, останавливают и отслеживают состояние. `systemctl` — команда, через которую мы спрашиваем systemd о состоянии и отдаём ему команды. `journalctl` — команда для чтения системного журнала.

[Документация systemd.service](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html).
## Рассмотрим пример конкретной службы
Возьмем [[PAM]] службу [[Teleport]]   - `teleport.service`
### Запуск
Запуск будет выглядеть так:
```txt
Правило запуска: systemctl start teleport.service
           ↓ читает
       systemd (PID 1)
           ↓ запускает
     процесс Teleport (PID меняется)
           ↓ открывает
     сетевой порт и файлы
           ↓ пишет
     журнал и логи приложения
```

После перезапуска процесса PID (`systemctl restart teleport`) может стать другим, а имя службы `teleport.service` останется тем же. Если процесс аварийно завершается, systemd может его перезапустить, если это предусмотрено настройкой. Это не гарантирует, что сайт отвечает правильно: служба может быть `active`, но выдавать ошибки клиентам.

### Статус работы службы
```sh
systemctl status teleport.service --no-pager

┌──(omar㉿homelab)-[~]
└─$ sudo systemctl status teleport --no-pager
● teleport.service - Teleport Service
     Loaded: loaded (/etc/systemd/system/teleport.service; enabled; preset: disabled)
     Active: active (running) since Wed 2026-10-14 08:41:45 MSK; 1 week 1 day ago
 Invocation: d9817b6b3f134a70ac0d747ffecb6367
   Main PID: 1383944 (teleport)
      Tasks: 12 (limit: 28622)
     Memory: 315.9M (peak: 896.4M)
        CPU: 18min 45.798s
     CGroup: /system.slice/teleport.service
             └─1383944 /usr/local/bin/teleport start --config /etc/teleport.yam…

окт 22 17:36:44 homelab teleport[1383944]: 2026-10-22T17:36:44.396+03:00 …446
окт 22 17:39:22 homelab teleport[1383944]: 2026-10-22T17:39:22.487+03:00 …446
окт 22 17:42:12 homelab teleport[1383944]: 2026-10-22T17:42:12.740+03:00 …446
окт 22 17:45:03 homelab teleport[1383944]: 2026-10-22T17:45:03.143+03:00 …446
окт 22 17:47:41 homelab teleport[1383944]: 2026-10-22T17:47:41.646+03:00 …446
окт 22 17:50:29 homelab teleport[1383944]: 2026-10-22T17:50:29.453+03:00 …446
окт 22 17:53:19 homelab teleport[1383944]: 2026-10-22T17:53:19.234+03:00 …446
окт 22 17:56:18 homelab teleport[1383944]: 2026-10-22T17:56:18.244+03:00 …446
окт 22 17:59:09 homelab teleport[1383944]: 2026-10-22T17:59:09.393+03:00 …446
окт 22 18:02:03 homelab teleport[1383944]: 2026-10-22T18:02:03.132+03:00 …446
Hint: Some lines were ellipsized, use -l to show in full.
```

```sh
┌──(omar㉿homelab)-[~]
└─$ systemctl is-active teleport.service
active
```

**active** означает, что systemd считает службу активной. Это ещё не доказательство, что сайт отвечает правильно: Nginx может работать, а приложение за ним — нет. Необходимо также проверить функционирование с точки зрения клиента, например локальным HTTP-запросом и затем запросом с нужной стороны сети. Разница между состоянием unit и работой приложения описана в [systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html).

```sh
systemctl is-enabled teleport.service
```
**is-enabled** — это об автозапуске службы. Служба может запускаться и другим механизмом, поэтому для окончательного вывода проверяй конкретную систему и результат после перезагрузки.

**В случае ошибок** можно посмотреть журнал службы с помощью:
```sh
journalctl -u teleport.service -b -n 50 --no-pager
```
**Журнал** — записи о событиях и ошибках. Здесь **-u** выбирает службу, **-b** — текущую загрузку, **-n 50** — последние 50 записей. Иногда приложение пишет ошибки ещё и в собственный файл. [Документация journalctl](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html).


### Что именно запускается и от чьего имени
```sh
systemctl cat teleport.service

┌──(omar㉿homelab)-[~]
└─$ sudo systemctl cat teleport.service --no-pager
# /etc/systemd/system/teleport.service
[Unit]
Description=Teleport Service
After=network.target

[Service]
Type=simple
Restart=always
RestartSec=5
EnvironmentFile=-/etc/default/teleport
ExecStart=/usr/local/bin/teleport start --config /etc/teleport.yaml --pid-file=/run/teleport.pid
# systemd before 239 needs an absolute path
ExecReload=/bin/sh -c "exec pkill -HUP -L -F /run/teleport.pid"
PIDFile=/run/teleport.pid
LimitNOFILE=524288

[Install]
WantedBy=multi-user.target
```

```sh
systemctl show -p MainPID -p User -p Group teleport.service

MainPID=1383944
User=
Group=

```

```sh
┌──(omar㉿homelab)-[~]
└─$ ps -eo pid,ppid,user,group,stat,args | grep 'teleport'
1383944       1 root     root     Ssl  /usr/local/bin/teleport start --config /etc/teleport.yaml --pid-file=/run/teleport.pid
1934547 1925675 omar     omar     S+   grep --color=auto teleport
```

В выводе `systemctl cat` `ExecStart` (команда запуска) показывает путь к бинарнику и аргументы для запуска сдужбы, `User` и `Group` (пользователь и группа) показывают, от каких пользователей и групп работает тот или иной процесс.
Если уязвимость позволит выполнить код внутри приложения, права процесса определят, к каким файлам и действиям злоумышленник может получить доступ

> `MainPID` можно было не использовать в данном случае, так как у `teleport` только один запущенный процесс. Если бы это был [[Nginx]], то данная команда была бы нам полезна.
### Где служба доступна по сети
Любая служба, которая принимает соединения из интернета - будь то [[LAN (Local Area Network)|локального]] или глобального — использует сокеты для прослушивания таких запросов извне. Не любая служба принимает соединения извне — служба может вообще не принимать соединения — например, запуститься по расписанию, обработать файл и завершиться.
Таким образом, если служба принимает сетевые подключения, то у нее для этого используется [[TCP-сокет|сокет]]. У [[TCP-сокета]] есть IP-адрес и порт; у локального [[Unix-сокет|Unix-сокета]] вместо IP-адреса и порта может быть путь обычный путь к файлу - пример покажу ниже.

Для проверки сетевой доступности службы есть несколько основных команд:

`lsof` (List Open Files) — утилита общего назначения. Так как в Linux «всё есть файл», она отлично связывает сетевые сокеты с конкретными PID, именами процессов и даже путями к Unix-сокетам
> [!tip]+ Шпаргалка
> `sudo lsof -i -P -n` (выведет только сетевую активность)

`ss` (Socket Statistics) — запрашивает данные напрямую из ядра Linux (через netlink), поэтому работает мгновенно даже на высоконагруженных серверах.
> [!tip]+ Шпаргалка
> `sudo ss -tulnp` (покажет все слушающие TCP/UDP порты и PID процессов).

Также есть классический, но устаревший инструмент `netstat` (Network Statistics) из пакета `net-tools`. Во многих современных дистрибутивах он уже не установлен по умолчанию, так как уступает `ss` в скорости на больших объемах данных.

Получим PID нашего процесса:
```sh
┌──(omar㉿homelab)-[~]
└─$ systemctl show -p MainPID -p User -p Group teleport.service
MainPID=1383944
User=
Group=
```

Затем проверим, по полученному PID, путь к сокету и какие порты заняты службой:
```sh
┌──(omar㉿homelab)-[~]
└─$ sudo lsof -p 1383944 | grep STREAM

teleport 1383944 root   1u     unix 0x0000000022da4f37       0t0 249089960 type=STREAM (CONNECTED)
teleport 1383944 root   2u     unix 0x0000000022da4f37       0t0 249089960 type=STREAM (CONNECTED)
teleport 1383944 root   8u     unix 0x0000000098b4840a       0t0 249088711 /var/lib/teleport/debug.sock type=STREAM (LISTEN)

┌──(omar㉿homelab)-[~]
└─$ sudo lsof -nP -a -p 1383944 -i
COMMAND      PID USER FD   TYPE    DEVICE SIZE/OFF NODE NAME
teleport 1383944 root 7u  IPv4 275795604      0t0  TCP 192.168.1.122:47616->192.168.1.34:3080 (ESTABLISHED)
teleport 1383944 root 9u  IPv4 275802777      0t0  TCP 192.168.1.122:59592->192.168.1.34:3080 (ESTABLISHED)
```

Выше мы видим, что `teleport.service` использует сокет — `/var/lib/teleport/debug.sock`.
Также служба имеет порт - 3080 и локальный ip-адрес моей машины — 192.168.1.122 В выводе найди процесс и его

> [!tip] Шпаргалка
> Могло быть также указано **0.0.0.0:3080** — прослушивание на всех IPv4-интерфейсах машины. Это еще не доказывает доступность из Интернета: на пути ещё могут быть [[firewall]], [[маршруты]], [[NAT]] и [[Proxy|прокси]]
