---
slug: brain/gayd-po-ispolzovaniyu-mysqldump
title: Гайд по использованию mysqldump
tags:
  - mysql
  - backup
  - clippings
  - public
dg-publish: false
date: 2025-03-13T13:44
updated: 2026-04-04T23:16:23+03:00
---
Хорошая статья написана на тему использования [[mysqldump]] [тут](https://simplebackups.com/blog/the-complete-mysqldump-guide-with-examples/#backup-specific-mysql-databases-via-mysqldump). Ниже представлена выжимка из нее с моими комментариями и дополнениями:
## Бэкап
### Бэкап одной или нескольких таблиц
```shell
mysqldump -u username -p db_cooper mystery cash > file_name.sql
```
- `mystery`и `cash` - таблицы 
- `db_cooper` - база данных

Для бэкапа одной таблицы будет использоваться идентичный синтаксис:
```shell
mysqldump -u username -p db_cooper mystery > file_name.sql
```
### Бэкап определенных или всех баз данных
```shell
mysqldump -u username -p --databases db_larry db_curly db_moe > file_name.sql
```

Для бэкапа одной базы будет использоваться идентичный синтаксис:
```shell
mysqldump -u username -p --databases db_larry > file_name.sql
```

Для бэкапа всех баз данных будет использоваться:
```shell
mysqldump -u username -p --all-databases > all_databases.sql
```

### Бэкап базы данных, но и исключением определенных таблиц:
```shell
mysqldump -u username -p database_name --ignore-table=database_name.table1 --ignore-table=database_name.table2 > database_backup.sql
```
- `database_name` - имя базы
- `table1`,`table2` - таблицы, которые будем игнорировать из данной базы
### Бэкап структуры базы данных
При этом варианте будет совершен бэкап базы данных со всей структурой: названия таблиц, индексы и так далее, но самих данных не будет:
```shell
mysqldump --no-data -u username -p database_name > database_structure.sql
```
- `database_name` - имя базы
## Восстановление данных из созданного дампа
В любом случае необходимо, для начала, переместить созданный дамп на целевой сервер:
```shell
scp otulashvili@h1-project2-con:/home/otulashvili/dump_project2_local.sql.gz otulashvili@dev-project2-con:/home/otulashvili/
```

Затем я распакую архив на целевом сервере:
```shell
gzip -d -k dump_project2_local.sql.gz
```

Так как в моем дампе отсутствует процесс создания баз, я сначала создам их вручную:
```shell
otulashvili@dev-project2-con [project2] :~ $ sudo mysql --defaults-file=/etc/mysql/my.cnf -e "create database project2"
otulashvili@dev-project2-con [project2] :~ $ sudo mysql --defaults-file=/etc/mysql/my.cnf -e "create database Ip2location"
```

А затем запущу импорт дампа:
```shell
sudo mysql --defaults-file=/etc/mysql/my.cnf project2 < dump_project2_local.sql
```
- `project2` - это название базы данных, в которую я буду импортировать дамп

Для проверки, что дамп точно был совершен корректно проверим наличие импортированных баз и таблиц в них:
```mysql
show databases;
SHOW TABLES FROM project2;
```

На этом, пока, я закончу. Буду дополнять по мере изучения новой информации