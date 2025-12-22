// Place background
this.P2P.place(this, this.psdKey, 'background');

// Assign placed item to a variable
const rightEye = this.P2P.place(this, this.psdKey, 'face/rightEye');

// Use default methods to manipulate the placed item.
rightEye.setAlpha(0.3);
rightEye.setRotation(Math.PI / 4);
