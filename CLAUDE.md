# CLAUDE.md: working in the trq-lol plugin

A Claude Code plugin with one skill per public lol.trq library. Markdown plus a checker; nothing to build.

## Mental model

- `skills/<library>/SKILL.md` is written for someone **using** the library. Contributor rules live in that library's
  own `CLAUDE.md`.
- A skill holds what rarely changes: requirements, the main example, pitfalls. Everything else is a link to the
  library's `llms.txt`.

## Patterns that matter

- Take examples from the library's README or compiled examples. Never invent an API.
- Write `VERSION` instead of a version number, and link the releases page.
- A library's release that changes an example or a pitfall needs a change here.

## Pitfalls

- Public libraries only. Never mention a private repository or a consuming application.
- No machine paths or secrets.
- Bump `version` in `.claude-plugin/plugin.json` with every change to a skill, or installs do not update.

## Conventions

- Conventional Commits. **You own every commit, including code an AI wrote. Never add Co-Authored-By or any other
  AI-attribution trailer.**
