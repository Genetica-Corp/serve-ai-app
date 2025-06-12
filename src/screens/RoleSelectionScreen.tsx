import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useUser } from '../contexts/UserContext';
import UserService from '../services/UserService';
import { Theme } from '../theme';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const RoleSelectionScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login, setTeamMembers } = useUser();

  const handleRoleSelection = async (role: 'operator' | 'manager') => {
    try {
      let user;
      if (role === 'operator') {
        user = await UserService.loginAsOperator();
      } else {
        user = await UserService.loginAsStoreManager();
      }

      login(user);

      // Load team members if operator
      if (role === 'operator') {
        const members = await UserService.getTeamMembers(user.id);
        setTeamMembers(members);
      }

      // Navigate to appropriate dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/serve-ai-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Serve AI</Text>
          <Text style={styles.subtitle}>Restaurant Alert Management</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Select Your Role</Text>
          <Text style={styles.sectionDescription}>
            Choose how you want to view the dashboard
          </Text>

          <Card
            style={[styles.roleCard, styles.operatorCard]}
            onPress={() => handleRoleSelection('operator')}
          >
            <View style={styles.roleIconContainer}>
              <Ionicons name="people" size={48} color={Theme.colors.white} />
            </View>
            <Text style={styles.roleTitle}>Operator</Text>
            <Text style={styles.roleDescription}>
              Manage alerts and assign them to team members
            </Text>
            <View style={styles.roleFeatures}>
              <Text style={styles.featureItem}>• View all alerts</Text>
              <Text style={styles.featureItem}>• Assign to team members</Text>
              <Text style={styles.featureItem}>• Track assignments</Text>
              <Text style={styles.featureItem}>• Manage team</Text>
            </View>
            <Button
              title="Continue as Operator"
              onPress={() => handleRoleSelection('operator')}
              variant="secondary"
              size="md"
              style={{ marginTop: Theme.spacing.md, width: '100%' }}
            />
          </Card>

          <Card
            style={[styles.roleCard, styles.managerCard]}
            onPress={() => handleRoleSelection('manager')}
          >
            <View style={styles.roleIconContainer}>
              <Ionicons name="person" size={48} color={Theme.colors.white} />
            </View>
            <Text style={styles.roleTitle}>Store Manager</Text>
            <Text style={styles.roleDescription}>
              View and resolve alerts assigned to you
            </Text>
            <View style={styles.roleFeatures}>
              <Text style={styles.featureItem}>• View assigned alerts</Text>
              <Text style={styles.featureItem}>• Track cure steps</Text>
              <Text style={styles.featureItem}>• Add resolution notes</Text>
              <Text style={styles.featureItem}>• Mark as resolved</Text>
            </View>
            <Button
              title="Continue as Store Manager"
              onPress={() => handleRoleSelection('manager')}
              variant="secondary"
              size="md"
              style={{ marginTop: Theme.spacing.md, width: '100%' }}
            />
          </Card>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is a demo. In production, you would log in with your credentials.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.neutral[50],
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Theme.spacing['2xl'],
    paddingTop: Theme.spacing['3xl'],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Theme.spacing.md,
  },
  title: {
    fontSize: Theme.typography.fontSize['4xl'],
    fontFamily: Theme.typography.fontFamily.bold,
    color: Theme.colors.neutral[900],
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    marginTop: Theme.spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: Theme.typography.fontSize['2xl'],
    fontFamily: Theme.typography.fontFamily.semibold,
    color: Theme.colors.neutral[900],
    textAlign: 'center',
    marginBottom: Theme.spacing.sm,
  },
  sectionDescription: {
    fontSize: Theme.typography.fontSize.base,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  roleCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 0,
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.primary.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.md,
  },
  operatorCard: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.primary[100],
  },
  managerCard: {
    backgroundColor: Theme.colors.white,
    borderWidth: 1,
    borderColor: Theme.colors.secondary[100],
  },
  roleTitle: {
    fontSize: Theme.typography.fontSize.xl,
    fontFamily: Theme.typography.fontFamily.semibold,
    color: Theme.colors.neutral[900],
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  roleDescription: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[600],
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    lineHeight: Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
  },
  roleFeatures: {
    alignSelf: 'stretch',
    backgroundColor: Theme.colors.neutral[50],
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  featureItem: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[700],
    marginBottom: Theme.spacing.xs,
    lineHeight: Theme.typography.fontSize.sm * Theme.typography.lineHeight.relaxed,
  },
  footer: {
    padding: Theme.spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: Theme.typography.fontSize.xs,
    fontFamily: Theme.typography.fontFamily.regular,
    color: Theme.colors.neutral[500],
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;