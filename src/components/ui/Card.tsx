import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Theme } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  variant?: 'default' | 'bordered' | 'gradient';
  gradientColors?: string[];
  testID?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevated = true,
  variant = 'default',
  gradientColors,
  testID,
}) => {
  const animatedValue = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(animatedValue, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'bordered':
        return {
          borderWidth: 1,
          borderColor: Theme.colors.neutral[200],
          ...Theme.shadows.none,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          overflow: 'hidden',
        };
      default:
        return elevated ? Theme.shadows.md : Theme.shadows.sm;
    }
  };

  const content = (
    <View style={[styles.card, getVariantStyles(), style]}>
      {variant === 'gradient' && (
        <View style={styles.gradientOverlay} />
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        testID={testID}
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={{
            transform: [{ scale: animatedValue }],
          }}
        >
          {content}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return <View testID={testID}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginVertical: Theme.spacing.xs,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Theme.colors.primary[50],
    opacity: 0.05,
  },
});