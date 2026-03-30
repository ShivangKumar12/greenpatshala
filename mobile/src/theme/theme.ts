// Theme configuration for UnchiUdaan Mobile App
// Green-themed design system with premium aesthetics

export const COLORS = {
    // Primary Green Palette
    primary: '#16A34A',
    primaryDark: '#15803D',
    primaryDarker: '#166534',
    primaryLight: '#22C55E',
    primaryLighter: '#4ADE80',
    primaryBg: '#DCFCE7',
    primaryBgLight: '#F0FDF4',

    // Accent
    accent: '#059669',
    accentLight: '#34D399',

    // Backgrounds
    background: '#F0FDF4',
    surface: '#FFFFFF',
    surfaceAlt: '#F8FAF9',
    card: '#FFFFFF',

    // Text
    text: '#1A1A2E',
    textDark: '#0F172A',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    textWhite: '#FFFFFF',
    textOnPrimary: '#FFFFFF',

    // Status
    success: '#16A34A',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Neutrals
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    divider: '#E5E7EB',
    disabled: '#D1D5DB',
    placeholder: '#9CA3AF',
    overlay: 'rgba(0,0,0,0.5)',
    shadow: 'rgba(0,0,0,0.08)',

    // Gradients (start, end)
    gradientPrimary: ['#16A34A', '#059669'] as const,
    gradientDark: ['#15803D', '#166534'] as const,
    gradientLight: ['#DCFCE7', '#F0FDF4'] as const,
    gradientAccent: ['#22C55E', '#16A34A'] as const,
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
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
    },
    weights: {
        light: '300' as const,
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
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
};

export const RADIUS = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
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
    green: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 6,
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
};
