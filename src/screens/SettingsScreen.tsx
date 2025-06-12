import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restaurant Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Restaurant Profile</Text>
          <Text style={styles.settingValue}>Golden Burger Co.</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Restaurant Type</Text>
          <Text style={styles.settingValue}>Fast Casual</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Integrations</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => navigation.navigate('Integrations')}
        >
          <View style={styles.settingItemContent}>
            <MaterialIcons name="extension" size={24} color="#6B7280" style={styles.settingIcon} />
            <Text style={styles.settingLabel}>Manage Integrations</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Critical Alerts</Text>
          <Text style={styles.settingValue}>Always</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Quiet Hours</Text>
          <Text style={styles.settingValue}>10 PM - 8 AM</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo Controls</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Demo Mode</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingLabel}>Simulation Speed</Text>
          <Text style={styles.settingValue}>1x</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
  },
  settingValue: {
    fontSize: 16,
    color: '#6B7280',
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
});