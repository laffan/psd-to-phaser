// Place background
this.P2P.place(this, this.psdKey, 'background');
this.P2P.place(this, this.psdKey, 'dots');
this.shapes = this.P2P.place(this, this.psdKey, 'shapes');

// Create draggable camera
this.dragCam = this.P2P.createCamera(this.cameras.main, ['draggable'], {
  draggable: {
    useBounds: { x: 0, y: 0, width: 1000, height: 1000 }
  }
});

// Add status text
this.statusText = this.add.text(10, 10, 'Camera: ACTIVE (click shapes to toggle)', {
  fontSize: '14px',
  backgroundColor: '#000',
  padding: { x: 8, y: 4 }
}).setScrollFactor(0).setDepth(1000);

// Make shapes clickable to toggle pause
this.shapes.getChildren().forEach(child => {
  if (child.setInteractive) {
    child.setInteractive();
    child.on('pointerdown', () => {
      if (this.dragCam.isPaused()) {
        this.dragCam.resume();
        this.statusText.setText('Camera: ACTIVE (click shapes to toggle)');
        this.statusText.setColor('#00ff00');
      } else {
        this.dragCam.pause();
        this.statusText.setText('Camera: PAUSED (click shapes to toggle)');
        this.statusText.setColor('#ff6666');
      }
    });
  }
});
