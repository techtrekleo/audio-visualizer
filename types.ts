
export enum VisualizationType {
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
}

export enum ColorPaletteType {
    DEFAULT = 'Default',
    CYBERPUNK = 'Cyberpunk',
    SUNSET = 'Sunset',
    GLACIER = 'Glacier',
    LAVA = 'Lava',
}

export type Palette = {
    name: ColorPaletteType;
    primary: string;
    secondary: string;
    accent: string;
    backgroundGlow: string;
    hueRange: [number, number];
};
