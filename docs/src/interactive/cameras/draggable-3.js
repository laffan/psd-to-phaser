// Place background
this.P2P.place(this, 'p7_key', 'background');
this.P2P.place(this, 'p7_key', 'dots');
this.shapes = this.P2P.place(this, 'p7_key', 'shapes');

// Make shapes interactive and draggable
this.shapes.getChildren().forEach(child => {
  if (child.setInteractive) {
    child.setInteractive({ draggable: true });
    this.input.setDraggable(child);
  }
});

// Set up object dragging
this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
  gameObject.x = dragX;
  gameObject.y = dragY;
});

// Create draggable camera that ignores the shapes group
this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
  draggable: {
    useBounds: { x: 0, y: 0, width: 1000, height: 1000 },
    ignore: ['shapes']  // Camera won't drag when clicking on shapes
  }
});
