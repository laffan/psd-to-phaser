// Place the background scribble pattern
this.P2P.place(this, this.psdKey, 'backgroundScribble');

// Place a group with a layer mask
// The "maskedShape" group has a circular mask applied.
// All children (sky, moon, midground, foreground) are
// visible only within the mask shape.
const maskedGroup = this.P2P.place(this, this.psdKey, 'maskedShape');

// Get individual layers to animate them
const midground = maskedGroup.target('midground');

// Animate midground
this.tweens.add({
  targets: midground,
  x: '+=100',
  duration: 3000,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut'
});
