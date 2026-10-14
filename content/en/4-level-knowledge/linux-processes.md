---
translationKey: protsessy-v-linux
modified: 2026-10-12 22:57:06+03:00
created: 2026-10-12 20:05:54+03:00
up:
- '[[linux]]'
version: '1.0'
title: Processes in Linux
---

**A process in Linux is a running instance of a program.** One program can run in several processes, and a process can contain threads. The kernel manages processes.

![[Pasted image 20261012224650.png]]

**Each process receives a process ID (PID).** It is unique among processes in its current visibility scope, but can be reused after the process ends. You can address a process by PID, for example to send a signal asking it to stop or terminate.

Besides the PID, a process can have these fields:

- **TTY:** Its controlling terminal, if any. Background services may have none.
- **CMD:** The program name or command and arguments, depending on the `ps` output format. The displayed command line may differ from the original one.
- **STAT:** Its state. `S` means sleeping while waiting for an event; `T` means stopped; `R` means running or runnable; and `Z` means terminated but not yet reaped by its parent (a zombie).
- **TIME:** The total CPU time the process has used, not the elapsed time since it started.

## Process management

![[Pasted image 20261012224628.png]]

Process management covers starting, pausing, resuming, scheduling, and terminating processes.

### Creating processes

![[Pasted image 20261012224217.png]]

A common way to start a new program is to create a child process and then replace the program it runs:

- `fork()` creates a new child process resembling the parent.
- A function from the `exec()` family replaces the program inside an existing process. It does not create another process, and the PID stays the same.

> `fork` creates a child process; `exec` runs another program in an existing process. They are often used together.

### Terminating processes

![[Pasted image 20261012224516.png]]

`kill` sends a signal to a process. By default that signal is `SIGTERM`, a request to terminate that the process can handle or ignore. `SIGKILL` forces termination and does not allow cleanup.

### Inspecting processes

![[Pasted image 20261012224543.png]]

Use `ps` to inspect processes:

- `ps x` shows all processes you have started.
- `ps ax` shows all processes in the system, not just yours.
- `ps u` shows more detailed information.
- `ps w` widens the output; `ps ww` removes the command-line width limit.

### Background jobs

![[Pasted image 20261012224730.png]]

Add an ampersand (`&`) to the end of a command to start it in the background. Use `bg` to resume an already stopped command in the background.

A background process may still try to read from the terminal and stop, or print to the same terminal. Redirect standard output (`STDOUT`) and standard error (`STDERR`) to a file or `/dev/null` if they would interfere. If terminal input is unnecessary, redirect standard input from `/dev/null` too.

## Zombie processes

![[Pasted image 20261012224745.png]]

A process can create children with `fork()`. A parent can wait for a child to finish and collect its exit status, but the child may finish before the parent does.

If the parent has not yet collected the status with `wait()` or a similar call, the child becomes a zombie. Linux zombies no longer run, so sending them `SIGTERM` or `SIGKILL` is pointless. Only a small record containing the PID and exit status remains. It disappears when the parent collects the status. If the parent exits first, the zombie is adopted by another process that can collect it.

In `ps`, zombies have `Z` in the `STAT` column, and their command often contains `<defunct>`:

```sh
ps -eo pid,ppid,stat,args
```

## PPID (Parent Process ID)

![[Pasted image 20261012224759.png]]

The PPID is the PID of the process's current parent. It lets you see parent–child relationships. A parent's termination usually does not terminate its child: an orphaned process gets another parent, so its PPID changes. The current PPID does not always reveal which process originally started it.

**An example:** Suppose you open a `bash` or `zsh` terminal. The shell gets PID **1234**. Then:

1. You type `sleep 60` and press Enter.
2. The shell creates a process for that command. The new `sleep` process gets its own PID, for example **5678**.
3. Because the shell launched it, the new process initially has PPID **1234**.
