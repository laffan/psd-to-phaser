// loadMultiple() lets you load multiple PSDs with position offsets.
// This demo shows the concept - in practice you'd have multiple PSD outputs.

// Status text
const statusText = this.add.text(10, 10, 'PSDs loaded!', {
  fontSize: '12px',
  color: '#ffffff',
  backgroundColor: '#000000',
  padding: { x: 4, y: 2 }
});

// Place the content (PSD was auto-loaded by the demo system)
// Simulate "background_psd" at position 0,0
this.P2P.place(this, 'p1_key', 'background');

// Simulate "character_psd" - the face layer
this.P2P.place(this, 'p1_key', 'face');

// In a real loadMultiple scenario, each PSD would have its own
// position offset applied automatically during load:
//
// this.P2P.load.loadMultiple(this, [
//   { key: "bg", path: "assets/bg", position: { x: 0, y: 0 } },
//   { key: "char", path: "assets/char", position: { x: 100, y: 50 } }
// ]);
