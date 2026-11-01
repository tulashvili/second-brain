---
draft: false
version: '0.05'
type: null
state: null
pattern:
- '[[Elastic Stack|Elastic Stack]]'
- '[[Мониторинг]]'
url: null
updated: 2026-04-16 18:48:24+03:00
tags:
- monitoring
up:
- '[[Логирование, мониторинг и обнаружение угроз|Логирование, мониторинг и обнаружение угроз]]'
check_before_public: null
date: 2026-04-16 17:56:33+03:00
translationKey: tsepochka-dostavki-logov-s-ispolzovaniem-elastic-stack
---
[[Elastic Stack|Elastic Stack]] - это набор компонентов для отслеживания, анализа и мониторинга логов.

## Цепочка выглядит так
![[assets/Pasted image 20260416180854.png]]
1) Файл с логами
2) Кладем логи в [[Лог коллектор|Лог коллектор]]
3) Лог отправляет логи в [[Elasticsearch]]
4) Визуализируются логи в [[Kibana]]
