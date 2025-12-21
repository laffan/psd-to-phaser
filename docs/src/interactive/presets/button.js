// Place background
this.P2P.place(this, "button_key", "background");

// Place button sprites
const btnNormal = this.P2P.place(this, "button_key", "buttons/buttonNormal");
const btnHover = this.P2P.place(this, "button_key", "buttons/buttonHover");
const btnActive = this.P2P.place(this, "button_key", "buttons/buttonActive");

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
