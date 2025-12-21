// Place background
this.P2P.place(this, "joystick_key", "background");

// Get player sprite
const playerGroup = this.P2P.place(this, "joystick_key", "player");
const player = playerGroup.getChildren()[0];

// Place joystick components
const joystickGroup = this.P2P.place(this, "joystick_key", "joystickArea");
const children = joystickGroup.getChildren();
const joyHandle = children.find(c => c.name === "joyHandle");
const joyZone = children.find(c => c.name === "joyZone");

// Add a tinted background for the joystick area
const zoneBg = this.add.rectangle(150, 250, 110, 110, 0x000000, 0.3);
zoneBg.setDepth(1);

// Create joystick with bounceBack
this.P2P.use.joystick(joyHandle, joyZone, "myJoystick", {
  bounceBack: true
}).control(player, {
  type: "speed",
  maxSpeed: 150
});
