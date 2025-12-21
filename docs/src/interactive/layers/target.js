// Place background
this.P2P.place(this, 'p4_key', 'background');
this.face = this.P2P.place(this, 'p4_key', 'face');

// Use target to apply method to portion of target
const rightEye = this.face.target("rightEye");

// You can also use target on targeted items
const rightEyeDot = rightEye.target("dot");

// Now you can apply changes to just a portion.
rightEye.setScale(2);
rightEyeDot.setScale(.5);
