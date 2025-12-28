// Place the background scribble pattern
this.P2P.place(this, this.psdKey, 'backgroundScribble');

// Place a group with a layer mask
// The "maskedShape" group has a circular mask applied.
// All children (sky, moon, midground, foreground) are
// visible only within the mask shape.
this.P2P.place(this, this.psdKey, 'maskedShape');
