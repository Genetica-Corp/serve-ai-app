/**
 * Font Usage Guide for Serve AI App
 * 
 * This guide provides recommendations for using the three font families:
 * - Roboto: Primary font for body text and general UI
 * - Open Sans: Secondary font for UI elements and buttons
 * - Lato: Display font for headings and emphasis
 */

import { Theme } from './index';

export const FontStyles = {
  // Headings - Using Lato for impact
  h1: {
    fontFamily: Theme.typography.fontFamily.lato.black,
    fontSize: Theme.typography.fontSize['5xl'],
    lineHeight: Theme.typography.fontSize['5xl'] * Theme.typography.lineHeight.tight,
  },
  h2: {
    fontFamily: Theme.typography.fontFamily.lato.bold,
    fontSize: Theme.typography.fontSize['4xl'],
    lineHeight: Theme.typography.fontSize['4xl'] * Theme.typography.lineHeight.tight,
  },
  h3: {
    fontFamily: Theme.typography.fontFamily.lato.bold,
    fontSize: Theme.typography.fontSize['3xl'],
    lineHeight: Theme.typography.fontSize['3xl'] * Theme.typography.lineHeight.tight,
  },
  h4: {
    fontFamily: Theme.typography.fontFamily.openSans.bold,
    fontSize: Theme.typography.fontSize['2xl'],
    lineHeight: Theme.typography.fontSize['2xl'] * Theme.typography.lineHeight.normal,
  },
  h5: {
    fontFamily: Theme.typography.fontFamily.openSans.semibold,
    fontSize: Theme.typography.fontSize.xl,
    lineHeight: Theme.typography.fontSize.xl * Theme.typography.lineHeight.normal,
  },
  h6: {
    fontFamily: Theme.typography.fontFamily.openSans.semibold,
    fontSize: Theme.typography.fontSize.lg,
    lineHeight: Theme.typography.fontSize.lg * Theme.typography.lineHeight.normal,
  },

  // Body text - Using Roboto for readability
  bodyLarge: {
    fontFamily: Theme.typography.fontFamily.roboto.regular,
    fontSize: Theme.typography.fontSize.lg,
    lineHeight: Theme.typography.fontSize.lg * Theme.typography.lineHeight.relaxed,
  },
  body: {
    fontFamily: Theme.typography.fontFamily.roboto.regular,
    fontSize: Theme.typography.fontSize.base,
    lineHeight: Theme.typography.fontSize.base * Theme.typography.lineHeight.normal,
  },
  bodySmall: {
    fontFamily: Theme.typography.fontFamily.roboto.regular,
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
  },

  // UI Elements - Using Open Sans for clarity
  button: {
    fontFamily: Theme.typography.fontFamily.openSans.semibold,
    fontSize: Theme.typography.fontSize.base,
    lineHeight: Theme.typography.fontSize.base * Theme.typography.lineHeight.tight,
  },
  buttonSmall: {
    fontFamily: Theme.typography.fontFamily.openSans.semibold,
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: Theme.typography.fontSize.sm * Theme.typography.lineHeight.tight,
  },
  label: {
    fontFamily: Theme.typography.fontFamily.openSans.semibold,
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
  },
  caption: {
    fontFamily: Theme.typography.fontFamily.roboto.regular,
    fontSize: Theme.typography.fontSize.xs,
    lineHeight: Theme.typography.fontSize.xs * Theme.typography.lineHeight.normal,
  },

  // Special use cases
  alertTitle: {
    fontFamily: Theme.typography.fontFamily.openSans.bold,
    fontSize: Theme.typography.fontSize.lg,
    lineHeight: Theme.typography.fontSize.lg * Theme.typography.lineHeight.tight,
  },
  alertBody: {
    fontFamily: Theme.typography.fontFamily.roboto.regular,
    fontSize: Theme.typography.fontSize.base,
    lineHeight: Theme.typography.fontSize.base * Theme.typography.lineHeight.normal,
  },
  metricValue: {
    fontFamily: Theme.typography.fontFamily.lato.bold,
    fontSize: Theme.typography.fontSize['3xl'],
    lineHeight: Theme.typography.fontSize['3xl'] * Theme.typography.lineHeight.tight,
  },
  metricLabel: {
    fontFamily: Theme.typography.fontFamily.roboto.medium,
    fontSize: Theme.typography.fontSize.sm,
    lineHeight: Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
  },
};

// Usage examples:
/*
// In a component:
import { FontStyles } from '../theme/fontGuide';

// For a heading
<Text style={FontStyles.h1}>Welcome to Serve AI</Text>

// For body text
<Text style={FontStyles.body}>This is regular body text using Roboto.</Text>

// For a button
<Text style={FontStyles.button}>Click Me</Text>

// Combining with other styles
<Text style={[FontStyles.h3, { color: Theme.colors.primary.DEFAULT }]}>
  Styled Heading
</Text>
*/