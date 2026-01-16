// Re-export Prisma generated types for consistency
import type { Dish as PrismaDish, Meal as PrismaMeal } from "@prisma/client";

// ============ User Types ============
export interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

// ============ Household Types ============
export type Role = "OWNER" | "MEMBER";

export interface HouseholdMember {
  id: string;
  userId: string;
  householdId: string;
  role: Role;
  joinedAt: string;
  user: User;
}

export interface HouseholdInvite {
  id: string;
  email: string;
  householdId: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
}

export interface Household {
  id: string;
  name: string;
  createdAt: string;
  members: HouseholdMember[];
  invites: HouseholdInvite[];
}

// ============ Dish Types ============
export const DISH_CATEGORIES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
  "dessert",
  "any",
] as const;

export type DishCategory = (typeof DISH_CATEGORIES)[number];

export interface Dish {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[];
  category: DishCategory | null;
  imageUrl: string | null;
  householdId: string;
  createdAt: string;
  meals?: Meal[];
}

export interface CreateDishInput {
  name: string;
  description?: string;
  ingredients: string[];
  category?: DishCategory;
  imageUrl?: string;
}

export interface UpdateDishInput {
  name?: string;
  description?: string;
  ingredients?: string[];
  category?: DishCategory;
  imageUrl?: string;
}

// ============ Meal Types ============
export type MealType = "BREAKFAST" | "LUNCH" | "DINNER";

export interface Meal {
  id: string;
  type: MealType;
  menuDayId: string;
  dishId: string | null;
  customName: string | null;
  dish?: Dish | null;
}

// ============ Menu Day Types ============
export interface MenuDay {
  id: string;
  date: string;
  householdId: string;
  createdAt: string;
  meals: Meal[];
}

// ============ Shopping Types ============
export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string | null;
  checked: boolean;
  householdId: string;
  createdAt: string;
}

// ============ API Response Types ============
export interface ApiError {
  error: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Type alias for Prisma types if needed
export type { PrismaDish, PrismaMeal };
