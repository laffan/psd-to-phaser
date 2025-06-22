const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function(eleventyConfig) {
  // Add syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight);
  
  // Add custom shortcode for interactive examples
  eleventyConfig.addShortcode("interactive", function(psdFilename, psdName, code) {
    // Base64 encode the code to avoid any processing issues
    const encodedCode = Buffer.from(code).toString('base64');
    
    return `<div class="interactive-example">
      <div class="row">
        <div class="col-8">
          <div class="code-editor-container">
            <div class="ace-editor" id="editor-${psdName}"></div>
            <button class="btn btn-primary btn-sm run-example" 
                    data-psd="${psdFilename}" 
                    data-name="${psdName}"
                    data-initial-code="${encodedCode}">
              Run Example
            </button>
          </div>
        </div>
        <div class="col-4">
          <div class="phaser-container" id="phaser-${psdName}"></div>
        </div>
      </div>
    </div>`;
  });
  
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/css");
  // Copy public directory contents to root
  eleventyConfig.addPassthroughCopy("public");
  
  // Copy psd-to-phaser from node_modules
  eleventyConfig.addPassthroughCopy({
    "node_modules/psd-to-phaser/dist/psd-to-phaser.umd.js": "js/psd-to-phaser.min.js"
  });
  
  // Watch for changes in JS and CSS
  eleventyConfig.addWatchTarget("./src/js/");
  eleventyConfig.addWatchTarget("./src/css/");
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "mdx", "njk", "html"]
  };
};