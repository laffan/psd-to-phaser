// The PSD is auto-loaded by the interactive demo system.
// This demo shows what happens after loading completes.

// Create a progress bar background
const barBg = this.add.rectangle(150, 140, 200, 20, 0x333333);
barBg.setOrigin(0, 0.5);

// Create progress bar fill (shown as complete since PSD was auto-loaded)
const barFill = this.add.rectangle(150, 140, 200, 16, 0x00ff00);
barFill.setOrigin(0, 0.5);

// Status text
const statusText = this.add.text(150, 160, 'Load complete!', {
  fontSize: '12px',
  color: '#ffffff'
});

// PSD was auto-loaded by the demo system - place the content
this.P2P.place(this, this.psdKey, 'background');
this.P2P.place(this, this.psdKey, 'face');

// In your own code, you would load and listen for events like this:
//
// // In preload():
// this.P2P.load.load(this, 'p1_key', 'assets/psd');
//
// // In create():
// this.events.on('psdLoadProgress', (progress) => {
//   console.log(`Loading: ${(progress * 100).toFixed(0)}%`);
// });
//
// this.events.once('psdLoadComplete', () => {
//   this.P2P.place(this, 'p1_key', 'background');
// });
