// Demo: All layers set to lazyLoad
// This demonstrates that layers directly under the camera load immediately
// even when ALL layers in the PSD are marked as lazyLoad

// Check for debug mode via URL parameter
const urlParams = new URLSearchParams(window.location.search);
const debugMode = urlParams.get('debug') === 'true';

// Create draggable + lazyLoad camera BEFORE placing
// This is important: the lazyLoad camera must exist to handle lazy loaded items
this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable', 'lazyLoad'], {
  lazyLoad: {
    extendPreloadBounds: 50, // slight extension to ensure items at edges load
    debug: debugMode ? {
      shape: true,
      label: true,
      console: true,
    } : undefined,
  },
});

// Place the layers - with all layers set to lazyLoad,
// only those visible in the camera viewport will load immediately
this.P2P.place(this, this.psdKey, 'background');
this.P2P.place(this, this.psdKey, 'dots');
this.shapes = this.P2P.place(this, this.psdKey, 'shapes');

// Listen for lazy load events to show activity
this.events.on('lazyLoadStart', (count) => {
  console.log(`LazyLoad: Starting to load ${count} items`);
});

this.events.on('lazyLoadProgress', (progress) => {
  console.log(`LazyLoad: ${(progress * 100).toFixed(0)}% complete`);
});

this.events.on('lazyLoadingComplete', () => {
  console.log('LazyLoad: All items loaded');
});
