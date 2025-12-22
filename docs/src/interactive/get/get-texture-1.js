// Place background
this.P2P.place(this, this.psdKey, 'background');

// Get the texture from atlasBob
const bob = this.P2P.getTexture(this, this.psdKey, "atlasBob");

// Create a new sprite using just a piece of the atlas
this.add.sprite(150, 150, bob, 'body');
