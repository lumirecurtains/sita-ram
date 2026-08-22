/**
 * @sitaram/infrastructure v0.1.0
 * Data Access, Firestore Repositories & Storage Infrastructure for Sita Ram Restaurant OS
 *
 * Invariants:
 * - Implements data access layer ports defined in core contracts / domain core
 * - Strict adherence to Step 6C Firestore collection hierarchies
 * - Decoupled from UI components and HTTP router controllers
 */

import { type Result } from '@sitaram/core-contracts';
import { type DomainEntity } from '@sitaram/domain-core';

/**
 * Package metadata constant.
 */
export const INFRASTRUCTURE_VERSION = '0.1.0';

/**
 * Generic Read Repository Interface
 */
export interface ReadRepository<TEntity extends DomainEntity, TId = string> {
  findById(id: TId): Promise<Result<TEntity | null, Error>>;
  listAll(orgId: string): Promise<Result<readonly TEntity[], Error>>;
}

/**
 * Generic Write Repository Interface (ACID compliant)
 */
export interface WriteRepository<TEntity extends DomainEntity, TId = string> {
  create(entity: TEntity): Promise<Result<TEntity, Error>>;
  update(id: TId, updates: Partial<TEntity>): Promise<Result<TEntity, Error>>;
}

/**
 * Repository Port Combining Read and Write Capabilities
 */
export interface Repository<TEntity extends DomainEntity, TId = string>
  extends ReadRepository<TEntity, TId>, WriteRepository<TEntity, TId> {}
