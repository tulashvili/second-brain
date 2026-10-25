---
draft: false
translationKey: hardening-usilenie-bezopasnosti
modified: 2026-10-12 20:01:11+03:00
created: 2026-10-12 14:32:33+03:00
version: '0.1'
up:
- '[[infrastructure-security]]'
- '[[security-operations-and-tools]]'
title: Security Hardening
---

> [!tldr] In brief
> Hardening reduces the attack surface through system settings and verification of their actual effect.

## What it is

Hardening is a set of methods and procedures for reducing the attack surface of a company's infrastructure. In other words, it means configuring systems to make both initial access and movement after a breach more difficult. Examples include disabling unnecessary services, closing unused ports, restricting administrative access, and retiring outdated protocols.

> [!example]
> If infrastructure is a cake, hackers are children trying to eat it while Grandma isn't looking. :)

## The process

To understand hardening, you first have to understand **the system and the process around it**:

- What is the system for?
- What baseline configuration fits this product and version?

### Example: GitLab Runner

For example, when I hardened GitLab Runners at work, I used the official documentation and the Runner best practices.

You do not need to be a developer or an expert in every product. But you do need to understand a system before you can reduce its attack surface. These are questions I identified after working on [[gitlab-runner|GitLab Runner]] hardening:

**Who can start a job on a given Runner?** A job contains commands from `.gitlab-ci.yml`, so anyone who can trigger a pipeline may effectively run their own code. Check whether the Runner is scoped to a project, group, or whole instance, along with `run untagged` and protected-branch settings.

**What privileges does that job get?** With the `shell` [[gitlab-runner#Executors|executor]], commands run as the Runner user on the host. With a Docker executor, check `privileged`, mounted directories, Docker socket access, and other isolation settings.

**Why were those privileges granted?** Image builds might depend on Docker-in-Docker. Simply turning off `privileged` could break them. The security specialist should work with the CI owner to find a build method with fewer privileges, or move those jobs to a separate isolated Runner.

**How do you prove the result?** Inspect more than the configuration file. A normal build should still pass, an untrusted job should not land on a privileged Runner, and its container should not receive forbidden privileges or mounts.

## Make access harder before an attacker gets inside

1. Use reliable authentication and authorization.
2. Keep software updated and remediate vulnerabilities promptly.
3. Encrypt data.
4. Back up sensitive data regularly.
5. Teach employees to recognize phishing and other malicious messages.

## In summary

Reducing the attack surface requires a suitable configuration, limited privileges, and verification against a working use case.

## Sources

1. [What is security hardening?](https://www.kaspersky.com/blog/security-hardening/54312/)
2. [SP 800-123, Guide to General Server Security](https://csrc.nist.gov/pubs/sp/800/123/final)
3. [CIS Control 4: Secure Configuration of Enterprise Assets and Software](https://www.cisecurity.org/controls/secure-configuration-of-enterprise-assets-and-software)
