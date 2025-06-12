import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { useUser } from '../contexts/UserContext';
import UserService from '../services/UserService';

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
      <View style={styles.header}>
        <Text style={styles.title}>Serve AI</Text>
        <Text style={styles.subtitle}>Restaurant Alert Management</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Select Your Role</Text>
        <Text style={styles.sectionDescription}>
          Choose how you want to view the dashboard
        </Text>

        <TouchableOpacity
          style={[styles.roleCard, styles.operatorCard]}
          onPress={() => handleRoleSelection('operator')}
        >
          <Ionicons name="people" size={48} color="#FFF" />
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
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, styles.managerCard]}
          onPress={() => handleRoleSelection('manager')}
        >
          <Ionicons name="person" size={48} color="#FFF" />
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
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This is a demo. In production, you would log in with your credentials.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  roleCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  operatorCard: {
    backgroundColor: '#1976D2',
  },
  managerCard: {
    backgroundColor: '#388E3C',
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 16,
    marginBottom: 8,
  },
  roleDescription: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    marginBottom: 16,
  },
  roleFeatures: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 14,
    color: '#FFF',
    marginVertical: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default RoleSelectionScreen;