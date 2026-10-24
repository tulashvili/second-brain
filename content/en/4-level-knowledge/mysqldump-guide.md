---
draft: false
translationKey: gayd-po-ispolzovaniyu-mysqldump
title: A Guide to mysqldump
tags:
- mysql
- backup
- clippings
up:
- '[[data-storage]]'
- '[[labs-and-practical-guides]]'
dg-publish: false
date: 2025-03-13T13:44
updated: 2026-04-04 23:16:23+03:00
modified: 2026-10-12 20:04:28+03:00
created: 2026-10-08 19:15:38+03:00
---

There is a useful [mysqldump guide](https://simplebackups.com/blog/the-complete-mysqldump-guide-with-examples/#backup-specific-mysql-databases-via-mysqldump). Here is my condensed version, with comments and additions.

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
scp user@source-host:/home/user/dump.sql.gz user@target-host:/home/user/
```

Decompress the archive on the target server:

```shell
gzip -d -k dump.sql.gz
```

Because my dump did not create the databases, I created them manually before importing:

```shell
sudo mysql --defaults-file=/etc/mysql/my.cnf -e "create database project2"
sudo mysql --defaults-file=/etc/mysql/my.cnf -e "create database Ip2location"
```

Then I imported the dump:

```shell
sudo mysql --defaults-file=/etc/mysql/my.cnf project2 < dump.sql
```

`project2` is the target database. To check that the import worked, inspect the databases and tables:

```sql
SHOW DATABASES;
SHOW TABLES FROM project2;
```

That is where I will stop for now; I will add more as I learn.
