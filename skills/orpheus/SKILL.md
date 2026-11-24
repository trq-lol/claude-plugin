---
name: orpheus
description: This skill should be used when a project uses lol.trq.orpheus, or the user asks to "show what song is playing in Java", "read Windows media sessions from Java", "use MPRIS from Java", "control media playback from Java", "display synced lyrics", "parse LRC files in Java", "read Spotify playback from Java", or use SystemSessions, PushSource, AppRules LocalLyrics or SpotifySource.
---

# lol.trq.orpheus

Java library for what is playing, playback controls and synced lyrics, from Windows, Linux and macOS media sessions or
from data pushed in. No dependencies, MIT. Only the optional Spotify module uses the network.

## Requirements

- Java 17 or newer. On Java 24 and newer, add `--enable-native-access=ALL-UNNAMED` to avoid a warning on Windows.
- Windows 10 1809 or newer (x64), or Linux with a session bus. macOS is experimental.
- Use the newest version from [releases](https://github.com/trq-lol/lol.trq.orpheus/releases) for `VERSION`.
- GitHub Packages needs a token with `read:packages`.

```groovy
repositories {
    maven {
        url = uri('https://maven.pkg.github.com/trq-lol/lol.trq.orpheus')
        credentials {
            username = findProperty('gpr.user') ?: System.getenv('GITHUB_ACTOR')
            password = findProperty('gpr.key') ?: System.getenv('GITHUB_TOKEN')
        }
    }
}

dependencies {
    implementation 'lol.trq:orpheus-core:VERSION'
    implementation 'lol.trq:orpheus-system:VERSION'
}
```

`orpheus-core` is pure Java. `orpheus-system` picks the source for the running system. `orpheus-spotify` is optional and
experimental.

## Show what is playing

```java
Orpheus orpheus = Orpheus.builder()
        .source(SystemSessions.create())
        .lyrics(LocalLyrics.in(Path.of("lyrics")))
        .build();
orpheus.start();

Playback now = orpheus.playback(); // any thread, no allocation
if (now.isPresent()) {
    draw(now.track().title(), now.track().artistLine());
    drawBar(now.timeline().progressAt(System.nanoTime()));
}

Snapshot snapshot = orpheus.snapshot();
int line = snapshot.lyrics().lineAt(snapshot.playback().timeline().positionMillisAt(System.nanoTime()));
if (line >= 0) {
    draw(snapshot.lyrics().line(line).text());
}
```

## Events and controls

```java
Subscription subscription = orpheus.listen(event -> {
    if (event instanceof TrackChanged changed) {
        log(changed.snapshot().playback().track().title());
    } else if (event instanceof CoverReady ready) {
        Cover cover = ready.snapshot().cover();
        upload(cover.width(), cover.height(), cover.rgba());
    }
});

if (orpheus.playback().can(Control.SEEK)) {
    orpheus.controls().seek(Duration.ofSeconds(30)).thenAccept(result -> log(result.status()));
}
```

## Own player as a source

```java
PushSource mine = PushSource.create("my-player"); // pass to builder().source(mine)
mine.handler(Control.PAUSE, request -> player.pause());
mine.publish(PlaybackUpdate.playing(track).position(Duration.ofSeconds(12)));
```

## Spotify Web API

```java
TokenSource tokens = () -> session.accessToken(); // a CompletableFuture<String>, null inside while signed out

Orpheus orpheus = Orpheus.builder()
        .source(SpotifySource.create(tokens)) // first: preferred
        .source(SystemSessions.create())      // used while Spotify shows nothing
        .build();
```

- The library never signs in. The application gets and renews the token.
- Scopes: `user-read-playback-state` to read; `user-modify-playback-state` for controls, with Premium.
- Read the [Spotify page](https://github.com/trq-lol/lol.trq.orpheus/blob/main/docs/spotify.md) for rates and display rules, and
  the [developer terms](https://developer.spotify.com/terms) before shipping.

## Pitfalls

- **Compute the position at draw time** from the timeline and `System.nanoTime()`. Do not poll or cache it.
- **Read one `snapshot()`** when a frame needs lyrics, playback and cover to agree.
- **Commands never throw.** Check for `DONE`, `UNSUPPORTED`, `REFUSED` or `FAILED`. Use `controls(playback)` to keep a
  command on the session it was shown for.
- **Listeners run on a library thread** unless the builder gets an `executor(...)`. Do not touch UI from them directly.
- **Do not modify `Cover.rgba()` or `palette()`**; they are cached arrays.
- **Browsers and unknown apps are hidden by default.** Allow them in `AppRules` only when the user asks: private
  windows publish sessions too.
- **Check `Playback.shareable()`** before sending a track anywhere. It is false until a source is opted in.
- Windows has no volume control. Queue, device and library access work for push sources and Spotify only.
- There is no online lyrics provider; implement `LyricsProvider` to add one.
- Call `stop()` on shutdown.

## Source of truth

This skill is a summary. Before writing code against a type it does not show, read the current docs:

- Index of docs and source: <https://raw.githubusercontent.com/trq-lol/lol.trq.orpheus/main/llms.txt>
- README: <https://raw.githubusercontent.com/trq-lol/lol.trq.orpheus/main/README.md>
- Changelog: <https://raw.githubusercontent.com/trq-lol/lol.trq.orpheus/main/CHANGELOG.md>
- Spotify: <https://raw.githubusercontent.com/trq-lol/lol.trq.orpheus/main/docs/spotify.md>
- Platforms: <https://raw.githubusercontent.com/trq-lol/lol.trq.orpheus/main/docs/platforms.md>

Match the docs to the version in use: replace `main` in a link with its release tag. Do not guess a class or method
name; find it in the index first.
