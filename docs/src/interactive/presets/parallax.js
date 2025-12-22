// Place layers individually
const bg = this.P2P.place(this, this.psdKey, "background");
const stars = this.P2P.place(this, this.psdKey, "stars");
const mid = this.P2P.place(this, this.psdKey, "midground");
const fg = this.P2P.place(this, this.psdKey, "foreground");

// Get the sprites from the groups
const bgSprite = bg.getChildren()[0];
const starsSprite = stars.getChildren()[0];
const midSprite = mid.getChildren()[0];

// Create draggable camera - drag to see parallax!
this.P2P.createCamera(this.cameras.main, ['draggable'], {
  draggable: { easeDragging: true }
});

// Apply parallax - lower scrollFactor = slower scroll
this.P2P.use.parallax({ target: bgSprite, scrollFactor: 0.1 });
this.P2P.use.parallax({ target: starsSprite, scrollFactor: 0.3 });
this.P2P.use.parallax({ target: midSprite, scrollFactor: 0.6 });
