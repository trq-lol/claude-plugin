---
name: alts
description: This skill should be used when a project uses lol.trq.alts, or the user asks to "add Microsoft login to a Minecraft launcher", "store Minecraft accounts", "refresh a Minecraft session", "check an account in Java", "change a Minecraft skin or name from Java", or wire AltsRuntime, AltLoginService, AccountStore, ProxyProvider or SharedVault.
---

# lol.trq.alts

Account library for Minecraft: Java Edition: sign-in, account operations over a token, bulk runs, an encrypted local
store and a shared vault. Pure JDK plus Gson, MIT.

## Requirements

- Java 25.
- JitPack: `com.github.trq-lol:lol.trq.alts:VERSION`, where `VERSION` is a
  [release tag](https://github.com/trq-lol/lol.trq.alts/releases) including the `v`.
- Gson arrives transitively. In a named module, add `requires lol.trq.alts;`.

```groovy
repositories {
    maven { url 'https://jitpack.io' }
}

dependencies {
    implementation 'com.github.trq-lol:lol.trq.alts:VERSION'
}
```

## Set up one runtime

```java
AltsRuntime<MyHandle> alts = new AltsRuntime.Builder<MyHandle>()
        .sessionInjector(new MySessionInjector())   // required: install a SessionData as the live session
        .vaultDirectory(() -> myDataDir)            // required: where the encrypted store files live
        .mainThread(myExecutor::execute)            // required: run a task on the host's main thread
        .toastSink(new MyToastSink())               // required: show a notification
        .microsoftAuth(MicrosoftAuthConfig.of(MY_AZURE_CLIENT_ID)) // needed for Microsoft sign-in
        .build();
```

`MyHandle` is the host's texture type. A host that draws no avatars can use any type and leave `textureUploader` unset.

## Use it

```java
alts.loginService().loginMicrosoft(LoginMode.ADD)
        .thenAccept(result -> { /* result.success(), result.account(), result.failure() */ });

AccountServices services = alts.accountServices(account);
PlayerProfile profile = services.profile().fetch();
Entitlements owned = services.entitlements().fetch();

alts.close(); // on shutdown: writes pending data and releases the store files
```

## Pitfalls

- **Branch on `AltsFailure.Kind`, never the message.** `NETWORK` means retry, `RATE_LIMITED` means wait,
  `UNAUTHORIZED` and `REAUTH_REQUIRED` mean the credential is the problem. Other failures throw `AltsException`.
- **Blocking reads.** `fetch()` on an account service does network work; keep it off the main thread.
- **One runtime per directory.** A second one fails `build()` with `CONFLICT`. Always `close()`.
- **There is no default client id.** The host registers its own Azure application.
- **An unreadable store is not an empty one.** Check `loadError()`. Writes are refused until a load succeeds or the
  host calls `discardUnreadable()`, which should be a user's decision.
- **The default store key is obfuscation**, derived from machine properties. Supply a `StoreKeyProvider` for real
  protection.
- **Refresh tokens are durable credentials.** Never log them or put them in an exception message.
- **To only look, use `accountService().check(...)`.** `refresh(...)` rotates the refresh token every time.
- **Device codes can be phished.** Show a code only to the user who started that sign-in.
- **Proxies fail closed.** Authenticated SOCKS5 is unsupported, and on an HTTP proxy tunnel the target host name is
  still resolved locally.
- Do not import anything from `lol.trq.alts.internal`.

## Source of truth

This skill is a summary. Before writing code against a type it does not show, read the current docs:

- Index of docs and source: <https://raw.githubusercontent.com/trq-lol/lol.trq.alts/main/llms.txt>
- README: <https://raw.githubusercontent.com/trq-lol/lol.trq.alts/main/README.md>
- Changelog: <https://raw.githubusercontent.com/trq-lol/lol.trq.alts/main/CHANGELOG.md>
- Guide with compiled examples: <https://raw.githubusercontent.com/trq-lol/lol.trq.alts/main/docs/GETTING_STARTED.md>

Match the docs to the version in use: replace `main` in a link with its release tag. Do not guess a class or method
name; find it in the index first.
