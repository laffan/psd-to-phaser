// Place background
this.P2P.place(this, this.psdKey, "background");

// Place markers individually for better control
const markerA = this.P2P.place(this, this.psdKey, "markers/markerA").getChildren()[0];
const markerB = this.P2P.place(this, this.psdKey, "markers/markerB").getChildren()[0];
const markerC = this.P2P.place(this, this.psdKey, "markers/markerC").getChildren()[0];

let currentIdx = 0;
const markers = [markerA, markerB, markerC];

markers.forEach((marker, idx) => {
  marker.setInteractive({ useHandCursor: true });
  marker.on("pointerdown", () => {
    currentIdx = (idx + 1) % markers.length;
    this.P2P.use.panTo(this.cameras.main, markers[currentIdx], { speed: 500 });
  });
});
