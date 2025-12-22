import PsdToPhaserPlugin from '../../../PsdToPhaser';

// Type for game objects that support visibility
type VisibleGameObject = Phaser.GameObjects.GameObject & { setVisible(value: boolean): void };

interface ButtonImages {
  normal: VisibleGameObject;
  hover?: VisibleGameObject;
  active?: VisibleGameObject;
}

interface ButtonCallbacks {
  click?: (button: Phaser.GameObjects.GameObject, eventData: any, pointer: Phaser.Input.Pointer) => void;
  mouseOver?: (button: Phaser.GameObjects.GameObject, eventData: any, pointer: Phaser.Input.Pointer) => void;
  mouseOut?: (button: Phaser.GameObjects.GameObject, eventData: any, pointer: Phaser.Input.Pointer) => void;
  mousePress?: (button: Phaser.GameObjects.GameObject, eventData: any, pointer: Phaser.Input.Pointer) => void;
}

type ButtonInput =
  | [VisibleGameObject, (button: Phaser.GameObjects.GameObject, eventData: any, pointer: Phaser.Input.Pointer) => void]
  | [VisibleGameObject, VisibleGameObject, (button: Phaser.GameObjects.GameObject, eventData: any, pointer: Phaser.Input.Pointer) => void]
  | [ButtonImages, ButtonCallbacks];

export function button(_plugin: PsdToPhaserPlugin) {
  return function(input: ButtonInput) {
    let images: ButtonImages;
    let callbacks: ButtonCallbacks;

    // Parse input into standardized config
    if (Array.isArray(input)) {
      if (input.length === 2) {
        if (typeof input[1] === 'function') {
          // [normalImage, clickCallback]
          images = { normal: input[0] as VisibleGameObject };
          callbacks = { click: input[1] };
        } else {
          // [images, callbacks] object form
          images = input[0] as ButtonImages;
          callbacks = input[1] as ButtonCallbacks;
        }
      } else if (input.length === 3) {
        // [normalImage, hoverImage, clickCallback]
        images = { 
          normal: input[0], 
          hover: input[1] 
        };
        callbacks = { click: input[2] };
      } else {
        console.error('Button: Invalid array format');
        return;
      }
    } else {
      console.error('Button: Invalid input format');
      return;
    }

    // Validate we have at least a normal image
    if (!images.normal) {
      console.error('Button requires at least a normal image');
      return;
    }

    // Get interactive target from the normal image
    let interactiveTarget = images.normal;
    let originalTarget = images.normal;
    
    // Handle P2P placed objects (Groups/Containers)
    if (originalTarget instanceof Phaser.GameObjects.Group) {
      const children = originalTarget.getChildren();
      if (children.length === 0) {
        console.error('Button target group is empty');
        return;
      }
      interactiveTarget = children[0] as VisibleGameObject;
    } else if (originalTarget instanceof Phaser.GameObjects.Container) {
      if (originalTarget.list.length === 0) {
        console.error('Button target container is empty');
        return;
      }
      interactiveTarget = originalTarget.list[0] as VisibleGameObject;
    }

    const scene = interactiveTarget.scene;

    if (!scene) {
      console.error('Button target must have a valid scene');
      return;
    }

    // Verify target can be made interactive
    if (typeof (interactiveTarget as any).setInteractive !== 'function') {
      console.error('Button target does not support interaction:', interactiveTarget.constructor.name);
      return;
    }

    // Internal state tracking
    let currentState: 'normal' | 'hover' | 'active' = 'normal';

    // Create invisible interactive area above all button states
    // Get the normal image's bounds for proper positioning
    const normalImage = interactiveTarget;
    let zoneX, zoneY, zoneWidth, zoneHeight;
    
    // Try to get bounds first, fallback to position/size properties
    if (typeof (normalImage as any).getBounds === 'function') {
      const bounds = (normalImage as any).getBounds();
      zoneX = bounds.centerX || (bounds.x + bounds.width / 2);
      zoneY = bounds.centerY || (bounds.y + bounds.height / 2);
      zoneWidth = bounds.width;
      zoneHeight = bounds.height;
    } else {
      zoneX = (normalImage as any).x || 0;
      zoneY = (normalImage as any).y || 0;
      zoneWidth = (normalImage as any).width || (normalImage as any).displayWidth || 100;
      zoneHeight = (normalImage as any).height || (normalImage as any).displayHeight || 100;
    }

    // Use a rectangle instead of zone since zones don't work properly
    const interactiveRect = scene.add.rectangle(zoneX, zoneY, zoneWidth, zoneHeight, 0x000000, 0);
    interactiveRect.setInteractive();
    
    // Set extremely high depth to ensure it's on top
    interactiveRect.setDepth(Number.MAX_SAFE_INTEGER);
    
    // Make it invisible (alpha 0) but keep it interactive
    interactiveRect.setVisible(true); // Keep visible but transparent

    // Initialize all images - hide hover and active by default (HTML/CSS behavior)
    if (images.normal) images.normal.setVisible(true);
    if (images.hover) images.hover.setVisible(false);
    if (images.active) images.active.setVisible(false);

    // Show/hide images based on state
    function showState(stateName: 'normal' | 'hover' | 'active') {
      // Hide all images first
      if (images.normal) images.normal.setVisible(false);
      if (images.hover) images.hover.setVisible(false);
      if (images.active) images.active.setVisible(false);

      // Show the appropriate image
      const targetImage = images[stateName];
      if (targetImage) {
        targetImage.setVisible(true);
      } else {
        // Fallback to normal if state image doesn't exist
        if (images.normal) {
          images.normal.setVisible(true);
        }
      }
      
      currentState = stateName;
    }

    // Check if mobile device
    const isMobile = scene.sys.game.device.input.touch;

    // Always set up click events
    interactiveRect.on('pointerdown', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: any) => {
      if (images.active) {
        showState('active');
      }
      if (callbacks.mousePress) {
        callbacks.mousePress(originalTarget, { localX, localY, event }, pointer);
      }
    });

    interactiveRect.on('pointerup', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: any) => {
      // If we had an active state, return to hover/normal based on mouse position
      // If no active state, maintain current state (should be hover if mouse is over)
      if (images.active) {
        if (!isMobile && images.hover && (interactiveRect.input as any)?.isOver) {
          showState('hover');
        } else {
          showState('normal');
        }
      }
      // If no active state, don't change the current state - leave it as hover

      // Execute click callback
      if (callbacks.click) {
        callbacks.click(originalTarget, { localX, localY, event }, pointer);
      }
    });

    // Desktop hover interactions using invisible rectangle
    if (!isMobile && images.hover) {
      interactiveRect.on('pointerover', (pointer: Phaser.Input.Pointer, localX: number, localY: number, event: any) => {
        showState('hover');
        if (callbacks.mouseOver) {
          callbacks.mouseOver(originalTarget, { localX, localY, event }, pointer);
        }
      });

      interactiveRect.on('pointerout', (pointer: Phaser.Input.Pointer, event: any) => {
        if (currentState !== 'active') {
          showState('normal');
          if (callbacks.mouseOut) {
            callbacks.mouseOut(originalTarget, { event }, pointer);
          }
        }
      });
    }

    // Initialize with normal state (initial visibility already set above)
    currentState = 'normal';

    // Return cleanup function
    return {
      destroy: () => {
        interactiveRect.off('pointerover');
        interactiveRect.off('pointerout');
        interactiveRect.off('pointerdown');
        interactiveRect.off('pointerup');
        interactiveRect.destroy();
      },
      getCurrentState: () => currentState,
      showState: (stateName: 'normal' | 'hover' | 'active') => {
        showState(stateName);
      }
    };
  };
}