---
name: helios
description: This skill should be used when a project uses lol.trq.helios, or the user asks to "draw rounded rectangles in Forge 1.8.9", "render smooth text in a 1.8.9 mod", "add blur or bloom to a 1.8.9 GUI", "project world to screen in 1.8.9", or use ShapeBatch, TextRenderer, MeshRenderer, StateGuard, StencilMask or MinecraftHelios.
---

# lol.trq.helios

Rendering library for Minecraft Forge 1.8.9 on OpenGL 4.1 core: shapes, text, blur, bloom, clipping, 3D meshes and
player-model anchors. MIT.

## Requirements

- Minecraft 1.8.9, Forge 11.15.1.2318, Java 17, 21 or 25.
- The game must run on lol.trq.lazarus with LWJGL 3 and its core renderer. This is the default on LWJGL 3 from Lazarus
  0.4.0; on 0.2.x and 0.3.x, start with `-Dlazarus.gl=core`. It does not run on stock LWJGL 2 or with
  `-Dlazarus.gl=compat`.
- GitHub Packages needs a token with `read:packages`. Use a
  [release version](https://github.com/trq-lol/lol.trq.helios/releases) for `VERSION`, without the `v`.

```groovy
repositories {
    maven {
        url = uri('https://maven.pkg.github.com/trq-lol/lol.trq.helios')
        credentials {
            username = findProperty('gpr.user') ?: System.getenv('GITHUB_ACTOR')
            password = findProperty('gpr.key') ?: System.getenv('GITHUB_TOKEN')
        }
    }
}

dependencies {
    implementation 'lol.trq:lol.trq.helios:VERSION'
}
```

## Draw a card

```java
private Helios helios;

public void draw(int guiScale) { // from a GuiScreen draw; ScaledResolution.getScaleFactor()
    if (helios == null) {
        helios = MinecraftHelios.create();
    }
    float pixel = 1f / guiScale;
    TextStyle title = TextStyle.builder(helios.defaultFont()).size(14).build();

    helios.effects().blurBehind(12, 12, 160, 64, 8, pixel, 3, 2, 0xFFFFFFFF);

    ShapeBatch batch = helios.shapes().begin(pixel);
    batch.shadow(12, 14, 160, 64, 8, 6, 0x66000000)
            .rect(12, 12, 160, 64, 8, Paint.vertical(0xCC3B82F6, 0xCC1D4ED8))
            .outline(12, 12, 160, 64, 8, 1, Paint.solid(0x40FFFFFF));
    helios.text().draw(batch, "Settings", 24, 24, title);
    batch.end(); // shapes and text go out in one draw call

    helios.tick(); // once per frame
}
```

## Conventions

- Coordinates are GUI units. `pixel` is one framebuffer pixel in those units.
- Colours are `0xAARRGGBB`, not premultiplied. Angles are radians, 0 along +x, growing clockwise on screen.

## Pitfalls

- **Render thread only**, one `Helios` per GL context. Keep it; do not create one per frame.
- **Call `tick()` exactly once per frame**, however many screens draw. It advances the upload ring.
- **Put shapes and text in one batch.** Every `end()` is a draw call; so is a change of image texture.
- **Own GL work goes inside `helios.guard()`** in a try-with-resources. Raw GL changes desynchronise
  `GlStateManager` and break vanilla and OptiFine drawing later.
- **Own shaders are `#version 410 core`** with `layout(location)` inputs. No fixed-function built-ins, and nothing
  newer than 4.1, because of macOS.
- **Capture a `Projector` in a world render hook**, where the camera matrices are current, then project in the GUI.
  Positions are relative to the camera.
- `blurBehind` and bloom expect GUI coordinates from the top left of the screen.
- Call `MinecraftHelios.enableStencil()` before using `helios.stencil()`.
- Keep `Animation` objects across frames, one per widget.
- Anchors exist for head, body and back only. OptiFine shader packs are untested.

## Source of truth

This skill is a summary. Before writing code against a type it does not show, read the current docs:

- Index of docs and source: <https://raw.githubusercontent.com/trq-lol/lol.trq.helios/main/llms.txt>
- README: <https://raw.githubusercontent.com/trq-lol/lol.trq.helios/main/README.md>
- Changelog: <https://raw.githubusercontent.com/trq-lol/lol.trq.helios/main/CHANGELOG.md>
- OpenGL rules: <https://raw.githubusercontent.com/trq-lol/lol.trq.helios/main/docs/opengl.md>

Match the docs to the version in use: replace `main` in a link with its release tag. Do not guess a class or method
name; find it in the index first.
