import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Theme } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
}) => {
  const isDisabled = disabled || loading;

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          button: {
            paddingVertical: Theme.spacing.xs,
            paddingHorizontal: Theme.spacing.md,
            minHeight: 32,
          },
          text: {
            fontSize: Theme.typography.fontSize.sm,
          },
        };
      case 'lg':
        return {
          button: {
            paddingVertical: Theme.spacing.md,
            paddingHorizontal: Theme.spacing.xl,
            minHeight: 56,
          },
          text: {
            fontSize: Theme.typography.fontSize.lg,
          },
        };
      default:
        return {
          button: {
            paddingVertical: Theme.spacing.sm + 2,
            paddingHorizontal: Theme.spacing.lg,
            minHeight: 44,
          },
          text: {
            fontSize: Theme.typography.fontSize.base,
          },
        };
    }
  };

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          button: {
            backgroundColor: Theme.colors.white,
            borderWidth: 1,
            borderColor: Theme.colors.neutral[200],
          },
          text: {
            color: Theme.colors.neutral[900],
          },
        };
      case 'ghost':
        return {
          button: {
            backgroundColor: 'transparent',
          },
          text: {
            color: Theme.colors.neutral[700],
          },
        };
      case 'danger':
        return {
          button: {
            backgroundColor: Theme.colors.error,
          },
          text: {
            color: Theme.colors.white,
          },
        };
      default:
        return {
          button: {
            backgroundColor: Theme.colors.neutral[900],
          },
          text: {
            color: Theme.colors.white,
          },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        sizeStyles.button,
        variantStyles.button,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variantStyles.text.color}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && (
              <Icon
                name={icon}
                size={sizeStyles.text.fontSize + 4}
                color={variantStyles.text.color}
                style={styles.iconLeft}
              />
            )}
            <Text
              style={[
                styles.text,
                sizeStyles.text,
                variantStyles.text,
                isDisabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <Icon
                name={icon}
                size={sizeStyles.text.fontSize + 4}
                color={variantStyles.text.color}
                style={styles.iconRight}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Theme.typography.fontFamily.medium,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
  iconLeft: {
    marginRight: Theme.spacing.xs,
  },
  iconRight: {
    marginLeft: Theme.spacing.xs,
  },
});