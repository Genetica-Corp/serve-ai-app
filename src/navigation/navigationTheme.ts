import { Theme } from '../theme';

export const navigationTheme = {
  dark: false,
  colors: {
    primary: Theme.colors.primary.DEFAULT,
    background: Theme.colors.white,
    card: Theme.colors.white,
    text: Theme.colors.neutral[900],
    border: Theme.colors.neutral[200],
    notification: Theme.colors.secondary.DEFAULT,
  },
};

export const screenOptions = {
  headerStyle: {
    backgroundColor: Theme.colors.white,
    borderBottomColor: Theme.colors.neutral[200],
    borderBottomWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
    height: 60,
  },
  headerTintColor: Theme.colors.neutral[900],
  headerTitleStyle: {
    fontFamily: Theme.typography.fontFamily.semibold,
    fontSize: Theme.typography.fontSize.lg,
  },
  headerBackTitleStyle: {
    fontFamily: Theme.typography.fontFamily.regular,
    fontSize: Theme.typography.fontSize.sm,
  },
  cardStyle: {
    backgroundColor: Theme.colors.white,
  },
  cardStyleInterpolator: ({ current: { progress } }: any) => ({
    cardStyle: {
      opacity: progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      }),
    },
  }),
};

export const tabBarOptions = {
  activeTintColor: Theme.colors.primary.DEFAULT,
  inactiveTintColor: Theme.colors.neutral[500],
  style: {
    backgroundColor: Theme.colors.white,
    borderTopColor: Theme.colors.neutral[200],
    borderTopWidth: 1,
    paddingTop: Theme.spacing.sm,
    paddingBottom: Theme.spacing.sm,
    height: 80,
    ...Theme.shadows.sm,
  },
  labelStyle: {
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.medium,
  },
  iconStyle: {
    marginBottom: -4,
  },
};