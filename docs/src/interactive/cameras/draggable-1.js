// Place background
this.P2P.place(this, 'p7_key', 'background');
this.P2P.place(this, 'p7_key', 'dots');
this.P2P.place(this, 'p7_key', 'shapes');

// Initialize a draggable camera with options
this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
  draggable: {
    useBounds: { x: 0, y: 0, width: 1000, height: 1000 },
    easeDragging: true,
    friction: 0.95,
    minSpeed: 0.1,
  },
});
