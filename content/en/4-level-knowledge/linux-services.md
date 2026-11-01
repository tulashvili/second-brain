---
version: '1.0'
up:
- '[[linux|Linux]]'
draft: false
modified: 2026-10-23 11:57:24+03:00
created: 2026-10-14 08:57:51+03:00
title: Linux Services
translationKey: sluzhby-v-linux
---
In [[linux-processes|Processes in Linux]], I mentioned that a process is a running instance of a program. Every Linux process has information about itself: PID, TTY, CMD, and so on. All of this describes a process as something executing right now.

## Fundamentals

From the Linux operating system's perspective, services are one or more processes that run in the background and perform particular system or application tasks. Examples include an SSH server accepting connections, Nginx accepting HTTP requests, or an Elastic Agent collecting logs.

A service rule is called a **unit** and is usually stored in a file ending in **.service**. Here is an example for the [[nginx|Nginx]] web server:

```sh
[Unit]
Description=The NGINX HTTP and reverse proxy server
After=syslog.target network-online.target remote-fs.target nss-lookup.target
Wants=network-online.target

[Service]
# systemd expects the process to fork and the main call to finish
Type=forking
PIDFile=/run/nginx.pid

# Commands to test the configuration, start, reload, and stop the daemon
ExecStartPre=/usr/sbin/nginx -t
ExecStart=/usr/sbin/nginx
ExecReload=/usr/sbin/nginx -s reload
ExecStop=/bin/kill -s QUIT $MAINPID

# Failure behavior (the daemon will be restarted automatically)
PrivateTmp=true
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

It is important to distinguish a service from a process. A service can consist of several processes, as Nginx does.

There are also daemons: programs that run in the background for a long time. A service describes how such a program is managed. Some services start daemons; others perform a task once.

`systemd` reads startup rules, starts services, monitors their state, and collects diagnostic information.

Linux system services manage processes and services: they start, stop, and track their state. `systemctl` is the command used to ask systemd for its state and send it commands. `journalctl` reads the system journal.

[systemd.service documentation](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html).

## A specific service example

Consider the [[pam|PAM]] service [[teleport|Teleport]]: `teleport.service`.

### Starting it

Starting it looks like this:

```txt
Startup rule: systemctl start teleport.service
           ↓ read by
       systemd (PID 1)
           ↓ starts
     Teleport process (PID changes)
           ↓ opens
     network port and files
           ↓ writes
     journal and application logs
```

After a process restart, the PID (`systemctl restart teleport`) may change while the service name, `teleport.service`, remains the same. If the process crashes, systemd can restart it if its configuration provides for that. This does not guarantee that the site responds correctly: a service can be `active` while returning errors to clients.

### Service status

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

**active** means that systemd considers the service active. It is still not proof that the site responds correctly: Nginx may be working while the application behind it is not. You must also test from the client's perspective, for example with a local HTTP request and then a request from the necessary side of the network. The difference between a unit's state and application behavior is described in [systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html).

```sh
systemctl is-enabled teleport.service
```

**is-enabled** concerns whether the service starts automatically. A service can start through another mechanism, so draw a final conclusion only after checking the specific system and its result after a reboot.

**If errors occur**, inspect the service journal with:

```sh
journalctl -u teleport.service -b -n 50 --no-pager
```

The **journal** contains event and error records. Here **-u** selects the service, **-b** the current boot, and **-n 50** the last 50 entries. An application can also write errors to its own file. [journalctl documentation](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html).

### What starts, and under which account

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

In `systemctl cat` output, `ExecStart` (the startup command) shows the binary path and arguments used to start the service. `User` and `Group` show the user and group under which a process runs. If a vulnerability permits code execution in the application, the process permissions determine which files and actions an attacker can access.

> `MainPID` was not needed here because `teleport` has only one running process. It would be useful for [[nginx|Nginx]].

### Where the service is reachable on the network

Any service that accepts connections from a network—[[local-area-network|local]] or global—uses sockets to listen for external requests. Not every service accepts external connections: a service may not accept connections at all, for example when it starts on a schedule, processes a file, and exits.

If a service accepts network connections, it uses a [[tcp-socket|socket]] for them. A [[tcp-socket|TCP socket]] has an IP address and port; a local [[unix-socket|Unix socket]] can instead have an ordinary file path, as in the example below.

There are several main commands for checking a service's network reachability:

`lsof` (List Open Files) is a general-purpose utility. Because in Linux “everything is a file,” it connects network sockets to specific PIDs, process names, and even Unix-socket paths.

> [!tip]+ Cheat sheet
> `sudo lsof -i -P -n` shows only network activity.

`ss` (Socket Statistics) asks the Linux kernel for data directly through netlink, so it works immediately even on heavily loaded servers.

> [!tip]+ Cheat sheet
> `sudo ss -tulnp` shows all listening TCP/UDP ports and process PIDs.

There is also the classic but obsolete `netstat` (Network Statistics) tool from the `net-tools` package. It is not installed by default on many modern distributions because `ss` performs better with large amounts of data.

Get the PID of the process:

```sh
┌──(omar㉿homelab)-[~]
└─$ systemctl show -p MainPID -p User -p Group teleport.service
MainPID=1383944
User=
Group=
```

Then, using that PID, check the socket path and the ports held by the service:

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

Above, `teleport.service` uses the socket `/var/lib/teleport/debug.sock`. The service also has port 3080 and the local IP address of my machine, 192.168.1.122. In the output, find the process and its…

> [!tip] Cheat sheet
> The output could instead show **0.0.0.0:3080**, meaning it listens on every IPv4 interface of the machine. This still does not prove that it is reachable from the Internet: the path can include [[firewall]], [[routes]], [[nat|NAT]], and a [[proxy|proxy]].
