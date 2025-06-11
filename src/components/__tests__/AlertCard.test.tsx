import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AlertCard } from '../AlertCard';
import { Alert } from '../../types';

// Mock the vector icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

const mockAlert: Alert = {
  id: '1',
  type: 'ORDER',
  priority: 'HIGH',
  status: 'ACTIVE',
  title: 'Order Queue Overloaded',
  message: 'Kitchen queue exceeding capacity',
  details: 'Current queue: 15 orders. Average prep time: 8 minutes.',
  timestamp: Date.now(),
  read: false,
  acknowledged: false,
  resolved: false,
  dismissed: false,
  shouldNotify: true,
  notificationSent: false,
  actionRequired: true,
  estimatedResolutionTime: 15,
  source: 'MockDataGenerator',
  tags: ['lunch', 'FAST_CASUAL'],
};

const mockOnPress = jest.fn();
const mockOnAcknowledge = jest.fn();
const mockOnDismiss = jest.fn();

describe('AlertCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders alert information correctly', () => {
    const { getByText } = render(
      <AlertCard
        alert={mockAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(getByText('Order Queue Overloaded')).toBeTruthy();
    expect(getByText('Kitchen queue exceeding capacity')).toBeTruthy();
    expect(getByText('HIGH')).toBeTruthy();
  });

  it('shows unread indicator for unread alerts', () => {
    const { getByTestId } = render(
      <AlertCard
        alert={mockAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(getByTestId('unread-indicator')).toBeTruthy();
  });

  it('does not show unread indicator for read alerts', () => {
    const readAlert = { ...mockAlert, read: true };
    const { queryByTestId } = render(
      <AlertCard
        alert={readAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(queryByTestId('unread-indicator')).toBeNull();
  });

  it('calls onPress when alert card is tapped', () => {
    const { getByTestId } = render(
      <AlertCard
        alert={mockAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.press(getByTestId('alert-card'));
    expect(mockOnPress).toHaveBeenCalledWith(mockAlert);
  });

  it('calls onAcknowledge when acknowledge button is pressed', () => {
    const { getByTestId } = render(
      <AlertCard
        alert={mockAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.press(getByTestId('acknowledge-button'));
    expect(mockOnAcknowledge).toHaveBeenCalledWith(mockAlert.id);
  });

  it('calls onDismiss when dismiss button is pressed', () => {
    const { getByTestId } = render(
      <AlertCard
        alert={mockAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    fireEvent.press(getByTestId('dismiss-button'));
    expect(mockOnDismiss).toHaveBeenCalledWith(mockAlert.id);
  });

  it('displays correct priority styling for CRITICAL alerts', () => {
    const criticalAlert = { ...mockAlert, priority: 'CRITICAL' as const };
    const { getByTestId } = render(
      <AlertCard
        alert={criticalAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    const alertCard = getByTestId('alert-card');
    expect(alertCard.props.style).toEqual(
      expect.objectContaining({
        borderLeftColor: '#DC2626', // Critical red color
      })
    );
  });

  it('displays correct priority styling for HIGH alerts', () => {
    const { getByTestId } = render(
      <AlertCard
        alert={mockAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    const alertCard = getByTestId('alert-card');
    expect(alertCard.props.style).toEqual(
      expect.objectContaining({
        borderLeftColor: '#F59E0B', // High orange color
      })
    );
  });

  it('shows acknowledged state correctly', () => {
    const acknowledgedAlert = { ...mockAlert, acknowledged: true };
    const { getByText, queryByTestId } = render(
      <AlertCard
        alert={acknowledgedAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(getByText('Acknowledged')).toBeTruthy();
    expect(queryByTestId('acknowledge-button')).toBeNull();
  });

  it('formats timestamp correctly', () => {
    const now = Date.now();
    const recentAlert = { ...mockAlert, timestamp: now - 5 * 60 * 1000 }; // 5 minutes ago
    
    const { getByText } = render(
      <AlertCard
        alert={recentAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(getByText(/5 minutes ago/)).toBeTruthy();
  });

  it('shows action required indicator when actionRequired is true', () => {
    const { getByTestId } = render(
      <AlertCard
        alert={mockAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(getByTestId('action-required-indicator')).toBeTruthy();
  });

  it('does not show action required indicator when actionRequired is false', () => {
    const noActionAlert = { ...mockAlert, actionRequired: false };
    const { queryByTestId } = render(
      <AlertCard
        alert={noActionAlert}
        onPress={mockOnPress}
        onAcknowledge={mockOnAcknowledge}
        onDismiss={mockOnDismiss}
      />
    );

    expect(queryByTestId('action-required-indicator')).toBeNull();
  });
});