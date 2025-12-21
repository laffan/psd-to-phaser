// Initially place everything
this.P2P.place(this, 'p5_key', 'background');
const rings = this.P2P.place(this, 'p5_key', 'outer');

// Remove the center group.
rings.remove("inner1/inner2/center");

// Remove the inner2 group but not its children.
rings.remove("inner1", { depth: 1 });
