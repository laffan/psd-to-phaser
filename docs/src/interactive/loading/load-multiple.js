// loadMultiple() loads multiple PSDs with position offsets.
// This demo loads two PSDs and displays content from both.

// Status text
const statusText = this.add.text(10, 10, 'Loading second PSD...', {
  fontSize: '12px',
  color: '#ffffff',
  backgroundColor: '#000000',
  padding: { x: 4, y: 2 }
});
statusText.setDepth(1000);

// First PSD (placement) was auto-loaded by demo system
// Now manually load the second PSD (parallax)
const basePath = document.querySelector('base')?.getAttribute('href') || '/';
const parallaxPath = basePath === '/' ? '/demos/output/parallax' : `${basePath}demos/output/parallax`;

// Set up listener BEFORE starting the load to avoid race condition
this.events.once('psdLoadComplete', () => {
  statusText.setText('Both PSDs loaded!');

  // Place parallax background layers (scaled down to fit)
  const bg = this.P2P.place(this, 'parallax_multi_key', 'background');
  bg.setScale(0.5);
  bg.setPosition(0, 0);

  // Place placement PSD face on top (offset to the right)
  const face = this.P2P.place(this, this.psdKey, 'face');
  face.setPosition(170, 30);
});

// Now start loading the second PSD
this.P2P.load.load(this, 'parallax_multi_key', parallaxPath);
