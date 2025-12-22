// Place background
this.P2P.place(this, this.psdKey, 'background');
this.P2P.place(this, this.psdKey, 'face/leftEye');
this.P2P.place(this, this.psdKey, 'face/rightEye');

// Default frameRate is set by the layer name
this.talk = this.P2P.place(this, this.psdKey, 'face/mouthAnimated');

// Uncomment this updateAnimation to trigger overrides.
// this.talk.updateAnimation({
//   frameRate: 15,
//   yoyo: true
// });
