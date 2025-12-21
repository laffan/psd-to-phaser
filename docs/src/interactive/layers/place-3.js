// Place background
this.P2P.place(this, 'p3_key', 'background');
this.P2P.place(this, 'p3_key', 'face/leftEye');
this.P2P.place(this, 'p3_key', 'face/rightEye');

// Default frameRate is set by the layer name
this.talk = this.P2P.place(this, 'p3_key', 'face/mouthAnimated');

// Uncomment this updateAnimation to trigger overrides.
// this.talk.updateAnimation({
//   frameRate: 15,
//   yoyo: true
// });
