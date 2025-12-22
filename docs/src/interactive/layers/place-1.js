// Layer order is preserved regardless of when an item is placed.
this.P2P.place(this, this.psdKey, 'background');

// To access nested layers, use a "/"
this.P2P.place(this, this.psdKey, 'face/nose');
this.P2P.place(this, this.psdKey, 'face/rightEye');
this.P2P.place(this, this.psdKey, 'face/leftEye/sketchDiamond');

// Uncomment these lines to see other layers being added.
// this.P2P.place(this, this.psdKey, 'face/leftEye/square');
// this.P2P.place(this, this.psdKey, 'face/mouth');
