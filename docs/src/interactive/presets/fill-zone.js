// Place background first
this.P2P.place(this, this.psdKey, "background");

// Place and get the zone object
const zoneGroup = this.P2P.place(this, this.psdKey, "fillArea");
const zone = zoneGroup.getChildren()[0]; // Get actual Zone

// Place and get the fill sprite
const spritesGroup = this.P2P.place(this, this.psdKey, "sprites");
const fillSprite = spritesGroup.getChildren()[0]; // Get first sprite

// Fill the zone with copies of the sprite
this.P2P.use.fillZone(zone, fillSprite, {
  minInstances: 8,
  maxInstances: 15,
  scaleRange: [0.5, 1.2],
  tint: [0xff6666, 0x66ff66, 0x6666ff]
});
