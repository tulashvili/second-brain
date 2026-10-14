---
translationKey: minio-client
type: null
state: null
pattern:
- 'S3 storage'
url: null
updated: 2026-04-09 12:47:08+03:00
tags: null
up:
- '[[data-storage]]'
- '[[labs-and-practical-guides]]'
date: 2026-04-08 14:58:58+03:00
check_before_public: false
title: MinIO Client
---

I have already written about configuring [[aws-cli|AWS CLI]] to work with S3 storage. Here I will use MinIO Client to connect to MinIO and upload a test file.

```shell
curl -O https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc
mv mc /usr/local/bin/mc-minio
```

I give the executable a new name to avoid a conflict with Midnight Commander (`mc`).

Set an alias for the server:

```shell
mc-minio alias set prod-minio https://prod-minio.com
# Enter the access key and secret key when prompted.
```

If creating the alias fails, the configuration is not written to `/home/<user>/.mc-minio/config.json`. Correct the input and try again:

```sh
mc-minio alias set prod-minio https://prod-minio.com <access-key>
# Enter Secret Key: [input is hidden]
# Added `prod-minio` successfully.
```

Check the alias:

```shell
mc-minio ls prod-minio
# infosec/
```

Upload a file and verify it is there:

```shell
echo "test" > test.txt
mc-minio cp test.txt prod-minio/infosec/
mc-minio ls prod-minio/infosec/
# test.txt
```
