---
modified: 2026-10-25 16:15:09+03:00
created: 2026-10-25 15:09:30+03:00
draft: false
version: '0.01'
title: 'The Three A''s: Authentication, Authorization, and Accounting'
translationKey: tri-a-aaa-authentication-authorization-i-accounting
---
Whether you sign in to a website, access cloud storage, or connect to a corporate network, the three A's work quietly in the background.
## Key ideas
### Authentication
Authentication is the process of verifying a user’s or system’s identity. It confirms that you really are who you claim to be. It answers: *“Who are you?”*

> [!tldr]
> Authentication verifies a user's identity—it **confirms that you really are who you claim to be.**

Three common authentication methods are:

**Password or PIN.** This probably needs no further explanation: we encounter it regularly when using websites and applications.

**ID or security key.** With this method, we present an employee badge or another entry card, for example to enter a room.

**Biometrics.** This includes signing in with a fingerprint, facial recognition, and so on.

These methods can be combined to improve security through multi-factor authentication—[[MFA (Multi-factor Authentication)]].

> [!example]
> For example, when you sign in to a banking app, you most likely use a fingerprint. But before you enabled that feature, you had password-based sign-in configured.
>
> Biometrics are convenient and secure, but a data breach brings a risk to keep in mind: a compromised password or PIN can be reset and changed, while your unique fingerprint pattern stays with you for life.
### Authorization
Authorization follows successful authentication. Authorization is the process of granting a user, program, or group specific rights and permissions to perform actions or access resources in an information system.

> [!tip]
> If authentication answers *“Who are you?”* by checking identity through a password, biometrics, or code, authorization answers *“What are you allowed to do?”*

Authorization is implemented through:
- Security policies
- [[RBAC (Role-Based Access Control)|roles]]
- Permissions

> [!example]
> In an internal company system that employees can access, HR may have access to all employee data, while a particular employee may have access only to their own data.
### Accounting
Accounting is the process of collecting, recording, and analyzing data about user actions and system resources in a computer network. It answers: *“What are you doing?”*

> [!summary] In brief
> Authentication — *“Who are you?”*
> Authorization — *“What are you allowed to do?”*
> Accounting — *“What are you doing?”*

This process matters for meeting regulatory requirements, conducting security investigations, and resolving incidents.

> [!example]
> At my work, we have a [[WAF (Web Application Firewall)]]. As a security engineer, this tool lets me protect critical endpoints—for example, so that an attacker cannot upload a malicious file where a PNG image is required.

## Summary
The importance of the three A's lies in:
- Preventing illegitimate authorization
- Tracking user activity for legitimacy
- Applying [[RBAC (Role-Based Access Control)]]
- Meeting regulatory requirements—[[HIPAA]], [[GPDR]], [[PCI-DSS]]
