import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Theme } from '../../theme';

interface FilterSectionProps {
  activeFilter: 'all' | 'unassigned' | 'assigned';
  onFilterChange: (filter: 'all' | 'unassigned' | 'assigned') => void;
}

export const FilterSection: React.FC<FilterSectionProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === 'all' && styles.filterButtonActive,
        ]}
        onPress={() => onFilterChange('all')}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === 'all' && styles.filterTextActive,
          ]}
        >
          All Alerts
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === 'unassigned' && styles.filterButtonActive,
        ]}
        onPress={() => onFilterChange('unassigned')}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === 'unassigned' && styles.filterTextActive,
          ]}
        >
          Unassigned
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.filterButton,
          activeFilter === 'assigned' && styles.filterButtonActive,
        ]}
        onPress={() => onFilterChange('assigned')}
      >
        <Text
          style={[
            styles.filterText,
            activeFilter === 'assigned' && styles.filterTextActive,
          ]}
        >
          Assigned
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.white,
    marginTop: 1,
    ...Theme.shadows.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    marginHorizontal: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Theme.colors.primary.DEFAULT,
    borderColor: Theme.colors.primary.DEFAULT,
  },
  filterText: {
    fontSize: Theme.typography.fontSize.sm,
    fontFamily: Theme.typography.fontFamily.medium,
    color: Theme.colors.neutral[600],
  },
  filterTextActive: {
    color: Theme.colors.white,
    fontFamily: Theme.typography.fontFamily.semibold,
  },
});
