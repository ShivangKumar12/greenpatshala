// Theme configuration for GreenPatshala Mobile App
// Matches web CSS theme exactly: --primary: 148 76% 23%
// Font: Inter / Plus Jakarta Sans

export const COLORS = {
    // Primary Green Palette (web: hsl(148, 76%, 23%) = #0E6B31)
    primary: '#0E6B31',       // hsl(148, 76%, 23%) - exact web match
    primaryDark: '#0A5526',   // hsl(148, 76%, 18%)
    primaryDarker: '#084A20', // hsl(148, 76%, 15%)
    primaryLight: '#16A34A',  // hsl(142, 71%, 35%)
    primaryLighter: '#22C55E',// hsl(142, 71%, 45%)
    primaryBg: '#DCFCE7',     // hsl(140, 82%, 92%)
    primaryBgLight: '#F0FDF4',// hsl(138, 76%, 97%)

    // Accent (web chart-2: hsl(94, 48%, 50%))
    accent: '#6BAF3D',        // hsl(94, 48%, 46%)
    accentLight: '#86CB56',   // hsl(94, 48%, 55%)

    // Backgrounds (web: --background: 220 30% 98%)
    background: '#F8F9FC',    // hsl(220, 30%, 98%)
    surface: '#FFFFFF',       // hsl(0, 0%, 100%) - card
    surfaceAlt: '#F1F3F9',    // hsl(220, 25%, 96%) - sidebar
    card: '#FFFFFF',

    // Text (web: --foreground: 220 20% 10%)
    text: '#161B26',          // hsl(220, 20%, 10%)
    textDark: '#0F172A',      // slate-900
    textSecondary: '#5C6370', // hsl(220, 10%, 40%) - muted-foreground
    textLight: '#9CA3AF',     // gray-400
    textWhite: '#FFFFFF',
    textOnPrimary: '#FFFFFF',
    placeholder: '#9CA3AF',

    // Status
    success: '#16A34A',       // green-600
    error: '#B91C1C',         // hsl(0, 84%, 45%) - web destructive
    errorLight: '#FEE2E2',
    warning: '#F59E0B',       // amber-500
    warningLight: '#FEF3C7',
    info: '#3B82F6',          // blue-500
    infoLight: '#DBEAFE',

    // Chart colors matching web exactly
    chart1: '#0E6B31',        // hsl(148, 76%, 23%)
    chart2: '#6BAF3D',        // hsl(94, 48%, 50%)
    chart3: '#8B5CF6',        // hsl(280, 85%, 55%)
    chart4: '#F59E0B',        // hsl(35, 90%, 50%)
    chart5: '#EC4899',        // hsl(340, 85%, 50%)

    // Neutrals (web: --border: 220 20% 90%)
    border: '#E2E5EB',        // hsl(220, 20%, 90%)
    borderLight: '#ECEEF2',   // hsl(220, 15%, 94%) - muted
    divider: '#E2E5EB',
    disabled: '#D1D5DB',
    overlay: 'rgba(0,0,0,0.5)',
    shadow: 'rgba(0,0,0,0.08)',

    // Web secondaries
    secondary: '#E8EAF0',     // hsl(220, 20%, 92%)
    secondaryForeground: '#161B26',
    muted: '#EDEFF3',         // hsl(220, 15%, 94%)
    mutedForeground: '#5C6370',
    input: '#C2C7D0',         // hsl(220, 20%, 80%)

    // Gradients (start, end)
    gradientPrimary: ['#0E6B31', '#059669'] as const,
    gradientDark: ['#0A5526', '#084A20'] as const,
    gradientLight: ['#DCFCE7', '#F0FDF4'] as const,
    gradientAccent: ['#16A34A', '#0E6B31'] as const,
    gradientGreen: ['#0E6B31', '#6BAF3D'] as const, // web gradient-text-green
    gradientBanner: ['#0E6B31', '#16A34A', '#22C55E'] as const,
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    // Matching web: --font-sans: 'Inter', 'Plus Jakarta Sans', sans-serif
    families: {
        sans: 'System', // Will use Inter when loaded via expo-font
        serif: 'System',
        mono: 'System',
    },
    sizes: {
        xs: 10,
        sm: 12,
        md: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 44,
    },
    weights: {
        light: '300' as const,
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },
    lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
};

export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 999,
};

export const SHADOWS = {
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 6,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
    },
    green: {
        shadowColor: '#0E6B31',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
    },
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 4,
    },
};

export const ANIMATION = {
    fast: 200,
    normal: 300,
    slow: 500,
    spring: {
        damping: 15,
        stiffness: 150,
        mass: 1,
    },
    springBouncy: {
        damping: 10,
        stiffness: 120,
        mass: 0.8,
    },
    springGentle: {
        damping: 20,
        stiffness: 100,
        mass: 1,
    },
};
