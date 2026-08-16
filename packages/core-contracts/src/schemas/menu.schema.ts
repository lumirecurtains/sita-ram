import { z } from 'zod';
import { ModifierOptionDTO, ModifierGroupDTO, MenuItemDTO, CategoryDTO } from '../dtos/menu.dto.js';
import {
  MenuItemIdSchema,
  CategoryIdSchema,
  ModifierGroupIdSchema,
  ModifierOptionIdSchema,
  OutletIdSchema,
} from './identifiers.schema.js';
import { DietaryTagSchema } from './enums.schema.js';

export const ModifierOptionSchema: z.ZodType<ModifierOptionDTO> = z.object({
  id: ModifierOptionIdSchema,
  name: z.string().min(1).max(128),
  priceDeltaPaise: z.number().int().nonnegative(),
  isAvailable: z.boolean(),
});

export const ModifierGroupSchema: z.ZodType<ModifierGroupDTO> = z.object({
  id: ModifierGroupIdSchema,
  name: z.string().min(1).max(128),
  minSelections: z.number().int().nonnegative(),
  maxSelections: z.number().int().nonnegative(),
  options: z.array(ModifierOptionSchema),
});

export const MenuItemSchema: z.ZodType<MenuItemDTO> = z.object({
  id: MenuItemIdSchema,
  outletId: OutletIdSchema,
  categoryId: CategoryIdSchema,
  name: z.string().min(1).max(256),
  description: z.string().max(1024).optional(),
  basePricePaise: z.number().int().nonnegative(),
  dietaryTag: DietaryTagSchema,
  isAvailable: z.boolean(),
  modifierGroups: z.array(ModifierGroupSchema).optional(),
  imageUrl: z.string().url().optional(),
});

export const CategorySchema: z.ZodType<CategoryDTO> = z.object({
  id: CategoryIdSchema,
  outletId: OutletIdSchema,
  name: z.string().min(1).max(128),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
});
