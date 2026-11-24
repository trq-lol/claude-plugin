# trq-lol plugin for Claude Code

Skills that teach Claude Code to build with the public lol.trq libraries. Claude loads the right one when a task
needs it.

| Skill | Library |
|---|---|
| `alts` | [lol.trq.alts](https://github.com/trq-lol/lol.trq.alts): Minecraft account sign-in, storage and vaults |
| `helios` | [lol.trq.helios](https://github.com/trq-lol/lol.trq.helios): rendering for Forge 1.8.9 on modern OpenGL |
| `lazarus` | [lol.trq.lazarus](https://github.com/trq-lol/lol.trq.lazarus): Forge 1.8.9 on modern Java |
| `orpheus` | [lol.trq.orpheus](https://github.com/trq-lol/lol.trq.orpheus): what is playing, controls and synced lyrics |

## Install

In Claude Code:

```
/plugin marketplace add trq-lol/claude-plugin
/plugin install trq-lol@trq-lol
```

The skills are plain Markdown, so any other assistant can read `skills/<name>/SKILL.md` directly. The plugin runs no
code and has no hooks or servers.

## Development

```sh
node scripts/check.mjs           # manifests, frontmatter, publish safety
node scripts/check.mjs --links   # also checks that every link resolves
node --test
claude plugin validate .
```

## For AI agents

Read [CLAUDE.md](CLAUDE.md) first. [llms.txt](llms.txt) indexes the files.

## License

[MIT](LICENSE). The libraries have their own licenses. Not affiliated with Anthropic, Mojang or Microsoft.
