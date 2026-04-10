# PSD-to-Phaser: Phaser 3 → Phaser 4 Migration Plan

This document tracks the migration of the `psd-to-phaser` plugin from Phaser 3.x to Phaser 4.0.

---

## Summary of Impact

Phaser 4 introduces several breaking changes that affect this plugin. The changes are categorized by severity below.

| Severity | Area | Files Affected |
|----------|------|---------------|
| **CRITICAL** | `Phaser.Geom.Point` removed | `zones.ts`, `joystick.ts`, `fillZone.ts` |
| **CRITICAL** | Mask system → Filter system | `applyMask.ts`, `getMask.ts`, `spriteMethods.ts`, `tiles.ts`, `spriteSetup.ts` |
| **HIGH** | `setPipeline()` removed | `spriteMethods.ts` |
| **MEDIUM** | Tint system behavior change | `spriteMethods.ts`, `fillZone.ts` |
| **LOW** | `roundPixels` default changed | Documentation only |
| **LOW** | `peerDependencies` update | `package.json` |

---

## 1. `Phaser.Geom.Point` → `Phaser.Math.Vector2` [CRITICAL]

### What changed
`Phaser.Geom.Point` has been completely removed in Phaser 4. All geometry classes now return `Phaser.Math.Vector2` instead.

### Files affected

#### `src/modules/place/types/zones.ts`
- **Line 38-51**: `new Phaser.Geom.Point(...)` used to create zone points
- **Line 78**: `new Phaser.Geom.Point(point[0], point[1])` in polygon creation
- **Type references**: `Phaser.Geom.Point[]` for zone point data

#### `src/modules/use/functions/joystick.ts`
- **Line 351**: `new Phaser.Geom.Point()` — `getClosestPointOnPolygon` return type
- **Line 378-380**: `new Phaser.Geom.Point(...)` — `getClosestPointOnLine` return
- **Line 385-393**: `new Phaser.Geom.Point(...)` — `getPolygonCenter` return

#### `src/modules/use/functions/fillZone.ts`
- **Line 24**: Type reference `Phaser.Geom.Point[]` for zone points data

### Migration steps
1. Replace all `new Phaser.Geom.Point(x, y)` → `new Phaser.Math.Vector2(x, y)`
2. Replace all type annotations `Phaser.Geom.Point` → `Phaser.Math.Vector2`
3. Verify `Phaser.Geom.Polygon` constructor still accepts `Vector2[]` (it does per migration guide)

---

## 2. Mask System → Filter System [CRITICAL]

### What changed
Phaser 3's `BitmapMask` / `setMask()` system has been replaced by a unified Filter system in Phaser 4:
- **v3**: `maskImage.createBitmapMask()` → `gameObject.setMask(bitmapMask)`
- **v4**: `gameObject.filters.internal.addMask(maskObject)`

### Files affected

#### `src/modules/shared/applyMask.ts`
- **Lines 33-42**: `applyMaskToGameObject()` — creates BitmapMask and calls `setMask()`
- **Lines 74-82**: `applyMaskToContainer()` — creates BitmapMask for containers
- **Lines 136-153**: `applySharedMaskToGroup()` — creates shared BitmapMask for group children
- **Type**: `Phaser.Display.Masks.BitmapMask` parameter type

#### `src/modules/getMask.ts`
- **Lines 81-86**: Creates BitmapMask and returns `MaskResult` with `Phaser.Display.Masks.BitmapMask`
- **Interface `MaskResult`**: Contains `bitmapMask: Phaser.Display.Masks.BitmapMask`

#### `src/modules/shared/attachedMethods/spriteMethods.ts`
- **Line 14**: `setMask` in `methodsToAttach` array

#### `src/modules/shared/spriteSetup.ts`
- **Line 25**: Calls `applyMaskToGameObject()`

#### `src/modules/place/types/tiles.ts`
- **Line 59**: Calls `applyMaskToContainer()`

### Migration steps
1. Replace `maskImage.createBitmapMask()` + `gameObject.setMask(mask)` with `gameObject.filters.internal.addMask(maskImage)`
2. Update `MaskResult` interface to return the filter reference instead of `BitmapMask`
3. Remove `setMask` from `methodsToAttach` (or replace with filter equivalent)
4. Update `applyMaskToContainer` — containers may need different filter handling
5. Update `applySharedMaskToGroup` — apply filter to each child individually
6. Verify `convertLuminanceToAlpha` canvas approach still works with the new filter system

---

## 3. `setPipeline()` Removed [HIGH]

### What changed
The Pipeline system has been replaced by the RenderNode architecture. `setPipeline()` no longer exists.

### Files affected

#### `src/modules/shared/attachedMethods/spriteMethods.ts`
- **Line 16**: `setPipeline` listed in `methodsToAttach`

### Migration steps
1. Remove `setPipeline` from the `methodsToAttach` array
2. This was exposed as a convenience passthrough; users who need render node control can access it directly on game objects

---

## 4. Tint System Changes [MEDIUM]

### What changed
- `setTintFill()` method has been removed
- `setTint()` now purely affects color and no longer deactivates fill mode
- New `setTintMode()` method with modes: `MULTIPLY`, `FILL`, `ADD`, `SCREEN`, `OVERLAY`, `HARD_LIGHT`

### Files affected

#### `src/modules/shared/attachedMethods/spriteMethods.ts`
- **Line 21**: `setTint` in `methodsToAttach` — still valid, but behavior changed

#### `src/modules/use/functions/fillZone.ts`
- **Line 93**: `fillerSprite.setTint(tint)` — still valid

### Migration steps
1. `setTint` usage is still valid — no code changes required
2. Document the behavior change for plugin users (tint is now purely color, use `setTintMode` for fill effects)

---

## 5. `roundPixels` Default Changed [LOW]

### What changed
- **v3**: `roundPixels` defaults to `true`
- **v4**: `roundPixels` defaults to `false`

### Impact
May affect pixel-perfect tile placement. No code change required in the plugin itself, but users may need to set `roundPixels: true` in their game config for pixel-art projects.

---

## 6. `peerDependencies` Update [LOW]

### Files affected

#### `package.json`
- Change `"phaser": "^3.8"` → `"phaser": "^4.0"`

---

## 7. API Compatibility Audit [VERIFY]

The following APIs are used extensively throughout the plugin and were **not** explicitly listed as breaking in the migration guide. They should still work but need verification:

### Loader API
- `scene.load.json()`, `.image()`, `.atlas()`, `.spritesheet()`
- `scene.load.once('filecomplete-*')` event pattern
- `scene.load.on('complete')`, `scene.load.on('loaderror')`
- `scene.load.isLoading()`, `scene.load.start()`
- `scene.load.textureManager`

### Animation API
- `scene.anims.create()`, `.exists()`, `.get()`, `.remove()`
- `scene.anims.generateFrameNumbers()`
- `sprite.play()`, `sprite.anims.currentAnim`
- `Phaser.Types.Animations.Animation` type

### Camera API
- `camera.scrollX/scrollY`, `camera.zoom`, `camera.width/height`
- `camera.setBounds()`
- `scene.cameras.add()`, `.remove()`, `.main`, `.getCamera()`

### Input API
- `scene.input.on('pointerdown/pointermove/pointerup/pointerupoutside')`
- `scene.input.hitTestPointer()`
- `gameObject.setInteractive()`
- `gameObject.on('pointerover/pointerout/pointerdown/pointerup')`

### Game Objects
- `scene.add.sprite()`, `.image()`, `.group()`, `.container()`, `.zone()`
- `scene.add.graphics()`, `.text()`, `.rectangle()`, `.circle()`
- All standard methods: `setName`, `setOrigin`, `setDepth`, `setVisible`, `setAlpha`, `setScale`, `setPosition`, `setFrame`, `setData`, `getData`, `setScrollFactor`, `setBlendMode`, `setFlip`, `setDisplaySize`, `setSize`, `setActive`, `setAngle`, `setRotation`, `setX/Y/Z`

### Textures
- `scene.textures.exists()`, `.get()`, `.getTextureKeys()`, `.addCanvas()`
- `texture.getFrameNames()`, `.getSourceImage()`, `.frameTotal`

### Tweens
- `scene.tweens.add()`

### Geometry (non-Point)
- `Phaser.Geom.Polygon`, `Phaser.Geom.Rectangle`
- `Phaser.Geom.Polygon.GetAABB()`, `.Contains()`
- `Phaser.Geom.Intersects.RectangleToRectangle()`

### Math
- `Phaser.Math.Vector2`, `Phaser.Math.Between()`, `Phaser.Math.FloatBetween()`
- `Phaser.Math.Clamp()`, `Phaser.Math.Distance.Between()`, `Phaser.Math.RND.pick()`
- `Phaser.Math.Easing.Linear`, `Phaser.Math.Easing.Cubic.InOut`

### Other
- `scene.sys.game.device.input.touch` (mobile detection)
- `scene.children.list`, `scene.children.remove()`, `scene.children.sort()`
- `scene.time.now`
- `Phaser.Physics.Arcade.Body` (joystick velocity control)
- `gameObject.parentContainer`
- `gameObject.scene`
- `gameObject.destroy()`

---

## Implementation Order

1. Update `package.json` peerDependencies
2. Replace all `Phaser.Geom.Point` → `Phaser.Math.Vector2`
3. Migrate mask system from BitmapMask to Filters
4. Remove `setPipeline` from attached methods
5. Verify tint behavior (no code changes expected)
6. Build and fix any TypeScript compilation errors
7. Runtime testing against Phaser 4

---

## Status

| Task | Status |
|------|--------|
| Migration plan created | ✅ Complete |
| `package.json` updated | ✅ Complete |
| `Geom.Point` → `Vector2` | ✅ Complete |
| Mask → Filter migration | ✅ Complete |
| `setPipeline` removal | ✅ Complete |
| `setMask` removal from methods | ✅ Complete |
| Tint audit | ✅ Complete (no changes needed) |
| TypeScript build | ✅ Complete (0 errors) |
| Runtime testing | ⬜ Requires Phaser 4 runtime environment |
