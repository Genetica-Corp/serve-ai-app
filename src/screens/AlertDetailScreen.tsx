import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '@/types';

type AlertDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AlertDetail'>;
type AlertDetailScreenRouteProp = RouteProp<RootStackParamList, 'AlertDetail'>;

interface Props {
  navigation: AlertDetailScreenNavigationProp;
  route: AlertDetailScreenRouteProp;
}

const AlertDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { alertId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alert Details</Text>
      <Text style={styles.subtitle}>Alert ID: {alertId}</Text>
      <Text style={styles.description}>
        Alert detail implementation will be added by the Alert Management Agent
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default AlertDetailScreen;