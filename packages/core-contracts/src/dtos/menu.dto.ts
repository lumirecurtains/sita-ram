import { DietaryTag } from '../enums/catalog.js';
import {
  MenuItemId,
  CategoryId,
  ModifierGroupId,
  ModifierOptionId,
  OutletId,
} from '../identifiers/index.js';

export interface ModifierOptionDTO {
  readonly id: ModifierOptionId;
  readonly name: string;
  readonly priceDeltaPaise: number;
  readonly isAvailable: boolean;
}

export interface ModifierGroupDTO {
  readonly id: ModifierGroupId;
  readonly name: string;
  readonly minSelections: number;
  readonly maxSelections: number;
  readonly options: readonly ModifierOptionDTO[];
}

export interface MenuItemDTO {
  readonly id: MenuItemId;
  readonly outletId: OutletId;
  readonly categoryId: CategoryId;
  readonly name: string;
  readonly description?: string;
  readonly basePricePaise: number;
  readonly dietaryTag: DietaryTag;
  readonly isAvailable: boolean;
  readonly modifierGroups?: readonly ModifierGroupDTO[];
  readonly imageUrl?: string;
}

export interface CategoryDTO {
  readonly id: CategoryId;
  readonly outletId: OutletId;
  readonly name: string;
  readonly sortOrder: number;
  readonly isActive: boolean;
}
