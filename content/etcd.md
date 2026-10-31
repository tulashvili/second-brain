---
draft: true
version: "0.01"
up:
modified: 2026-10-27T18:13:28+03:00
created: 2026-10-27T18:04:28+03:00
---
Это [[распределенное хранилище типа ключ-значение]] с высокой степенью согласованности, написанное на языке [[Golang]] и использующее протокол консенсуса [Raft](https://www.dmosk.ru/terminus.php?object=etcd)

Patroni на трёх узлах ↔ etcd: общая конфигурация, состояние, лидерский ключ
HAProxy → [[Patroni]] REST: какой узел сейчас primary?
Authentik → HAProxy → выбранный PostgreSQL
## Аналоги (????)
- Consul
- Apache ZooKeeper
- Redis (в кластерном режиме)
