// Place background
this.P2P.place(this, this.psdKey, 'background');
this.P2P.place(this, this.psdKey, 'dots');
this.shapes = this.P2P.place(this, this.psdKey, 'shapes');

// Check for debug mode via URL parameter
const urlParams = new URLSearchParams(window.location.search);
const debugMode = urlParams.get('debug') === 'true';

// Create draggable + lazyLoad camera
this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable', 'lazyLoad'], {
  lazyLoad: {
    extendPreloadBounds: -50, // negative bound so we can see the border for demonstration purposes
    debug: debugMode ? {
      shape: true,
      label: true,
    } : undefined,
  },
});
