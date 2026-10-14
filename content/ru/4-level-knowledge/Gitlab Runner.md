---
translationKey: gitlab-runner
tags:
up:
  - "[[Инструменты и технологии]]"
version: "0.1"
modified: 2026-10-12T19:57:02+03:00
created: 2026-10-08T19:15:38+03:00
---

## Scopes / уровни видимости
## Executors
Где и каким способом выполняется job.
Если проводить аналогию с [[RabbitMQ]], то Gitlab Runner - это [[RabbitMQ Consumer|консьюмер]], который слушает очередь задач, а Executor - это движок, изолированный поток, внутри которого [[RabbitMQ Worker]] выполняет полученную работу

### Среды выполнения
[[Docker]]
	выполняет job в отдельном контейнере и поддерживает image и services
[[Kubernetes]]
	создаёт отдельный pod с build-контейнером и services для каждой job
[[Shell]]
	выполняет команды локально на Runner host без контейнерной изоляции
[[Docker Autoscaler]]
	создаёт instances по нагрузке через Fleeting и запускает jobs в Docker containers
[[Instance executor]]
	создаёт autoscaled instances и выполняет job непосредственно на host instance
[[SSH]]
	выполняет job удалённо через SSH; находится в maintenance mode
[[VirtualBox]]
	клонирует или запускает VM VirtualBox и подключается к ней по SSH; maintenance mode
[[Parallels]]
	использует VM Parallels и SSH; maintenance mode
[[Custom]]
	передаёт подготовку и выполнение внешнему драйверу; maintenance mode
[[Docker Machine]] / docker+machine
	старый autoscaling executor; deprecated
