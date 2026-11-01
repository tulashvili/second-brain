---
draft: false
version: '0.1'
modified: 2026-11-01 14:07:15+03:00
created: 2026-10-24 19:50:47+03:00
up:
- '[[Криптография]]'
title: Public Key Infrastructure (PKI)
translationKey: pki-public-key-infrastructure
---

![[assets/Pasted image 20261030185948.png]]
PKI is the rules, participants, and technical means that make it possible to check: _whose [[digital-signature|public key]] did I receive, and what may I trust it for?_ In the familiar HTTPS case, this means certificates, certification authorities (CAs), trusted root certificates, and procedures for issuance, verification, and revocation.

For an information-security engineer, the central question is: **should the client trust the certificate for the `api.example.com` service?** The fact that the server presented a certificate is not enough.

**How this works in a concrete example:**
1. The owner of `api.example.com` creates a key pair. The **private key** stays with the service; the **public key** is placed in the certificate request.
2. A CA verifies that the applicant controls the domain and signs a certificate binding the name `api.example.com` to the public key. Domain validation alone does not prove that the website is honest or secure.
3. When connecting, the server presents its certificate and usually intermediate certificates. The client builds a chain to a **root CA it already trusts**, checks the signatures, validity period, permitted certificate purpose, and name match. The service name is checked using `subjectAltName`, rather than the `Common Name` field.
4. The server proves possession of the corresponding private key. In TLS 1.3, the certificate participates in authentication, while data exchange is protected by **[[Сеансовый ключ|session keys]]** agreed during the connection. Thus, “the certificate encrypts traffic” is a useful everyday shorthand, but technically imprecise.

This is how it looks schematically:
![[assets/Pasted image 20261030185813.png]]
```
Trusted root CA
        ↓ signed
Intermediate CA
        ↓ signed
Certificate for api.example.com → service public key
```

## Key PKI components
![[assets/Pasted image 20261030185701.png]]

- Public and private keys
- Digital certificates
- CA
- RA
- CRL

### Public and private keys
![[assets/Pasted image 20261030185909.png]]

## Key escrow
![[assets/Pasted image 20261030190131.png]]
