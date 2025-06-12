import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Theme, withOpacity } from '../../theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  icon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  testID?: string;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: Theme.animations.fast,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: Theme.animations.fast,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error ? Theme.colors.error : Theme.colors.neutral[200],
      error ? Theme.colors.error : Theme.colors.secondary.DEFAULT,
    ],
  });

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>
          {label}
        </Text>
      )}
      
      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor },
          !editable && styles.inputContainerDisabled,
        ]}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            color={isFocused ? Theme.colors.secondary.DEFAULT : Theme.colors.neutral[400]}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Theme.colors.neutral[400]}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
            !editable && styles.inputDisabled,
          ]}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconButton}
          >
            <Icon
              name={rightIcon}
              size={20}
              color={Theme.colors.neutral[400]}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={14} color={Theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.neutral[700],
    marginBottom: Theme.spacing.xs,
  },
  labelError: {
    color: Theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Theme.spacing.md,
    minHeight: 44,
  },
  inputContainerDisabled: {
    backgroundColor: Theme.colors.neutral[50],
  },
  input: {
    flex: 1,
    fontSize: Theme.typography.fontSize.base,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[900],
    paddingVertical: Theme.spacing.sm,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputDisabled: {
    color: Theme.colors.neutral[500],
  },
  leftIcon: {
    marginRight: Theme.spacing.sm,
  },
  rightIconButton: {
    marginLeft: Theme.spacing.sm,
    padding: Theme.spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  errorText: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.error,
    marginLeft: Theme.spacing.xs,
  },
});