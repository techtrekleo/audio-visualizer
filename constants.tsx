import { ColorPaletteType, Palette, Resolution } from './types';

export const ICON_PATHS = {
    UPLOAD: 'M9.25 15.5V11.375L7.25 13.375L6 12L10 8L14 12L12.75 13.375L10.75 11.375V15.5H9.25ZM5.625 20C5.175 20 4.79375 19.8562 4.48125 19.5687C4.16875 19.2812 4.0125 18.9187 4.0125 18.4812L4 16.5H5.5V18.5H14.5V16.5H16V18.4812C16 18.9187 15.8438 19.2812 15.5313 19.5687C15.2188 19.8562 14.8375 20 14.375 20H5.625Z',
    PLAY: 'M8 19V5L19 12L8 19Z',
    PAUSE: 'M6 19H10V5H6V19ZM14 5V19H18V5H14Z',
    RECORD_START: 'M12 12m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0',
    RECORD_STOP: 'M10 10h4v4h-4z',
    DOWNLOAD: 'M5 20H19V18H5V20ZM19 9H15V3H9V9H5L12 16L19 9Z',
    MUSIC_NOTE: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z'
};

export const RESOLUTION_MAP: Record<Resolution, {width: number, height: number} | null> = {
    [Resolution.P720]: { width: 1280, height: 720 },
    [Resolution.P1080]: { width: 1920, height: 1080 },
    [Resolution.P4K]: { width: 3840, height: 2160 },
    [Resolution.CURRENT]: null,
};

export const COLOR_PALETTES: Record<ColorPaletteType, Palette> = {
    [ColorPaletteType.DEFAULT]: {
        name: ColorPaletteType.DEFAULT,
        primary: '#67E8F9', // Cyan
        secondary: '#F472B6', // Pink
        accent: '#FFFFFF',
        backgroundGlow: 'rgba(10, 80, 150, 0.2)',
        hueRange: [180, 300], // Cyan to Magenta
    },
    [ColorPaletteType.CYBERPUNK]: {
        name: ColorPaletteType.CYBERPUNK,
        primary: '#00F0FF', // Bright Cyan
        secondary: '#FF00C7', // Hot Pink
        accent: '#F5F5F5',
        backgroundGlow: 'rgba(80, 10, 150, 0.25)',
        hueRange: [185, 310],
    },
    [ColorPaletteType.SUNSET]: {
        name: ColorPaletteType.SUNSET,
        primary: '#FFD700', // Gold
        secondary: '#FF8C00', // Dark Orange
        accent: '#FF4500', // OrangeRed
        backgroundGlow: 'rgba(150, 50, 10, 0.2)',
        hueRange: [25, 60], // Orange to Yellow
    },
    [ColorPaletteType.GLACIER]: {
        name: ColorPaletteType.GLACIER,
        primary: '#FFFFFF',
        secondary: '#ADD8E6', // Light Blue
        accent: '#87CEEB', // Sky Blue
        backgroundGlow: 'rgba(100, 120, 180, 0.15)',
        hueRange: [180, 240], // Cyan to Blue
    },
    [ColorPaletteType.LAVA]: {
        name: ColorPaletteType.LAVA,
        primary: '#FF4500', // OrangeRed
        secondary: '#FF0000', // Red
        accent: '#FFFF00', // Yellow
        backgroundGlow: 'rgba(180, 20, 0, 0.3)',
        hueRange: [0, 50], // Red to Orange
    },
    [ColorPaletteType.MIDNIGHT]: {
        name: ColorPaletteType.MIDNIGHT,
        primary: '#581C87', // Deep Purple
        secondary: '#1E40AF', // Dark Blue
        accent: '#E5E7EB',   // Light Gray
        backgroundGlow: 'rgba(40, 40, 80, 0.2)',
        hueRange: [240, 280], // Blue to Purple
    },
};