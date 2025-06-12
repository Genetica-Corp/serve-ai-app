// Serve AI App Theme Configuration
// Based on serve-ai-marketing design system

export const Colors = {
  // Brand Colors
  primary: {
    DEFAULT: '#123047', // serve-dark
    50: '#E8EBF0',
    100: '#BDC6D5',
    200: '#929FAF',
    300: '#677988',
    400: '#3C5261',
    500: '#123047',
    600: '#0F2639',
    700: '#0C1C2B',
    800: '#09131D',
    900: '#040A0E',
  },
  
  secondary: {
    DEFAULT: '#2E98A4', // serve-teal
    50: '#E9F5F6',
    100: '#C8E6E9',
    200: '#A7D7DC',
    300: '#86C8CF',
    400: '#65B9C2',
    500: '#2E98A4',
    600: '#257A83',
    700: '#1C5C62',
    800: '#133E41',
    900: '#091E21',
  },
  
  // Neutral Colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Functional Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Base Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const Typography = {
  fontFamily: {
    // Primary font family (Roboto for body text)
    regular: 'Roboto_400Regular',
    medium: 'Roboto_500Medium',
    semibold: 'OpenSans_600SemiBold',
    bold: 'Lato_700Bold',
    
    // Extended font options
    roboto: {
      regular: 'Roboto_400Regular',
      medium: 'Roboto_500Medium',
      bold: 'Roboto_700Bold',
    },
    openSans: {
      regular: 'OpenSans_400Regular',
      semibold: 'OpenSans_600SemiBold',
      bold: 'OpenSans_700Bold',
    },
    lato: {
      regular: 'Lato_400Regular',
      bold: 'Lato_700Bold',
      black: 'Lato_900Black',
    },
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  full: 9999,
};

export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  
  // Component-specific styles
  components: {
    button: {
      primary: {
        backgroundColor: Colors.neutral[900],
        color: Colors.white,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.medium,
      },
      secondary: {
        backgroundColor: Colors.white,
        color: Colors.neutral[900],
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.neutral[200],
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.medium,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: Colors.neutral[700],
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
      },
    },
    
    card: {
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: Colors.neutral[200],
      padding: Spacing.lg,
      ...Shadows.sm,
    },
    
    input: {
      backgroundColor: Colors.white,
      borderRadius: BorderRadius.md,
      borderWidth: 1,
      borderColor: Colors.neutral[200],
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      fontSize: Typography.fontSize.base,
      fontFamily: Typography.fontFamily.regular,
      color: Colors.neutral[900],
      placeholderColor: Colors.neutral[400],
      focusBorderColor: Colors.secondary.DEFAULT,
    },
    
    header: {
      backgroundColor: Colors.white,
      borderBottomWidth: 1,
      borderBottomColor: Colors.neutral[200],
      height: 56,
      ...Shadows.sm,
    },
    
    tabBar: {
      backgroundColor: Colors.white,
      borderTopWidth: 1,
      borderTopColor: Colors.neutral[200],
      activeColor: Colors.primary.DEFAULT,
      inactiveColor: Colors.neutral[500],
    },
  },
  
  // Gradient utilities
  gradients: {
    primary: ['#123047', '#0F2639'], // Dark gradient
    secondary: ['#2E98A4', '#257A83'], // Teal gradient
    light: ['#F9FAFB', '#FFFFFF'], // Light gradient
    brandText: ['#2E98A4', '#123047'], // For text gradients
  },
  
  // Animation durations
  animations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

// Helper function to get theme colors with opacity
export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

// Export default theme
export default Theme;