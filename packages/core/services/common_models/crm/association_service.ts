import { Association, AssociationCreateParams } from '@supaglue/types/crm/association';
import { AssociationType, AssociationTypeCreateParams, SGObject } from '@supaglue/types/crm/association_type';
import { CrmRemoteClient } from '../../../remotes/crm/base';
import { RemoteService } from '../../remote_service';

export class CrmAssociationService {
  readonly #remoteService: RemoteService;

  public constructor(remoteService: RemoteService) {
    this.#remoteService = remoteService;
  }

  public async getAssociationTypes(
    connectionId: string,
    sourceObject: SGObject,
    targetObject: SGObject
  ): Promise<AssociationType[]> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    return await remoteClient.getAssociationTypes(sourceObject, targetObject);
  }

  public async createAssociationType(connectionId: string, params: AssociationTypeCreateParams): Promise<void> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    await remoteClient.createAssociationType(params);
  }

  public async createAssociation(connectionId: string, params: AssociationCreateParams): Promise<Association> {
    const remoteClient = (await this.#remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    return await remoteClient.createAssociation(params);
  }
}
