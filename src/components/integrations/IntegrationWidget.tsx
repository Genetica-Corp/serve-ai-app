import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Theme } from '../../theme';
import { Text } from 'react-native';
import {
  IntegrationWidget as IntegrationWidgetType,
  IntegrationSetupData,
  IntegrationValidationError,
} from '../../types/integrations';
import integrationService from '../../services/integrationService';

interface IntegrationWidgetProps {
  widget: IntegrationWidgetType;
  onSuccess: () => void;
  onCancel: () => void;
}

export const IntegrationWidget: React.FC<IntegrationWidgetProps> = ({
  widget,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<IntegrationSetupData>({});
  const [errors, setErrors] = useState<IntegrationValidationError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleFieldChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    // Clear error for this field
    setErrors(prev => prev.filter(error => error.field !== key));
  };

  const validateForm = (): boolean => {
    const newErrors: IntegrationValidationError[] = [];

    widget.fields.forEach(field => {
      if (field.required && !formData[field.key]) {
        newErrors.push({
          field: field.key,
          message: `${field.label} is required`,
        });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleTest = async () => {
    if (!validateForm()) {
      return;
    }

    setIsTesting(true);
    try {
      const result = await integrationService.testIntegration(widget.type, formData);
      
      if (result.success && result.data?.success) {
        Alert.alert(
          'Connection Successful',
          result.data.message,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Connection Failed',
          result.data?.message || result.error || 'Failed to connect',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred while testing the connection',
        [{ text: 'OK' }]
      );
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const credentials = integrationService.createCredentialsObject(widget.type, formData);
      const result = await integrationService.saveIntegration(credentials);
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Integration saved successfully',
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert(
          'Error',
          result.error || 'Failed to save integration',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred while saving',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (fieldKey: string): string | undefined => {
    return errors.find(error => error.field === fieldKey)?.message;
  };

  const renderField = (field: IntegrationWidgetType['fields'][0]) => {
    if (field.type === 'select' && field.options) {
      return (
        <View key={field.key} style={styles.fieldContainer}>
          <Text style={styles.label}>{field.label}</Text>
          {field.options.map(option => (
            <Button
              key={option.value}
              title={option.label}
              onPress={() => handleFieldChange(field.key, option.value)}
              variant={formData[field.key] === option.value ? 'primary' : 'secondary'}
              size="md"
              style={styles.selectButton}
            />
          ))}
          {field.helperText && (
            <Text style={styles.helperText}>{field.helperText}</Text>
          )}
          {getFieldError(field.key) && (
            <Text style={styles.errorText}>{getFieldError(field.key)}</Text>
          )}
        </View>
      );
    }

    return (
      <View key={field.key} style={styles.fieldContainer}>
        <Input
          label={field.label}
          value={formData[field.key] || ''}
          onChangeText={(value) => handleFieldChange(field.key, value)}
          placeholder={field.placeholder}
          secureTextEntry={field.type === 'password'}
          error={getFieldError(field.key)}
        />
        {field.helperText && (
          <Text style={styles.helperText}>{field.helperText}</Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: widget.iconColor + '20' }]}>
              <MaterialIcons
                name={widget.iconName}
                size={32}
                color={widget.iconColor}
              />
            </View>
            <Text style={styles.title}>{widget.title}</Text>
          </View>
          
          <Text style={styles.description}>{widget.description}</Text>
          
          <View style={styles.fieldsContainer}>
            {widget.fields.map(renderField)}
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Test Connection"
              onPress={handleTest}
              variant="secondary"
              size="lg"
              loading={isTesting}
              disabled={isLoading}
              style={styles.button}
            />
            <Button
              title="Save Integration"
              onPress={handleSave}
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isTesting}
              style={styles.button}
            />
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="ghost"
              size="lg"
              disabled={isLoading || isTesting}
              style={styles.button}
            />
          </View>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: Theme.spacing.md,
    padding: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h2,
    flex: 1,
  },
  description: {
    ...Theme.typography.body,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.lg,
  },
  fieldsContainer: {
    marginBottom: Theme.spacing.lg,
  },
  fieldContainer: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    ...Theme.typography.label,
    marginBottom: Theme.spacing.xs,
  },
  helperText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  errorText: {
    ...Theme.typography.caption,
    color: Theme.colors.error,
    marginTop: Theme.spacing.xs,
  },
  selectButton: {
    marginBottom: Theme.spacing.xs,
  },
  buttonContainer: {
    gap: Theme.spacing.sm,
  },
  button: {
    marginBottom: Theme.spacing.sm,
  },
});