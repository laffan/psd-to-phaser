// Place background
this.P2P.place(this, this.psdKey, 'background');
this.P2P.place(this, this.psdKey, 'dots');
this.shapes = this.P2P.place(this, this.psdKey, 'shapes');

// Create simple draggable cam
this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable']);

// Change values during drag.
this.events.on("draggableStart", () => {
  this.shapes.setAlpha(0.3)
});

this.events.on("draggableComplete", () => {
  this.shapes.setAlpha(1)
});
