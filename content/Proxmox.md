---
type:
state:
Область:
Родитель:
url:
updated: 2026-04-20T20:04:26+03:00
tags:
  - public
check_before_public: false
date: 2026-04-15T13:16:55+03:00
---
Я никогда не работал с proxmox за, почти, три года работы системным администратором. Решил наверстать упущенное и на [[Мой первый homelab для экспериментов|купленный]]  компьютер под homelab установил именно proxmox

Proxmox - это "менеджер виртуальных серверов". Он позволяет создавать и управлять виртуальными машинами с разными ОС на одном железе.
Вот так выглядит схема его работы:
```
[ железо ]
     ↓
[ Proxmox ]
     ↓
[ VM: Ubuntu ]
[ VM: Windows ]
[ VM: Firewall ]
```

А вот так выглядит схема, когда мы ставим обычную ОС вроде Ubuntu:
```
[ железо ]
     ↓
[ Ubuntu ]
     ↓
[ nginx / docker / app ]
```

## Вот, как я первый раз устанавливал
1) Записал на флешку с помощью [[balenaEtcher]] proxmox.iso, скачанный с [оффициального сайта](https://www.proxmox.com/en/downloads)
2) Предварительно требуется в настройках BIOS включить переключатель `Intel Virtualization Technology`:
   ![[Pasted image 20260415133210.png|584]]
   
   Если этого не сделать, то в процессе установке получите ошибку, которую получил я:
   ![[Pasted image 20260415132924.png|589]]
3) При установке выбрал *Install Proxmox VE (Graphical)*
   ![[11fde1d8ecf9fbb125152fd9c7808e8a82cc93ef399634fb4571601f39884666.jpeg|589]]
4) Далее я следовал инструкциям, предложенными при установке
   ![[Pasted image 20260415133540.png|585]]
## Что сделал первым при установке Proxmox
1) Я сохранил адрес и пароль для веб-интерфейса (у меня версия с GUI)
2) Положил свой публичный ключ с помощью `ssh-copy-id` на данную машину, чтобы авторизовываться по ключу
   
> [!NOTE] Info
> По умолчанию в Proxmox указаны платные репозитории и без [enterprise лицензии](https://www.proxmox.com/en/products/proxmox-virtual-environment/pricing) обновлять и устанавливать ПО не получится на сервере. 
> 
> Поэтому в следующем пункте я подключу нужные репозитории.
 
3) Убрать все платные репозитории из `/etc/apt/sources.list.d`
	1) Удалил файлы `ceph.sources` и `pve-enterprise.sources`
	2) Создал `pve-no-subscription.list` с `deb http://download.proxmox.com/debian/pve trixie pve-no-subscription`
	3) `apt update` -> `apt list --upgradable` -> `apt upgrade`
4) 


