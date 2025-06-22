/**
 * Interactive Phaser Examples for PSD to Phaser Documentation
 */

class InteractiveExample {
  constructor(button, psdName, psdFilename) {
    this.button = button;
    this.psdName = psdName;
    this.psdFilename = psdFilename;
    this.outputPath = button.getAttribute('data-output-path');
    this.psdKey = button.getAttribute('data-psd-key');
    this.pixelArt = button.getAttribute('data-pixel-art') !== 'false';
    this.containerId = `phaser-${psdName}`;
    this.editorId = `editor-${psdName}`;
    this.game = null;
    this.editor = null;
    this.initialCode = '';
    
    this.initializeEditor();
    this.setupEventListeners();
    this.loadLayerStructure();
  }
  
  initializeEditor() {
    // Get initial code and decode it
    const encodedCode = this.button.getAttribute('data-initial-code');
    this.initialCode = encodedCode ? atob(encodedCode) : '';
    
    // Initialize Ace editor
    if (typeof ace !== 'undefined') {
      this.editor = ace.edit(this.editorId);
      this.editor.setTheme("ace/theme/github");
      this.editor.session.setMode("ace/mode/javascript");
      this.editor.setValue(this.initialCode, -1);
      this.editor.setOptions({
        fontSize: 14,
        showPrintMargin: false,
        wrap: true
      });
    }
  }
  
  setupEventListeners() {
    // Run example button
    this.button.addEventListener('click', () => this.runExample());
    
    // Auto-run the initial example
    setTimeout(() => {
      this.runExample();
    }, 100);
  }
  
  getCurrentCode() {
    if (this.editor) {
      return this.editor.getValue();
    }
    return this.initialCode;
  }
  
  runExample() {
    // Get the current code from editor or initial code
    const code = this.getCurrentCode();
    
    console.log('Extracted code:', code); // Debug log
    
    // Clear any existing game
    if (this.game) {
      this.game.destroy(true);
      // Wait a moment for cleanup
      setTimeout(() => {
        this.createGame(code);
      }, 50);
    } else {
      this.createGame(code);
    }
  }
  
  createGame(userCode) {
    const container = document.getElementById(this.containerId);
    const containerRect = container.getBoundingClientRect();
    const self = this;
    
    // Clear the container
    container.innerHTML = '';
    
    // Match Ace editor height to Phaser container height
    this.matchEditorHeight();
    
    // Generate unique plugin key with timestamp to avoid conflicts
    const uniquePluginKey = `PsdToPhaser_${self.psdName}_${Date.now()}`;
    
    // Create a proper scene class
    class ExampleScene extends Phaser.Scene {
      constructor() {
        super({ key: 'ExampleScene' });
      }
      
      preload() {
        // Plugin should already be loaded via game config
        console.log('Preload - P2P available:', !!this.P2P);
        if (this.P2P) {
          console.log('Preload - P2P object:', this.P2P);
          console.log('Preload - P2P methods:', Object.getOwnPropertyNames(this.P2P));
          
          // Automatically load the PSD if outputPath and psdKey are provided
          if (self.outputPath && self.psdKey) {
            const fullPath = `public/${self.outputPath}`;
            console.log(`Auto-loading PSD: ${self.psdKey} from ${fullPath}`);
            this.P2P.load.load(this, self.psdKey, fullPath);
          }
        }
      }
      
      create() {
        try {
          // If we have auto-loading enabled, wait for PSD load completion
          if (self.outputPath && self.psdKey) {
            // Try a timeout fallback since the event timing seems to work
            setTimeout(() => {
              this.executeUserCode(userCode);
            }, 1000); // Wait 1 second then execute
            
          } else {
            // No auto-loading, execute user code immediately
            this.executeUserCode(userCode);
          }
        } catch (error) {
          this.displayError(error);
        }
      }
      
      executeUserCode(userCode) {
        try {
          // Validate that we have code to execute
          if (!userCode || userCode.trim() === '') {
            throw new Error('No code provided');
          }
          
          // Create a function from the user's code and execute it in the scene context
          const userFunction = new Function(userCode);
          userFunction.call(this);
          
        } catch (error) {
          console.error('Error executing user code:', error);
          this.displayError(error);
        }
      }
      
      displayError(error) {
        // Display error in the game container
        if (this.add && this.cameras) {
          const errorText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            `Error: ${error.message}`,
            {
              fontSize: '14px',
              fill: '#ff6b6b',
              align: 'center',
              wordWrap: { width: this.cameras.main.width - 40 }
            }
          );
          errorText.setOrigin(0.5);
        } else {
          console.error('Scene not properly initialized for error display');
        }
      }
    }
    
    // Basic game configuration
    const config = {
      type: Phaser.AUTO,
      width: Math.min(containerRect.width || 300, container.parentElement.offsetWidth),
      height: containerRect.height || 300,
      parent: this.containerId,
      backgroundColor: '#2c3e50',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      render: {
        pixelArt: self.pixelArt
      },
      plugins: {
        global: [
          {
            key: uniquePluginKey,
            plugin: window.PsdToPhaserPlugin,
            start: true,
            mapping: "P2P",
            data: {
              debug: {
                console: true,
                shape: false,
                label: false
              }
            }
          }
        ]
      },
      scene: ExampleScene
    };
    
    this.game = new Phaser.Game(config);
  }
  
  matchEditorHeight() {
    const phaserContainer = document.getElementById(this.containerId);
    const editorElement = document.getElementById(this.editorId);
    
    if (phaserContainer && editorElement && this.editor) {
      const phaserHeight = phaserContainer.offsetHeight || 300;
      editorElement.style.height = `${phaserHeight}px`;
      this.editor.resize();
    }
  }
  
  async loadLayerStructure() {
    const layerContainer = document.getElementById(`layers-${this.psdName}`);
    const psdPath = layerContainer.getAttribute('data-psd-path');
    
    try {
      const response = await fetch(`/${psdPath}/data.json`);
      if (!response.ok) {
        throw new Error(`Failed to load layer data: ${response.status}`);
      }
      
      const data = await response.json();
      const layerHtml = this.renderLayerStructure(data.layers);
      layerContainer.innerHTML = layerHtml;
    } catch (error) {
      console.error('Error loading layer structure:', error);
      layerContainer.innerHTML = `<p class="text-muted">Could not load layer structure</p>`;
    }
  }
  
  renderLayerStructure(layers) {
    if (!layers || layers.length === 0) {
      return '<p class="text-muted">No layers found</p>';
    }
    
    let html = '<ul>';
    layers.forEach(layer => {
      html += this.renderLayer(layer);
    });
    html += '</ul>';
    return html;
  }
  
  renderLayer(layer) {
    const originalName = this.reconstructOriginalName(layer);
    const categoryClass = `layer-${layer.category || 'unknown'}`;
    let html = `<li class="${categoryClass}">`;
    
    // Display reconstructed original layer name with pipe structure
    html += `<span class="layer-name">${originalName}</span>`;
    
    // Render children if this is a group
    if (layer.children && layer.children.length > 0) {
      html += '<ul>';
      layer.children.forEach(child => {
        html += this.renderLayer(child);
      });
      html += '</ul>';
    }
    
    html += '</li>';
    return html;
  }
  
  reconstructOriginalName(layer) {
    // Map data.json categories back to psd-to-json category letters
    const categoryMap = {
      'group': 'G',
      'sprite': 'S', 
      'tile': 'T',
      'text': 'T', // Could be text, but T is used for Tile in psd-to-json
      'point': 'P',
      'zone': 'Z'
    };
    
    const categoryLetter = categoryMap[layer.category] || 'S';
    const categoryName = {
      'G': 'Group',
      'S': 'Sprite',
      'T': 'Tile',
      'P': 'Point',
      'Z': 'Zone'
    }[categoryLetter] || 'Unknown';
    
    // Reconstruct the original PSD layer name format
    let display = `<span class="layer-category">${categoryLetter}</span>`;
    display += ` | <span class="layer-actual-name">${layer.name}</span>`;
    
    // Add type info if we can infer it (animation, etc.)
    // This would need more sophisticated logic based on attributes or naming patterns
    
    return display;
  }
}

// Initialize interactive examples when the page loads
document.addEventListener('DOMContentLoaded', function() {
  const exampleButtons = document.querySelectorAll('.run-example');
  
  exampleButtons.forEach(button => {
    const psdName = button.getAttribute('data-name');
    const psdFilename = button.getAttribute('data-psd');
    
    new InteractiveExample(button, psdName, psdFilename);
  });
  
  // Handle window resize for responsive Phaser games
  window.addEventListener('resize', debounce(() => {
    document.querySelectorAll('.phaser-container canvas').forEach(canvas => {
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      
      if (canvas.game && canvas.game.scale) {
        canvas.game.scale.resize(rect.width, rect.height);
      }
    });
  }, 250));
});

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}