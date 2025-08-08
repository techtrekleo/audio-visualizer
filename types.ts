
export enum VisualizationType {
    MONSTERCAT = 'Monstercat',
    NEBULA_WAVE = 'Nebula Wave',
    LUMINOUS_WAVE = 'Luminous Wave',
    FUSION = 'Fusion',
    TECH_WAVE = 'Tech Wave',
    STELLAR_CORE = 'Stellar Core',
    RADIAL_BARS = 'Radial Bars',
}

export enum FontType {
    POPPINS = 'Poppins',
    ORBITRON = 'Orbitron',
    LOBSTER = 'Lobster',
    BUNGEE = 'Bungee',
    PRESS_START_2P = 'Press Start 2P',
    PACIFICO = 'Pacifico',
    DANCING_SCRIPT = 'Dancing Script',
}

export enum BackgroundColorType {
    BLACK = 'Black',
    GREEN = 'Green',
    WHITE = 'White',
    TRANSPARENT = 'Transparent',
}

export enum ColorPaletteType {
    DEFAULT = 'Default',
    CYBERPUNK = 'Cyberpunk',
    SUNSET = 'Sunset',
    GLACIER = 'Glacier',
    LAVA = 'Lava',
    MIDNIGHT = 'Midnight',
    WHITE = 'White',
}

export enum TextEffectType {
    SHADOW = 'Shadow',
    STROKE = 'Stroke',
    NONE = 'None',
}

export enum Resolution {
    P720 = '720p (1280x720)',
    P1080 = '1080p (1920x1080)',
    P4K = '4K (3840x2160)',
    CURRENT = 'Fit to Screen',
}

export type Palette = {
    name: ColorPaletteType;
    primary: string;
    secondary: string;
    accent: string;
    backgroundGlow: string;
    hueRange: [number, number];
};