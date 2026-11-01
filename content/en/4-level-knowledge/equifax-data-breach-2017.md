---
modified: 2026-10-24 19:17:08+03:00
created: 2026-10-24 16:23:45+03:00
draft: false
version: '0.1'
title: Equifax Data Breach (2017)
translationKey: utechka-dannyh-equifax-2017
---
## Overview
In 2017, [Equifax](https://www.equifax.com/), one of the world's largest credit bureaus, suffered a major data breach that affected more than 143 million people. Sensitive data was exposed, including:
- Names
- Social Security numbers
- Dates of birth.
This incident became a vivid example of how violations of the [[CIA - три фундаментальных принципа безопасности|core security principles]] can lead to large-scale consequences. This note considers it through the CIA triad (confidentiality, integrity, availability) to understand what went wrong and what could have been done differently. ![[assets/Pasted image 20261024162356.png]]

## Key security consequences

**🔐 Breach of confidentiality**
Weak safeguards resulted in the exposure of sensitive personal data. Poor data protection and the lack of effective encryption aggravated the incident.

**⚖️ Integrity concerns**
Although there was no substantial confirmed alteration of data, attacker access created a potential risk to data integrity.

**⚙️ Effect on availability**
After the breach, Equifax experienced outages that affected users' ability to access credit-related services and reduced system availability.
## What went wrong?

**❌ Delayed patching**
A known vulnerability in **Apache Struts** remained unpatched for several months despite an available update.

**❌ Weak monitoring**
The breach went unnoticed for more than two months, indicating weak intrusion-detection and response systems.

**❌ Poor data protection**
Sensitive data was not protected by strong encryption, access controls, and proper system segmentation.
## What could have been done differently?

**🔄 Timely software patching**
Regular, timely software updates could have prevented exploitation of known vulnerabilities.

**🔐 Stronger encryption**
Proper encryption of sensitive data would have significantly reduced the risk of exposure.

**🚨 Better detection systems**
Modern monitoring and intrusion-detection systems could have identified the attack much earlier.

## Questions to consider

- How could stronger encryption have reduced the impact of the data breach?
- Which CIA principle suffered the most, and why?
- How can organizations improve patch management to prevent similar attacks?

## Main takeaway
The Equifax breach shows that security failures often result from **basic operational gaps**, rather than sophisticated hacking techniques. Reliable software patching, monitoring, and encryption are essential to protecting the CIA triad and preventing large-scale data breaches.
