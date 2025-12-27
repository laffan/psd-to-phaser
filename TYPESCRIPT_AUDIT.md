# TypeScript Code Audit Report

**Project:** psd-to-phaser
**Date:** December 27, 2025
**Auditor:** Claude (Opus 4.5)

## Executive Summary

This audit evaluates the TypeScript codebase against modern best practices with a focus on **DRY principles** and **maintainability**. While the plugin is functional and well-structured at a high level, several significant issues were identified that impact type safety, code reusability, and long-term maintainability.

**Recommendation:** A targeted refactor is warranted. The issues are not severe enough to require a complete rewrite, but addressing them will significantly improve code quality and developer experience.

---

## Critical Issues

### 1. Pervasive Use of `any` Type

**Severity:** High
**Impact:** Eliminates TypeScript's primary benefit (type safety)

The codebase uses `any` extensively, undermining compile-time type checking:

```typescript
// Examples found throughout the codebase:
layer: any                          // place/index.ts:61
spriteData: any                     // place/types/sprites/index.ts:11
data: any                           // load/processJSON.ts:11
(gameObject as any)[methodName]     // shared/attachedMethods/spriteMethods.ts:78
(plugin as any).psdData             // cameras/features/lazyLoad.ts:390
```

**Affected Files:**
- `src/modules/place/index.ts` (lines 61-66)
- `src/modules/place/types/sprites/*.ts` (all files)
- `src/modules/place/types/tiles.ts`
- `src/modules/place/types/zones.ts`
- `src/modules/load/processJSON.ts`
- `src/modules/cameras/features/lazyLoad.ts`

**Recommendation:** Create comprehensive type definitions for PSD data structures:

```typescript
// Suggested: src/types/psd.ts
interface PsdLayer {
  name: string;
  category: 'sprite' | 'tileset' | 'zone' | 'point' | 'group';
  x: number;
  y: number;
  width: number;
  height: number;
  initialDepth?: number;
  attributes?: Record<string, unknown>;
  children?: PsdLayer[];
}

interface SpriteLayer extends PsdLayer {
  category: 'sprite';
  type: 'default' | 'spritesheet' | 'atlas' | 'animation';
  frame_width?: number;
  frame_height?: number;
  frame_count?: number;
}

interface TilesetLayer extends PsdLayer {
  category: 'tileset';
  columns: number;
  rows: number;
}
```

---

### 2. DRY Violation: Debug Visualization Code Duplication

**Severity:** High
**Impact:** Maintenance burden, inconsistent behavior, increased code size

The `addDebugVisualization` function is **copy-pasted across 4 files** with slight variations:

| File | Lines | Color |
|------|-------|-------|
| `place/types/sprites/index.ts` | 77-113 | Green (`0x00ff00`) |
| `place/types/tiles.ts` | 178-210 | Red (`0xff0000`) |
| `place/types/zones.ts` | 77-121 | Blue (`0x0000ff`) |
| `place/types/points.ts` | 43-69 | Red (`0xff0000`) |

**Ironically, there is an unused `shared/debugVisualizer.ts` file** that provides generic debug visualization but is never imported by these modules.

**Recommendation:** Consolidate into a single, parameterized utility:

```typescript
// src/modules/shared/debugVisualizer.ts (enhanced)
interface DebugVisualizationConfig {
  type: 'sprite' | 'tile' | 'zone' | 'point';
  x: number;
  y: number;
  width?: number;
  height?: number;
  name: string;
  shape?: Phaser.Geom.Polygon | Phaser.Geom.Rectangle;
}

const DEBUG_COLORS = {
  sprite: 0x00ff00,
  tile: 0xff0000,
  zone: 0x0000ff,
  point: 0xff0000,
  lazyLoad: 0xff00ff
} as const;

export function addDebugVisualization(
  scene: Phaser.Scene,
  config: DebugVisualizationConfig,
  group: Phaser.GameObjects.Group,
  plugin: PsdToPhaserPlugin
): void {
  const debugDepth = DEBUG_DEPTH;
  const color = DEBUG_COLORS[config.type];

  if (plugin.isDebugEnabled('shape')) {
    // Unified shape rendering logic
  }

  if (plugin.isDebugEnabled('label')) {
    // Unified label rendering logic
  }
}
```

---

### 3. DRY Violation: Sprite Placement Boilerplate

**Severity:** Medium
**Impact:** Code duplication across sprite type handlers

The four sprite placement files share significant boilerplate:

```typescript
// Repeated in default.ts, spritesheet.ts, atlas.ts, animation.ts:
gameObject.setName(layer.name);
gameObject.setOrigin(0, 0);
gameObject.setDepth(layer.initialDepth || 0);
attachAttributes(layer, gameObject);
```

**Recommendation:** Create a base sprite setup utility:

```typescript
// src/modules/place/types/sprites/utils.ts
export function setupSprite(
  sprite: Phaser.GameObjects.Sprite,
  layer: SpriteLayer
): Phaser.GameObjects.Sprite {
  sprite.setName(layer.name);
  sprite.setOrigin(0, 0);
  sprite.setDepth(layer.initialDepth ?? 0);
  attachAttributes(layer, sprite);
  return sprite;
}
```

---

## Moderate Issues

### 4. Missing Centralized Type Definitions

**Severity:** Medium
**Impact:** Types scattered, duplication, inconsistency

Types are defined inline or in individual files without a central types module:

- `DebugOptions` in `PsdToPhaser.ts`
- `LoadOptions` in `modules/load/index.ts`
- `LazyLoadOptions` in `cameras/features/lazyLoad.ts`
- `DraggableOptions` in `cameras/features/draggable.ts`

**Recommendation:** Create a centralized types directory:

```
src/
├── types/
│   ├── index.ts         # Re-exports all types
│   ├── psd.ts           # PSD layer types
│   ├── plugin.ts        # Plugin configuration types
│   ├── camera.ts        # Camera feature types
│   └── debug.ts         # Debug-related types
```

---

### 5. Magic Numbers and Strings

**Severity:** Medium
**Impact:** Hard to modify, inconsistent values

Magic values are scattered throughout:

```typescript
const debugDepth = 1000;           // Repeated in 4+ files
const tileSliceSize = 150;         // Default in multiple places
const interval = 300;              // Lazy load check interval
graphics.lineStyle(2, 0x00ff00);   // Hardcoded colors
```

**Recommendation:** Create a constants file:

```typescript
// src/constants.ts
export const DEBUG_DEPTH = 1000;
export const DEFAULT_TILE_SLICE_SIZE = 150;
export const DEFAULT_LAZY_CHECK_INTERVAL = 300;

export const DEBUG_COLORS = {
  sprite: 0x00ff00,
  tile: 0xff0000,
  zone: 0x0000ff,
  point: 0xff0000,
  lazyLoad: 0xff00ff
} as const;

export const DEBUG_TEXT_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontSize: '16px',
  backgroundColor: '#ffffff'
};
```

---

### 6. Inconsistent Module Patterns

**Severity:** Medium
**Impact:** Cognitive load, harder to understand codebase

Modules use different patterns:

| Module | Pattern |
|--------|---------|
| `loadModule` | Returns object with methods |
| `placeModule` | Returns single function |
| `useModule` | Returns object with methods |
| `getTextureModule` | Returns single function |

**Recommendation:** Standardize on one pattern. The object pattern is more extensible:

```typescript
// Preferred pattern
export default function moduleFactory(plugin: PsdToPhaserPlugin) {
  return {
    primaryMethod() { /* ... */ },
    secondaryMethod() { /* ... */ }
  };
}
```

---

### 7. Dead Code and Unused Imports

**Severity:** Low
**Impact:** Code clutter, potential confusion

Examples found:
- `shared/debugVisualizer.ts` is exported but never imported
- `spriteMethods.ts:6` - empty semicolon
- `spriteMethods.ts:8` - `setAlpha` listed twice in array
- `attachedMethods/index.ts:7` - commented import `attachCopyMethod`
- `atlas.ts:37` - commented `attachAttributes` call

**Recommendation:** Enable stricter ESLint rules and clean up.

---

### 8. Private Member Access Violation

**Severity:** Medium
**Impact:** Breaks encapsulation, fragile to refactoring

```typescript
// cameras/features/lazyLoad.ts:389-391
function getAllPsdKeys(plugin: PsdToPhaserPlugin): string[] {
  const psdData = (plugin as any).psdData;  // Accessing private member!
  return Object.keys(psdData || {});
}
```

**Recommendation:** Add a public method to the plugin:

```typescript
// In PsdToPhaser.ts
getAllKeys(): string[] {
  return Object.keys(this.psdData);
}
```

---

### 9. Missing Type Guards

**Severity:** Medium
**Impact:** Runtime errors possible, defensive coding required

The codebase relies on `instanceof` checks without proper type narrowing:

```typescript
// Current approach - works but not type-safe
if (gameObject instanceof Phaser.GameObjects.Group) {
  // ...
}
```

**Recommendation:** Create type guards for layer categories:

```typescript
// src/types/guards.ts
export function isSpriteLayer(layer: PsdLayer): layer is SpriteLayer {
  return layer.category === 'sprite';
}

export function isTilesetLayer(layer: PsdLayer): layer is TilesetLayer {
  return layer.category === 'tileset';
}

export function isGroupLayer(layer: PsdLayer): layer is GroupLayer {
  return layer.category === 'group' && Array.isArray(layer.children);
}
```

---

## Minor Issues

### 10. Inconsistent Error Handling

Errors are handled via `console.error` without proper error propagation:

```typescript
// Current pattern
if (!psdData) {
  console.error(`No data found for key: ${psdKey}`);
  return scene.add.group();  // Silent failure
}
```

**Recommendation:** Consider custom error classes or Result types for critical failures.

---

### 11. Callback Pattern vs Modern Async

The codebase uses callback patterns (`resolve: () => void`) in place functions:

```typescript
placeSprites(scene, layer, plugin, group, () => {}, psdKey);
```

The `resolve` callback is often a no-op. Consider whether this pattern is still needed or if it can be simplified.

---

## Prioritized Refactoring Roadmap

### Phase 1: Type Safety Foundation (Highest Impact)
1. Create `src/types/` directory with comprehensive type definitions
2. Replace `any` with proper types in core modules
3. Add type guards for layer categories

### Phase 2: DRY Consolidation
1. Unify debug visualization into `shared/debugVisualizer.ts`
2. Create sprite placement utilities
3. Extract constants to `src/constants.ts`

### Phase 3: Cleanup & Polish
1. Remove dead code and unused imports
2. Add public `getAllKeys()` method to plugin
3. Standardize module patterns
4. Enable stricter ESLint/TypeScript rules

---

## Positive Observations

While issues were found, the codebase has several strengths:

1. **Good high-level architecture** - Clear module separation
2. **Consistent file organization** - Logical directory structure
3. **Reasonable abstraction levels** - Factory patterns are well-applied
4. **Comprehensive feature set** - Plugin covers many use cases
5. **TypeScript strict mode enabled** - Good foundation for improvements
6. **Functional plugin** - Despite issues, the code works

---

## Conclusion

The psd-to-phaser codebase would benefit from a targeted refactoring effort focused on:

1. **Type definitions** - This will have the biggest impact on maintainability
2. **Debug visualization consolidation** - Quick win for DRY
3. **Constants extraction** - Easy improvement for consistency

The suggested refactoring can be done incrementally without breaking existing functionality. Starting with Phase 1 (type definitions) is recommended as it will make subsequent refactoring safer and more efficient.

---

## Appendix: Files Requiring Attention

| File | Primary Issues |
|------|----------------|
| `PsdToPhaser.ts` | Missing public key access method |
| `place/index.ts` | `any` types for layers |
| `place/types/sprites/*.ts` | Repeated boilerplate, `any` types |
| `place/types/tiles.ts` | Duplicated debug visualization |
| `place/types/zones.ts` | Duplicated debug visualization |
| `place/types/points.ts` | Duplicated debug visualization |
| `shared/debugVisualizer.ts` | Unused - should be central debug util |
| `shared/attachedMethods/spriteMethods.ts` | Dead code, duplicate array entry |
| `cameras/features/lazyLoad.ts` | Private member access |
| `load/processJSON.ts` | `any` types for data |
