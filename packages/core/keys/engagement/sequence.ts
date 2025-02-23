import { SnakecasedKeysSequenceWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedSequenceWithTenant = arrayOfAllKeys<SnakecasedKeysSequenceWithTenant>()([
  '_supaglue_application_id',
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  '_supaglue_emitted_at',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
  'last_modified_at',
  'owner_id',
  'name',
  'tags',
  'num_steps',
  'schedule_count',
  'click_count',
  'reply_count',
  'open_count',
  'opt_out_count',
  'is_enabled',
  'raw_data',
]);
