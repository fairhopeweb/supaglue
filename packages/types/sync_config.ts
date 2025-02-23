import { CommonModelType, SyncType } from '.';

export type SyncConfig = {
  id: string;
  applicationId: string;
  destinationId: string;
  providerId: string;
  config: SyncConfigData;
};

export type SyncConfigCreateParams = Omit<SyncConfig, 'id'>;
export type SyncConfigUpdateParams = SyncConfigCreateParams;

export type SyncConfigData = {
  defaultConfig: SyncStrategyConfig;
  commonObjects?: CommonObjectConfig[];
  standardObjects?: StandardObjectConfig[];
  customObjects?: CustomObjectConfig[];
};

export type SyncStrategyConfig = {
  periodMs: number;
  strategy: SyncType;
  startSyncOnConnectionCreation: boolean;
};

export type CommonObjectConfig = {
  object: CommonModelType;
  // If true, all fields will be fetched into the raw object and not just the ones needed for the common model.
  fetchAllFieldsIntoRaw: boolean;
};

export type StandardObjectConfig = {
  object: string;
  schema?: StandardObjectSchema;
};

export type StandardObjectSchema = {
  fields: StandardObjectSchemaField[];
  allowAdditionalFieldMappings: boolean;
};

export type StandardObjectSchemaField = {
  name: string; // my_first_column
  mappedName?: string; // salesforce_first_column
};

export type CustomObjectConfig = {
  object: string;
};
