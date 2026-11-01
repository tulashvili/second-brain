---
draft: false
modified: 2026-10-29 20:47:10+03:00
created: 2026-10-29 20:46:52+03:00
title: DDoS Attack
translationKey: ddos-ataka
---
- DDoS mitigation methodology
	- IP address
		- How many IP addresses are there?
			- **If there are many, blocking still makes sense**
				- because attackers will eventually run out of resources; in this respect, the company is in a stronger position
	- User-Agent
	- URI
	- Check the client geography, if available
		- If the geography is the same but IP addresses differ:
			- check whether it is a bridge; for example, examine `x-device-id x-client-device-id` in the request analysis dashboard
			- then notify incident response; this dashboard is also useful: the request monitoring dashboard
			- the blocking-rule lists in the WAF dashboard
		-
		-
