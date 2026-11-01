---
draft: false
translationKey: gayd-po-ispolzovaniyu-mysqldump
title: A Guide to mysqldump
tags:
- mysql
- backup
- clippings
up:
- '[[data-storage|Data storage]]'
- '[[labs-and-practical-guides|Labs and practical guides]]'
dg-publish: false
date: 2025-03-13T13:44
updated: 2026-04-04 23:16:23+03:00
modified: 2026-10-12 20:04:28+03:00
created: 2026-10-08 19:15:38+03:00
version: '0.05'
---

There is a good article about using [[mysqldump]] [here](https://simplebackups.com/blog/the-complete-mysqldump-guide-with-examples/#backup-specific-mysql-databases-via-mysqldump). Below is a condensed version with my comments and additions.

## Backups

### One or more tables

```shell
mysqldump -u username -p db_cooper mystery cash > file_name.sql
```

`mystery` and `cash` are tables; `db_cooper` is the database. For one table, use the same syntax with just one table name:

```shell
mysqldump -u username -p db_cooper mystery > file_name.sql
```

### Selected or all databases

```shell
mysqldump -u username -p --databases db_larry db_curly db_moe > file_name.sql
```

For one database:

```shell
mysqldump -u username -p --databases db_larry > file_name.sql
```

For all databases:

```shell
mysqldump -u username -p --all-databases > all_databases.sql
```

### A database with selected tables excluded

```shell
mysqldump -u username -p database_name --ignore-table=database_name.table1 --ignore-table=database_name.table2 > database_backup.sql
```

Here `database_name` is the database, and `table1` and `table2` are the tables to skip.

### Schema without rows

This exports table names, indexes, and the rest of the database structure, but no table data:

```shell
mysqldump --no-data -u username -p database_name > database_structure.sql
```

## Restoring from a dump

First transfer the dump to the target server:

```shell
scp otulashvili@h1-project2-con:/home/otulashvili/dump_project2_local.sql.gz otulashvili@dev-project2-con:/home/otulashvili/
```

Decompress the archive on the target server:

```shell
gzip -d -k dump_project2_local.sql.gz
```

Because my dump did not create the databases, I created them manually before importing:

```shell
otulashvili@dev-project2-con [project2] :~ $ sudo mysql --defaults-file=/etc/mysql/my.cnf -e "create database project2"
otulashvili@dev-project2-con [project2] :~ $ sudo mysql --defaults-file=/etc/mysql/my.cnf -e "create database Ip2location"
```

Then I imported the dump:

```shell
sudo mysql --defaults-file=/etc/mysql/my.cnf project2 < dump_project2_local.sql
```

`project2` is the target database. To check that the import worked, inspect the databases and tables:

```sql
show databases;
SHOW TABLES FROM project2;
```

That is where I will stop for now; I will add more as I learn.
