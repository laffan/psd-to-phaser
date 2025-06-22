import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import {pathToFileURL} from "node:url";
import {evaluate} from "@mdx-js/mdx";
import {renderToStaticMarkup} from "react-dom/server";
import * as runtime from "react/jsx-runtime";

export default function(eleventyConfig) {
  // Add syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight);
  
  // Helper function to extract code from MDX children
  function extractCodeFromChildren(children) {
    if (!children) return '';
    
    // If children is a string, return it
    if (typeof children === 'string') {
      return children.trim();
    }
    
    // If children is an array, look for code blocks
    if (Array.isArray(children)) {
      for (const child of children) {
        if (typeof child === 'object' && child.props) {
          // Check if it's a code element
          if (child.type === 'code' && child.props.className === 'language-js') {
            return child.props.children || '';
          }
          // Look in pre > code structure
          if (child.type === 'pre' && child.props.children) {
            const codeEl = child.props.children;
            if (codeEl && codeEl.type === 'code' && codeEl.props) {
              return codeEl.props.children || '';
            }
          }
          // Recursively search nested structures
          const nestedCode = extractCodeFromChildren(child.props.children);
          if (nestedCode) return nestedCode;
        }
      }
    }
    
    // If children is an object, check its properties
    if (typeof children === 'object' && children.props) {
      if (children.type === 'code' && children.props.className === 'language-js') {
        return children.props.children || '';
      }
      return extractCodeFromChildren(children.props.children);
    }
    
    return '';
  }

  // Interactive React component for MDX
  const Interactive = ({ outputPath, psdKey, pixelArt = true, children }) => {
    // Extract code from markdown code block
    const code = extractCodeFromChildren(children);
    const encodedCode = Buffer.from(code).toString('base64');
    const psdFilename = `${outputPath}/${outputPath.split('/').pop()}.psd`;
    const demoId = psdKey;
    
    const htmlContent = `<div class="row mb-3">
      <div class="col-12">
        <div class="accordion" id="accordion-${demoId}">
          <div class="accordion-item">
            <h2 class="accordion-header" id="heading-${demoId}">
              <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                      data-bs-target="#collapse-${demoId}" aria-expanded="false" 
                      aria-controls="collapse-${demoId}">
                PSD Layers
              </button>
            </h2>
            <div id="collapse-${demoId}" class="accordion-collapse collapse" 
                 aria-labelledby="heading-${demoId}" data-bs-parent="#accordion-${demoId}">
              <div class="accordion-body">
                <div class="layer-structure" id="layers-${demoId}" 
                     data-psd-path="public/${outputPath}">
                  Loading layer structure...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-8">
        <div class="code-editor-container">
          <div class="ace-editor" id="editor-${demoId}"></div>
          <button class="btn btn-primary btn-sm run-example" 
                  data-psd="${psdFilename}" 
                  data-name="${demoId}"
                  data-output-path="${outputPath}"
                  data-psd-key="${psdKey}"
                  data-pixel-art="${pixelArt}"
                  data-initial-code="${encodedCode}">
            Run Example
          </button>
        </div>
      </div>
      <div class="col-4">
        <div class="phaser-container" id="phaser-${demoId}"></div>
      </div>
    </div>`;
    
    return runtime.jsx('div', {
      className: 'interactive-example',
      dangerouslySetInnerHTML: { __html: htmlContent }
    });
  };

  // Add MDX support
  eleventyConfig.addExtension("mdx", {
    compile: async (str, inputPath) => {
      const { default: mdxContent } = await evaluate(str, {
        ...runtime,
        baseUrl: pathToFileURL(inputPath)
      });
      return async function(data) {
        let res = await mdxContent({
          components: { Interactive },
          ...data
        });
        return renderToStaticMarkup(res);
      }
    }
  });
  
  // Add custom shortcode for interactive examples  
  eleventyConfig.addPairedShortcode("interactive", function(code, psdFilename, psdName) {
    // Base64 encode the code to avoid any processing issues
    const encodedCode = Buffer.from(code).toString('base64');
    
    return `<div class="interactive-example">
      <div class="row mb-3">
        <div class="col-12">
          <div class="accordion" id="accordion-${psdName}">
            <div class="accordion-item">
              <h2 class="accordion-header" id="heading-${psdName}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" 
                        data-bs-target="#collapse-${psdName}" aria-expanded="false" 
                        aria-controls="collapse-${psdName}">
                  PSD Layers
                </button>
              </h2>
              <div id="collapse-${psdName}" class="accordion-collapse collapse" 
                   aria-labelledby="heading-${psdName}" data-bs-parent="#accordion-${psdName}">
                <div class="accordion-body">
                  <div class="layer-structure" id="layers-${psdName}" 
                       data-psd-path="public/${psdFilename}">
                    Loading layer structure...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
}