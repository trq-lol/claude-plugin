---
name: lazarus
description: This skill should be used when a project uses lol.trq.lazarus, or the user asks to "run Forge 1.8.9 on Java 17", "run Minecraft 1.8.9 on Java 21 or 25", "use LWJGL 3 with 1.8.9", "run 1.8.9 natively on Apple silicon", "support Lazarus in a launcher", or troubleshoot a Lazarus launch or its core renderer.
---

# lol.trq.lazarus

One jar that runs stock Minecraft Forge 1.8.9 on Java 17, 21 and 25 without changing Minecraft, Forge or mods, with
optional LWJGL 3 and an OpenGL 4.1 core renderer. LGPL-3.0-or-later.

## Install

Install Forge 1.8.9 (11.15.1.2318) with its own installer first. Get the jar from
[releases](https://github.com/trq-lol/lol.trq.lazarus/releases).

**Official launcher:**

```sh
java -jar lol.trq.lazarus-<version>.jar install [--dir <.minecraft>] [--forge <id>] [--lwjgl3]
```

Then pick the **Forge 1.8.9 (Lazarus)** profile. Plain Forge keeps working.

**Prism Launcher or MultiMC:** put the jar in the instance's `libraries` folder, save the output of
`java -jar lol.trq.lazarus-<version>.jar prism` as `lol.trq.lazarus.json`, import it under
**Edit instance, Version, Import components**, pick Java 17 or newer and turn on **Skip Java compatibility checks**.

**A custom launcher:** set the main class to `lol.trq.lazarus.launch.Lazarus` and add the jar to the class path. If the
agent is missing or Forge's ASM 5 is ahead of ASM 9, Lazarus relaunches the JVM once, so the launcher must tolerate a
child process. Read the launchers document below before implementing it.

## Options

| Option | Effect |
|---|---|
| `--lwjgl3` (installer) | Adds a profile on LWJGL 3. Default on Apple silicon. |
| `-Dlazarus.gl=compat` | Legacy OpenGL renderer instead of the core renderer |
| `-Dlazarus.debug=true` | Logs every patch applied |
| `-Dlazarus.gl.debug=true` | Reports GL errors |

## Writing a mod that runs on it

- Mods need no changes to load. OptiFine HD U M5 and Mixin 0.7 mods are tested.
- Do not cast the system class loader to `URLClassLoader`, and do not rely on `SecurityManager`.
- On LWJGL 3, `Minecraft.displayWidth` is in framebuffer pixels; window points can differ on high-DPI screens.
- For new rendering code on the core renderer, see lol.trq.helios.

## Pitfalls

- Never ship modified Forge, LaunchWrapper, Minecraft or OptiFine files; Lazarus patches at load time.
- The official launcher splits `javaArgs` on spaces: no paths with spaces there.
- Pair newer JVM flags with `-XX:+IgnoreUnrecognizedVMOptions`; older JDKs refuse to start on unknown ones.
- OptiFine cannot be redistributed. Users supply their own copy.

## Source of truth

This skill is a summary. Before writing code against a type it does not show, read the current docs:

- Index of docs and source: <https://raw.githubusercontent.com/trq-lol/lol.trq.lazarus/main/llms.txt>
- README: <https://raw.githubusercontent.com/trq-lol/lol.trq.lazarus/main/README.md>
- Changelog: <https://raw.githubusercontent.com/trq-lol/lol.trq.lazarus/main/CHANGELOG.md>
- Launchers: <https://raw.githubusercontent.com/trq-lol/lol.trq.lazarus/main/docs/launchers.md>
- Compatibility: <https://raw.githubusercontent.com/trq-lol/lol.trq.lazarus/main/docs/compatibility.md>
- Troubleshooting: <https://raw.githubusercontent.com/trq-lol/lol.trq.lazarus/main/docs/troubleshooting.md>
- LWJGL 3: <https://raw.githubusercontent.com/trq-lol/lol.trq.lazarus/main/docs/lwjgl3.md>
- Core renderer: <https://raw.githubusercontent.com/trq-lol/lol.trq.lazarus/main/docs/core-renderer.md>
- Security: <https://raw.githubusercontent.com/trq-lol/lol.trq.lazarus/main/docs/security.md>

Match the docs to the version in use: replace `main` in a link with its release tag. Do not guess a class or method
name; find it in the index first.
