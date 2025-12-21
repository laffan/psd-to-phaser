// The PSD is auto-loaded by the interactive demo system.
// This demo shows how to listen for load events.

// Create a progress bar background
const barBg = this.add.rectangle(150, 140, 200, 20, 0x333333);
barBg.setOrigin(0, 0.5);

// Create progress bar fill
const barFill = this.add.rectangle(150, 140, 0, 16, 0x00ff00);
barFill.setOrigin(0, 0.5);

// Status text
const statusText = this.add.text(150, 160, 'Loading...', {
  fontSize: '12px',
  color: '#ffffff'
});

// Listen for loading progress
this.events.on('psdLoadProgress', (progress) => {
  barFill.width = 200 * progress;
  statusText.setText(`Loading: ${(progress * 100).toFixed(0)}%`);
});

// Listen for load completion
this.events.once('psdLoadComplete', () => {
  statusText.setText('Load complete!');
  barFill.setFillStyle(0x00ff00);

  // Now place the content
  this.P2P.place(this, 'p1_key', 'background');
  this.P2P.place(this, 'p1_key', 'face');
});
