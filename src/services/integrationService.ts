import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServiceResponse } from '../types';
import {
  AnyIntegrationCredentials,
  IntegrationType,
  IntegrationTestResult,
  IntegrationSetupData,
  ToastCredentials,
  OpenTableCredentials,
  QuickBooksCredentials,
  SevenShiftsCredentials,
} from '../types/integrations';

const STORAGE_KEY = 'integrations';

class IntegrationService {
  private static instance: IntegrationService;

  private constructor() {}

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService();
    }
    return IntegrationService.instance;
  }

  async getIntegrations(): Promise<ServiceResponse<AnyIntegrationCredentials[]>> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const integrations = stored ? JSON.parse(stored) : [];
      return {
        success: true,
        data: integrations,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load integrations',
      };
    }
  }

  async getIntegration(type: IntegrationType): Promise<ServiceResponse<AnyIntegrationCredentials | null>> {
    try {
      const result = await this.getIntegrations();
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      const integration = result.data?.find(i => i.type === type) || null;
      return {
        success: true,
        data: integration,
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to load integration',
      };
    }
  }

  async saveIntegration(integration: AnyIntegrationCredentials): Promise<ServiceResponse<void>> {
    try {
      const result = await this.getIntegrations();
      const integrations = result.success ? result.data || [] : [];
      
      const existingIndex = integrations.findIndex(i => i.type === integration.type);
      if (existingIndex >= 0) {
        integrations[existingIndex] = integration;
      } else {
        integrations.push(integration);
      }
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to save integration',
      };
    }
  }

  async deleteIntegration(type: IntegrationType): Promise<ServiceResponse<void>> {
    try {
      const result = await this.getIntegrations();
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      const integrations = result.data?.filter(i => i.type !== type) || [];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(integrations));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to delete integration',
      };
    }
  }

  async testIntegration(type: IntegrationType, credentials: IntegrationSetupData): Promise<ServiceResponse<IntegrationTestResult>> {
    try {
      // Simulate API testing for each integration type
      switch (type) {
        case IntegrationType.TOAST:
          return this.testToastConnection(credentials);
        case IntegrationType.OPENTABLE:
          return this.testOpenTableConnection(credentials);
        case IntegrationType.QUICKBOOKS:
          return this.testQuickBooksConnection(credentials);
        case IntegrationType.SEVENSHIPS:
          return this.testSevenShiftsConnection(credentials);
        default:
          return {
            success: false,
            error: 'Unknown integration type',
          };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to test connection',
      };
    }
  }

  private async testToastConnection(credentials: IntegrationSetupData): Promise<ServiceResponse<IntegrationTestResult>> {
    // TODO: Implement actual Toast API test
    // For now, simulate a successful test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        success: true,
        message: 'Successfully connected to Toast POS',
        details: {
          restaurantName: 'Demo Restaurant',
          apiVersion: 'v2',
        },
      },
    };
  }

  private async testOpenTableConnection(credentials: IntegrationSetupData): Promise<ServiceResponse<IntegrationTestResult>> {
    // TODO: Implement actual OpenTable API test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        success: true,
        message: 'Successfully connected to OpenTable',
        details: {
          restaurantName: 'Demo Restaurant',
          reservationCount: 42,
        },
      },
    };
  }

  private async testQuickBooksConnection(credentials: IntegrationSetupData): Promise<ServiceResponse<IntegrationTestResult>> {
    // TODO: Implement actual QuickBooks API test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        success: true,
        message: 'Successfully connected to QuickBooks Online',
        details: {
          companyName: 'Demo Company',
          lastSyncDate: new Date().toISOString(),
        },
      },
    };
  }

  private async testSevenShiftsConnection(credentials: IntegrationSetupData): Promise<ServiceResponse<IntegrationTestResult>> {
    // TODO: Implement actual 7shifts API test
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      data: {
        success: true,
        message: 'Successfully connected to 7shifts',
        details: {
          companyName: 'Demo Company',
          employeeCount: 25,
        },
      },
    };
  }

  createCredentialsObject(type: IntegrationType, data: IntegrationSetupData): AnyIntegrationCredentials {
    const base = {
      id: `${type}-${Date.now()}`,
      type,
      name: data.name || type,
      isActive: true,
    };

    switch (type) {
      case IntegrationType.TOAST:
        return {
          ...base,
          type: IntegrationType.TOAST,
          apiKey: data.apiKey,
          restaurantGuid: data.restaurantGuid,
          environment: data.environment as 'sandbox' | 'production',
        } as ToastCredentials;

      case IntegrationType.OPENTABLE:
        return {
          ...base,
          type: IntegrationType.OPENTABLE,
          clientId: data.clientId,
          clientSecret: data.clientSecret,
          restaurantId: data.restaurantId,
        } as OpenTableCredentials;

      case IntegrationType.QUICKBOOKS:
        return {
          ...base,
          type: IntegrationType.QUICKBOOKS,
          clientId: data.clientId,
          clientSecret: data.clientSecret,
          realmId: data.realmId,
          refreshToken: data.refreshToken,
        } as QuickBooksCredentials;

      case IntegrationType.SEVENSHIPS:
        return {
          ...base,
          type: IntegrationType.SEVENSHIPS,
          apiKey: data.apiKey,
          companyId: data.companyId,
        } as SevenShiftsCredentials;

      default:
        throw new Error('Unknown integration type');
    }
  }
}

export default IntegrationService.getInstance();