---
layout: base.njk
title: LazyLoad Camera
---

# LazyLoad Camera

The lazyLoad camera works in conjunction with the `lazyLoad` attribute to load assets only when they enter the camera view. This dramatically reduces initial load times by loading assets on-demand.

## Basic LazyLoad Setup

{% interactive "demos/output/cameras", "lazy_load_basic", "// Load with lazy loading enabled
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras', {
  lazyLoad: ['heavyAssets', 'distantObjects']
});

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  scene.setPosition(0, 0);
  
  // Create lazyLoad camera
  this.lazyCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
    lazyLoad: {
      extendPreloadBounds: 50,
      debug: {
        console: true
      }
    }
  });
  
  console.log('Move camera to trigger lazy loading!');
});" %}

## LazyLoad with Debug Options

Debug options help you visualize and understand the lazy loading behavior:

{% interactive "demos/output/cameras", "lazy_load_debug", "// Load with lazy loading
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras', {
  lazyLoad: true
});

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  // Create lazyLoad camera with full debug
  this.lazyCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
    lazyLoad: {
      extendPreloadBounds: -30,
      debug: {
        shape: true,  // Show load boundaries
        label: true,  // Show file names
        console: true // Console logging
      }
    }
  });
});" %}

## LazyLoad with Zoom Support

When using camera zoom, you may want to use the boundary camera option to maintain accurate loading boundaries:

{% interactive "demos/output/cameras", "lazy_load_zoom", "// Load with lazy loading
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras', {
  lazyLoad: true
});

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  // LazyLoad camera with zoom support
  this.zoomCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
    lazyLoad: {
      createBoundaryCamera: true, // Maintains accurate bounds when zoomed
      debug: { shape: true }
    }
  });
  
  // Add zoom controls
  this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
    const zoom = this.cameras.main.zoom;
    const newZoom = Phaser.Math.Clamp(zoom + (deltaY > 0 ? -0.1 : 0.1), 0.5, 2);
    this.cameras.main.setZoom(newZoom);
  });
});" %}

## Targeting Specific PSDs

By default, lazyLoad applies to all PSDs. You can target specific PSDs:

{% interactive "demos/output/cameras", "lazy_load_selective", "// Load multiple PSDs
this.P2P.loadMultiple(this, [
  {
    key: 'background_psd',
    path: 'public/demos/output/cameras',
    lazyLoad: true
  },
  {
    key: 'ui_psd', 
    path: 'public/demos/output/cameras'
  }
]);

this.events.once('psdLoadComplete', () => {
  // Target only specific PSDs for lazy loading
  this.selectiveCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
    lazyLoad: {
      targetKeys: ['background_psd'], // Only this PSD
      debug: { console: true }
    }
  });
});" %}

## LazyLoad Events

LazyLoad cameras emit specific events you can listen for:

{% interactive "demos/output/cameras", "lazy_load_events", "// Load with lazy loading
this.P2P.load.load(this, 'camera_psd', 'public/demos/output/cameras', {
  lazyLoad: true
});

this.events.once('psdLoadComplete', () => {
  const scene = this.P2P.place(this, 'camera_psd', 'root');
  
  this.lazyCamera = this.P2P.createCamera(this.cameras.main, ['lazyLoad']);
  
  // Listen for lazy load events
  this.events.on('lazyLoadStart', (progress, currentlyLoading) => {
    console.log(`Loading started: ${(progress * 100).toFixed(1)}% complete`);
  });
  
  this.events.on('lazyLoadProgress', (progress, currentlyLoading) => {
    console.log(`Loading: ${(progress * 100).toFixed(1)}% complete`);
    console.log('Currently loading:', currentlyLoading);
  });
  
  this.events.on('lazyLoadingComplete', () => {
    console.log('All lazy loading complete!');
  });
});" %}

## LazyLoad Configuration Options

```javascript
this.P2P.createCamera(this.cameras.main, ['lazyLoad'], {
  lazyLoad: {
    extendPreloadBounds: 50, // Extend/contract trigger bounds beyond camera
    createBoundaryCamera: true, // Creates invisible camera for accurate boundaries when zoomed
    targetKeys: ['psd1', 'psd2'], // Only apply to specific PSDs
    debug: {
      shape: true, // Draw shapes around lazyLoad triggers
      label: true, // Show labels for lazy load items
      console: true // Output lazy load info to console
    }
  }
});
```

## Important Notes

- **Single Camera Only**: Currently does not work with multiple cameras
- **Load Sequence**: You must use a lazyLoad camera to see lazyLoaded items
- **Manual Placement**: Can't manually place lazily loaded items before they load
- **Zoom Bug Fix**: Use `createBoundaryCamera: true` when combining with camera zoom

LazyLoad cameras are essential for games with large worlds, allowing you to maintain fast initial load times while seamlessly loading content as players explore.