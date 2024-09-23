export const loadFonts = (fontList, scene) => {
  let loadedCount = 0;
  const totalCount = fontList.length;

  fontList.forEach(({ name, url }) => {
    console.log("Loading font", name, url);
    const newFont = new FontFace(name, `url(${url})`);
    newFont
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        loadedCount++;
        if (loadedCount === totalCount) {
          console.log("Fonts done loading.")
          scene.events.emit(`fontsLoaded_${scene.scene.key}`);
        }
      })
      .catch((error) => {
        return error;
      });
  });
};
