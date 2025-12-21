// Initial placement
this.P2P.place(this, 'p7_key', 'background');
this.P2P.place(this, 'p7_key', 'atlasBob');

// Get the texture from atlasBob
const texture = this.P2P.getTexture(this, "p7_key", 'atlasBob');

// Use bob's arm and leg to create idea particles.
const bobsIdea = this.add.particles(150, 110, texture, {
  frame: ['armL', 'legL'],
  speed: 100,
  scale: { start: 1, end: 0 },
});

// Set particles to have lower opacity
bobsIdea.setAlpha(0.3);
