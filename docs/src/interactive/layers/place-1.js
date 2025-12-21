// Layer order is preserved regardless of when an item is placed.
this.P2P.place(this, 'p1_key', 'background');

// To access nested layers, use a "/"
this.P2P.place(this, 'p1_key', 'face/nose');
this.P2P.place(this, 'p1_key', 'face/rightEye');
this.P2P.place(this, 'p1_key', 'face/leftEye/sketchDiamond');

// Uncomment these lines to see other layers being added.
// this.P2P.place(this, 'p1_key', 'face/leftEye/square');
// this.P2P.place(this, 'p1_key', 'face/mouth');
