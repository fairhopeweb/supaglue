import type {
  CommonModelType,
  CommonModelTypeForCategory,
  CommonModelTypeMapForCategory,
  ConnectionSafeAny,
  ProviderCategory,
} from '@supaglue/types';
import type { Readable } from 'stream';

export type WriteCommonModelRecordsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export type WriteObjectRecordsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export interface DestinationWriter {
  upsertCommonModelRecord<P extends ProviderCategory, T extends CommonModelTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonModelType: T,
    object: CommonModelTypeMapForCategory<P>['object']
  ): Promise<void>;

  writeCommonModelRecords(
    connection: ConnectionSafeAny,
    commonModelType: CommonModelType,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelRecordsResult>;

  writeObjectRecords(
    connection: ConnectionSafeAny,
    object: string,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteObjectRecordsResult>;
}

export abstract class BaseDestinationWriter implements DestinationWriter {
  /**
   * This is a method used for writers that support updating objects after
   * syncing, e.g. Postgres for "cache invalidation"
   *
   * TODO: Support engagement vertical as well
   */
  abstract upsertCommonModelRecord<P extends ProviderCategory, T extends CommonModelTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonModelType: T,
    object: CommonModelTypeMapForCategory<P>['object']
  ): Promise<void>;

  /**
   * This is the main method used to sync objects to a destination
   */
  abstract writeCommonModelRecords(
    connection: ConnectionSafeAny,
    commonModelType: CommonModelType,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelRecordsResult>;

  abstract writeObjectRecords(
    connection: ConnectionSafeAny,
    object: string,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteObjectRecordsResult>;
}
