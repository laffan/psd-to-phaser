export interface SpriteData {
    name: string;
    type: 'simple' | 'atlas' | 'spritesheet' | 'animation' | 'merged';
    x: number;
    y: number;
    width: number;
    height: number;
    layerOrder: number;
    filePath?: string;
    children?: SpriteData[];
    atlas?: any;
    frame_width?: number;
    frame_height?: number;
    frame_count?: number;
    columns?: number;
    rows?: number;
    placement?: Array<{
        frame: number | string;
        x: number;
        y: number;
        layerOrder: number;
        instanceName: string;
        [key: string]: any;
    }>;
    [key: string]: any;
}

export interface AnimationConfig {
    key: string;
    frames: Phaser.Types.Animations.GenerateFrameNumbers;
    frameRate: number;
    repeat?: number;
    repeatDelay?: number;
    yoyo?: boolean;
    duration?: number;
    [key: string]: any;
}
