// Place background
this.P2P.place(this, this.psdKey, 'background');
this.P2P.place(this, this.psdKey, 'dots');
this.P2P.place(this, this.psdKey, 'shapes');

// Initialize a draggable camera with options
this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
  draggable: {
    useBounds: { x: 0, y: 0, width: 1000, height: 1000 },
    easeDragging: true,
    friction: 0.95,
    minSpeed: 0.1,
  },
});
