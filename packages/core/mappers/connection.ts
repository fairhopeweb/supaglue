import type { Connection as ConnectionModel } from '@supaglue/db';
import {
  CategoryOfProviderName,
  ConnectionSafeAny,
  ConnectionSafeAnyWithIsSyncEnabled,
  ConnectionStatus,
  ConnectionUnsafe,
  ProviderName,
} from '@supaglue/types';
import { CRMProviderName } from '@supaglue/types/crm';
import { decrypt } from '../lib/crypt';
import { parseCustomerIdPk } from '../lib/customer_id';

export async function fromConnectionModelToConnectionUnsafe<T extends ProviderName>({
  id,
  customerId,
  category,
  providerId,
  providerName,
  status,
  credentials,
  instanceUrl,
}: ConnectionModel): Promise<ConnectionUnsafe<T>> {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    providerId: providerId ?? undefined,
    category: category as CategoryOfProviderName<T>,
    status: status as ConnectionStatus,
    providerName: providerName as T,
    credentials: JSON.parse(await decrypt(credentials)),
    instanceUrl,
  };
}

export function fromConnectionModelToConnectionSafe({
  id,
  customerId,
  category,
  providerId,
  providerName,
  status,
  instanceUrl,
}: ConnectionModel): ConnectionSafeAny {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    providerId: providerId ?? undefined,
    category: category as 'crm',
    status: status as ConnectionStatus,
    providerName: providerName as CRMProviderName,
    instanceUrl,
  };
}

export function fromConnectionModelWithSyncToConnectionSafeWithIsSyncEnabled(
  params: ConnectionModel & {
    sync: object | null;
  }
): ConnectionSafeAnyWithIsSyncEnabled {
  return {
    ...fromConnectionModelToConnectionSafe(params),
    isSyncEnabled: !!params.sync,
  };
}
