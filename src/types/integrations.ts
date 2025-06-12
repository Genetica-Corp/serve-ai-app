export interface IntegrationCredentials {
  id: string;
  type: IntegrationType;
  name: string;
  isActive: boolean;
  lastSync?: Date;
  error?: string;
}

export enum IntegrationType {
  TOAST = 'toast',
  OPENTABLE = 'opentable',
  QUICKBOOKS = 'quickbooks',
  SEVENSHIPS = '7shifts',
}

export interface ToastCredentials extends IntegrationCredentials {
  type: IntegrationType.TOAST;
  apiKey: string;
  restaurantGuid: string;
  environment: 'sandbox' | 'production';
}

export interface OpenTableCredentials extends IntegrationCredentials {
  type: IntegrationType.OPENTABLE;
  clientId: string;
  clientSecret: string;
  restaurantId: string;
}

export interface QuickBooksCredentials extends IntegrationCredentials {
  type: IntegrationType.QUICKBOOKS;
  clientId: string;
  clientSecret: string;
  realmId: string;
  refreshToken: string;
}

export interface SevenShiftsCredentials extends IntegrationCredentials {
  type: IntegrationType.SEVENSHIPS;
  apiKey: string;
  companyId: string;
}

export type AnyIntegrationCredentials = 
  | ToastCredentials 
  | OpenTableCredentials 
  | QuickBooksCredentials 
  | SevenShiftsCredentials;

export interface IntegrationWidget {
  type: IntegrationType;
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  fields: IntegrationField[];
}

export interface IntegrationField {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password' | 'select';
  required: boolean;
  options?: { label: string; value: string }[];
  helperText?: string;
}

export interface IntegrationSetupData {
  [key: string]: string;
}

export interface IntegrationValidationError {
  field: string;
  message: string;
}

export interface IntegrationTestResult {
  success: boolean;
  message: string;
  details?: any;
}