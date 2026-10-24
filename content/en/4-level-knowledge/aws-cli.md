---
draft: false
translationKey: awscli
title: AWS CLI
tags: null
up:
- '[[data-storage]]'
- '[[labs-and-practical-guides]]'
dg-publish: false
dg-note-icon: null
date: 2025-05-01T13:08
updated: 2026-04-08 14:56:14+03:00
pattern:
- 'S3 storage'
---

Suppose we have a server that stores many static files: `.png`, `.jpeg`, `.css`, and so on. We need to make those files available from several geographically dispersed locations.

We can use S3 storage for this. To interact with it, we can use the plain `awscli` client, an S3-compatible server such as MinIO, or [[minio-client|MinIO Client]]. In the last case, we can store data directly on that server.

Before connecting, obtain:

- `access_key` (similar to a username)
- `secret_key` (similar to a password)
- `endpoint_url` (for an S3-compatible service such as MinIO or Ceph, rather than AWS S3)

Install `awscli`:

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
aws --version  # Verify the installation
```

Configure the remote storage:

```sh
aws configure
```

Remember to set `--endpoint-url` when the service is not AWS S3. For example:

```sh
root@hhblipions:~# cat .aws/config
[default]
endpoint_url = https://s3.<host>/
```

Check the current configuration:

```sh
aws configure list
```

List files in a remote bucket:

```sh
aws s3 ls s3://<bucket_name>/
```

List the available buckets:

```sh
aws s3 ls
```

Upload files to S3:

```sh
aws s3 sync Downloads/ s3://<bucket_name>/
```
