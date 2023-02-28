import { PrismaClient } from '@prisma/client';
import { NotFoundError, UnauthorizedError } from '../errors';
import { getExpandedAssociations } from '../lib/expand';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { refreshAccessTokenIfNecessary } from '../lib/refresh_token';
import { fromOpportunityModel } from '../mappers';
import {
  GetParams,
  ListParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunitySyncUpsertParams,
  OpportunityUpdateParams,
  PaginatedResult,
} from '../types';
import { ConnectionService } from './connection_service';
import { RemoteService } from './remote_service';

export class OpportunityService {
  #prisma: PrismaClient;
  #remoteService: RemoteService;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, remoteService: RemoteService, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#remoteService = remoteService;
    this.#connectionService = connectionService;
  }

  // TODO: implement getParams
  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Opportunity> {
    const { expand } = getParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const model = await this.#prisma.crmOpportunity.findUnique({
      where: { id },
      include: {
        account: expandedAssociations.includes('account'),
      },
    });
    if (!model) {
      throw new NotFoundError(`Can't find Opportunity with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromOpportunityModel(model, expandedAssociations);
  }

  // TODO: implement rest of list params
  public async list(connectionId: string, listParams: ListParams): Promise<PaginatedResult<Opportunity>> {
    const { page_size, cursor, created_after, created_before, updated_after, updated_before, expand } = listParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.#prisma.crmOpportunity.findMany({
      ...getPaginationParams(pageSize, cursor),
      where: {
        connectionId,
        remoteCreatedAt: {
          gt: created_after,
          lt: created_before,
        },
        remoteUpdatedAt: {
          gt: updated_after,
          lt: updated_before,
        },
      },
      include: {
        account: expandedAssociations.includes('account'),
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromOpportunityModel(model, expandedAssociations));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async create(
    customerId: string,
    connectionId: string,
    createParams: OpportunityCreateParams
  ): Promise<Opportunity> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    await refreshAccessTokenIfNecessary(connectionId, remoteClient, this.#connectionService);
    const remoteOpportunity = await remoteClient.createOpportunity(createParams);
    const opportunityModel = await this.#prisma.crmOpportunity.create({
      data: {
        customerId,
        connectionId,
        ...remoteOpportunity,
      },
    });
    return fromOpportunityModel(opportunityModel);
  }

  public async update(
    customerId: string,
    connectionId: string,
    updateParams: OpportunityUpdateParams
  ): Promise<Opportunity> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundOpportunityModel = await this.#prisma.crmOpportunity.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundOpportunityModel.customerId !== customerId) {
      throw new Error('Opportunity customerId does not match');
    }

    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    await refreshAccessTokenIfNecessary(connectionId, remoteClient, this.#connectionService);
    const remoteOpportunity = await remoteClient.updateOpportunity({
      ...updateParams,
      remoteId: foundOpportunityModel.remoteId,
    });

    const opportunityModel = await this.#prisma.crmOpportunity.update({
      data: remoteOpportunity,
      where: {
        id: updateParams.id,
      },
    });
    return fromOpportunityModel(opportunityModel);
  }

  // TODO: We should do this performantly, which may involve COPY to temp table
  // and bulk upsert from there.
  public async upsertRemoteOpportunities(
    connectionId: string,
    upsertParamsList: OpportunitySyncUpsertParams[]
  ): Promise<void> {
    for (const upsertParams of upsertParamsList) {
      await this.#prisma.crmOpportunity.upsert({
        where: {
          connectionId_remoteId: {
            connectionId,
            remoteId: upsertParams.remoteId,
          },
        },
        update: upsertParams,
        create: upsertParams,
      });
    }
  }

  public async updateDanglingAccounts(connectionId: string) {
    const opportunitiesWithDanglingAccounts = await this.#prisma.crmOpportunity.findMany({
      where: {
        connectionId,
        accountId: null,
        NOT: {
          remoteAccountId: null,
        },
      },
    });

    const danglingRemoteAccountIds = opportunitiesWithDanglingAccounts.map(
      ({ remoteAccountId }) => remoteAccountId
    ) as string[];
    const crmAccounts = await this.#prisma.crmAccount.findMany({
      where: {
        connectionId,
        remoteId: {
          in: danglingRemoteAccountIds,
        },
      },
    });
    await Promise.all(
      crmAccounts.map(({ remoteId, id }) => {
        return this.#prisma.crmOpportunity.updateMany({
          where: {
            connectionId,
            remoteAccountId: remoteId,
          },
          data: {
            accountId: id,
          },
        });
      })
    );
  }
}
