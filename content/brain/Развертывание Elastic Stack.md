---
slug: brain/razvertyvanie-elastic-stack
type:
state:
area:
pattern:
url:
updated: 2026-04-20T20:03:07+03:00
tags:
  - public
check_before_public: false
date: 2026-04-16T18:45:06+03:00
---
Я не буду описывать здесь полный путь, что я проделал за прошедшие два дня - уж больно он был тернист.

Но я хочу зафиксировать все, что мне удалось, с чем столкнулся и на что обратить внимание в будущем, если потребуется вновь разворачивать [[Elastic Stack]]. Пишу по памяти, постараюсь ничего не упустить 🫠

Прежде всего отмечу, что я использовал [[Docker Compose]] для развертывания компонентов [[Elastic Stack]]. 

*Мне, кстати, весьма [[Моральный оргазм от сборки приложений в контейнеры|понравилось]] использовать Docker - раньше я этому не придавал такое значение* 🤔

## Проблема 1. elastic user is forbidden
### **Что сделал?**
Поднял [[Elasticsearch]] + [[Kibana]] через docker-compose

### **Что произошло?**
[[Kibana]] упала с ошибкой:
```sh
elastic user is forbidden
```

### **Почему это произошло?**
В `docker-compose.yml` я использовал `ELASTICSEARCH_USERNAME=elastic`, а в новых версиях пользователя `elastic` [нельзя использовать](https://discuss.elastic.co/t/kibana-error-fatal-error-config-validation-of-elasticsearch-username-value-of-elastic-is-forbidden/297956) для Kibana, требуется создать отдельный service account

### **Что помогло?**
```yaml
services:
  elasticsearch:
    ........
  kibana:
    ........
    environment:
      - .........
      - ELASTICSEARCH_USERNAME=kibana_system
```
## Проблема 2. В kibana отсутсвовали логи
### **Что сделал?**
После поднятия Elastic Stack (Elasticsearch, Kibana, Fleet Server) открыл интерфейс Kibana для проверки логов - Discover.

Предварительно:
- развернул Fleet Server  
- создал agent policy  
- установил Elastic Agent на удалённые хосты  
- добавил integrations (System, Nginx, Auditd)  
### **Что произошло?**
- logs-* — пусто
- metrics-* — есть
Данные собираются, но не доставляются в Elasticsearch по какой-то причине.
### **Что проверил?**
#### 1. Базовые проверки
- integrations в Kibana  
- `elastic-agent status` → `HEALTHY`  
- наличие процессов filebeat для понимания, запустился ли он:
```bash
ps aux | grep filebeat
lsof -p <filebeat_pid>
```

- Также попробовал отрестартить агента:
`systemctl restart elastic-agent` - после этого filebeat начал читать файл,
но логи всё равно не появляются в Kibana
#### **2. Проверка агента**
```
elastic-agent inspect components --show-config
```
обнаружил:
```
hosts: http://localhost:9200
```
И это было корнем причины
### **Почему это произошло?**
Это произошло, потому что при поднятии докер контейнера для эластика я закрыл выход наружу для 9200 - думал о безопасности. Как оказалось, это стало проблемой в будущем.
Elastic Agent был настроен отправлять данные в:
```
http://localhost:9200
```

вместо реального Elasticsearch-хоста:
```
http://<elastic_ip>:9200
```

в результате:
- агент отправлял данные “в себя”
- Elasticsearch был недоступен
- данные терялись
### **Что помогло?**
Добавил проброс порта Elasticsearch в docker-compose.yml:
```
ports:
  - "9200:9200"
```

Исправление output в Fleet:
`Kibana → Fleet → Settings → Outputs`
```
http://<elastic_ip>:9200
```
