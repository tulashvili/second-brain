---
draft: false
translationKey: multikonteynernoe-prilozhenie-v-docker-docker-network
title: A Multi-Container Docker Application
tags:
- docker
up:
- '[[infrastructure-and-platforms]]'
- '[[labs-and-practical-guides]]'
dg-publish: false
dg-note-icon: null
date: 2025-10-26T11:18
updated: 2026-04-18 17:46:36+03:00
---

Each container should do one job and do it well. The frontend or backend will probably need to scale differently from the database, and separate containers can be versioned and updated independently.

Containers communicate over a Docker network; you do not need to be a network engineer to connect them.

1. Create a network:

```sh
docker network create todo-app
```

2. Start the database container:

```sh
docker run -d \
  --name mysql \
  --network todo-app \
  --network-alias mysql \
  -v todo-mysql-data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=todos \
  mysql:8.0
```

`--network-alias mysql` gives the database a DNS name on this network. The application connects to MySQL by the name `mysql`, rather than an IP address, because both containers share the network.

3. Start the application container and connect it to the database:

```sh
docker run -dp 3000:3000 \
  -w /app -v "$(pwd):/app" \
  --network todo-app \
  -e MYSQL_HOST=mysql \
  -e MYSQL_USER=root \
  -e MYSQL_PASSWORD=secret \
  -e MYSQL_DB=todos \
  node:18-alpine \
  sh -c "yarn install && yarn run dev"
```

4. Inspect the network to confirm the containers are attached:

```sh
docker network inspect todo-app
......
        "Containers": {
            "31efd616d0eb666f4b36244f688e448e12a0f8bc175207e9898f79b493cb46b1": {
                "Name": "magical_ride",
                "EndpointID": "2c1231a2adc386eda41995aae7e73b1e267aeb9c2b16b8e21823266315884f5d",
                "MacAddress": "12:8a:86:d6:9f:0c",
                "IPv4Address": "172.18.0.3/16",
                "IPv6Address": ""
            },
            "c337bd83df1434e9e7c5aae02319cc88abefd5d92c37c4f34f2a90150cc43528": {
                "Name": "amazing_williams",
                "EndpointID": "12da0f3a7b1978ea2b0a2153096dd27de4d69e6e0df56171c8f36ef96c0dd1cc",
                "MacAddress": "1a:bf:07:97:3e:2f",
                "IPv4Address": "172.18.0.2/16",
                "IPv6Address": ""
            }
        },
.......
```
