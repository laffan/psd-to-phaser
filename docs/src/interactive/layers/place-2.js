// Place background
this.P2P.place(this, 'p2_key', 'background');

// Assign placed item to a variable
const rightEye = this.P2P.place(this, 'p2_key', 'face/rightEye');

// Use default methods to manipulate the placed item.
rightEye.setAlpha(0.3);
rightEye.setRotation(Math.PI / 4);
