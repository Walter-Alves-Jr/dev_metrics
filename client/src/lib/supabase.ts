import { createClient } from '@supabase/supabase-js';

// Supabase configuration - will be set via environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for webhook integrations
export interface WebhookIntegration {
  id: string;
  name: string;
  source: 'jira' | 'azure_devops' | 'movidesk' | 'multidados' | 'custom';
  webhook_url: string;
  field_mappings: Record<string, string>; // Maps source field to SmartOps field
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookPayload {
  integration_id: string;
  data: Record<string, any>;
  timestamp: string;
}

export interface IntegrationLog {
  id: string;
  integration_id: string;
  status: 'success' | 'error' | 'pending';
  payload: Record<string, any>;
  error_message?: string;
  created_at: string;
}

// Helper function to generate webhook URL
export const generateWebhookUrl = (integrationId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/api/webhooks/${integrationId}`;
};

// Helper function to map external JSON to SmartOps format
export const mapJsonToSmartOps = (
  sourceData: Record<string, any>,
  mappings: Record<string, string>
): Record<string, any> => {
  const result: Record<string, any> = {};
  
  for (const [smartopsField, sourcePath] of Object.entries(mappings)) {
    const value = getNestedValue(sourceData, sourcePath);
    if (value !== undefined) {
      result[smartopsField] = value;
    }
  }
  
  return result;
};

// Helper to get nested object values using dot notation
const getNestedValue = (obj: Record<string, any>, path: string): any => {
  return path.split('.').reduce((current, prop) => current?.[prop], obj);
};

// Predefined field mappings for common tools
export const defaultMappings = {
  jira: {
    'project.id': 'issue.key',
    'project.name': 'issue.fields.project.name',
    'project.status': 'issue.fields.status.name',
    'project.hours': 'issue.fields.customfield_10000', // Adjust based on your Jira setup
    'project.cost': 'issue.fields.customfield_10001',
  },
  azure_devops: {
    'project.id': 'resource.id',
    'project.name': 'resource.fields["System.Title"]',
    'project.status': 'resource.fields["System.State"]',
    'project.hours': 'resource.fields["Custom.Hours"]',
    'project.cost': 'resource.fields["Custom.Cost"]',
  },
  movidesk: {
    'project.id': 'ticket.id',
    'project.name': 'ticket.subject',
    'project.status': 'ticket.status',
    'project.hours': 'ticket.timeSpent',
    'project.cost': 'ticket.cost',
  },
  multidados: {
    'project.id': 'project.id',
    'project.name': 'project.name',
    'project.status': 'project.status',
    'project.hours': 'project.hours',
    'project.cost': 'project.cost',
  },
};
