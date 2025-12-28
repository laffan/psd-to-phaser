// Place the background scribble pattern
this.P2P.place(this, this.psdKey, 'backgroundScribble');

// Place a group with a layer mask
// The "maskedShape" group has a circular mask applied.
// All children (sky, moon, midground, foreground) are
// visible only within the mask shape.
const maskedGroup = this.P2P.place(this, this.psdKey, 'maskedShape');

// Get individual layers to animate them
const moon = maskedGroup.target('moon');
const midground = maskedGroup.target('midground');

// Animate the moon moving back and forth
// The mask stays fixed while the sprite moves underneath
this.tweens.add({
  targets: moon.getChildren(),
  x: '-=80',
  duration: 3000,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut'
});

// Animate midground at a different speed for parallax effect
this.tweens.add({
  targets: midground.getChildren(),
  x: '+=40',
  duration: 4000,
  yoyo: true,
  repeat: -1,
  ease: 'Sine.easeInOut'
});
