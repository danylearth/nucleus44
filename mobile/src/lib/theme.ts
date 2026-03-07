/**
 * Nucleus Design System — Colors, typography, spacing
 * Matched to the web app's aesthetic
 */

export const colors = {
    // Primary brand
    primary: '#0D9488',       // Teal-600 (matches web)
    primaryLight: '#14B8A6',  // Teal-500
    primaryDark: '#0F766E',   // Teal-700
    primaryBg: '#F0FDFA',     // Teal-50

    // Neutrals
    background: '#F9FAFB',    // Gray-50
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F4F6', // Gray-100
    border: '#E5E7EB',        // Gray-200
    borderLight: '#F3F4F6',   // Gray-100

    // Text
    textPrimary: '#111827',   // Gray-900
    textSecondary: '#6B7280', // Gray-500
    textTertiary: '#9CA3AF',  // Gray-400
    textInverse: '#FFFFFF',

    // Status
    success: '#10B981',       // Emerald-500
    successBg: '#ECFDF5',
    warning: '#F59E0B',       // Amber-500
    warningBg: '#FFFBEB',
    error: '#EF4444',         // Red-500
    errorBg: '#FEF2F2',
    info: '#3B82F6',          // Blue-500
    infoBg: '#EFF6FF',

    // Health score gradient
    healthGradientStart: '#0D9488',
    healthGradientEnd: '#06B6D4',

    // Dark accents
    dark: '#1F2937',          // Gray-800
    darkest: '#111827',       // Gray-900
};

export const fonts = {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
};

export const fontSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
};

export const shadows = {
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
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 5,
    },
};
