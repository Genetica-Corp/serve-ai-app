import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@/types';
import { Theme } from '../../theme';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>
        Authentication implementation will be added by the Authentication Agent
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.neutral[50],
  },
  title: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontFamily: Theme.typography.fontFamily.semibold,
    color: Theme.colors.neutral[900],
    marginBottom: Theme.spacing.md,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.base,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    textAlign: 'center',
  },
});

export default LoginScreen;