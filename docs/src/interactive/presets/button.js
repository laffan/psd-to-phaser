// Place background
this.P2P.place(this, this.psdKey, "background");

// Place button sprites
const btnNormal = this.P2P.place(this, this.psdKey, "buttons/buttonNormal");
const btnHover = this.P2P.place(this, this.psdKey, "buttons/buttonHover");
const btnActive = this.P2P.place(this, this.psdKey, "buttons/buttonActive");

// Create button with all states
this.P2P.use.button([
  {
    normal: btnNormal,
    hover: btnHover,
    active: btnActive
  },
  {
    click: (btn) => console.log("Button clicked!")
  }
]);
