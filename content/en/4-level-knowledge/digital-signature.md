---
modified: 2026-10-25 12:46:20+03:00
created: 2026-10-24 19:48:35+03:00
draft: false
version: '0.1'
title: Digital Signature
translationKey: tsifrovaya-podpis
---
A digital signature is a cryptographic key pair created using [[Ассиметичное шифрование|asymmetric encryption]] (public-key cryptography). It guarantees that a file was created by a particular publisher and has not been modified since it was signed.

A digital signature uses a related key pair:

- The **private key** is kept by the signer, who uses it to create the file signature. Access to the key must be protected: anyone who obtains it can create signatures on the owner's behalf.
- The **public key** is provided to verifiers. They use it to check whether the signature matches the received file and the corresponding private key.

Before trusting the result, make sure that the public key really belongs to the expected signer.

> [!info]
> A public key is derived from a private key, but with a properly chosen algorithm and parameters, deriving the private key from the public one is practically impossible.

**What this looks like in practice.** Consider an update to the `tar` archiving utility:

1. The development team creates a signature for the file with the **private key**. This key must remain secret.
2. The signature is published alongside the file. The verifier obtains the **public key** from a trusted source.
3. A program checks the combination of “file bytes + signature + public key.” If even one byte in the file changes, signature verification fails.
