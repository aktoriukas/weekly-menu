"use client";

import useSWR from "swr";
import type { Dish, DishCategory, CreateDishInput, UpdateDishInput } from "@/types";

export interface DishWithCount extends Dish {
  _count: {
    meals: number;
  };
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Failed to fetch dishes");
    throw error;
  }
  return res.json();
};

interface UseDishesOptions {
  category?: DishCategory | null;
}

export function useDishes(options: UseDishesOptions = {}) {
  const { category } = options;

  // Build URL with optional category filter
  const url = category ? `/api/dishes?category=${category}` : "/api/dishes";

  const { data, error, isLoading, mutate } = useSWR<DishWithCount[]>(url, fetcher);

  // Create dish with optimistic update
  const createDish = async (input: CreateDishInput): Promise<DishWithCount> => {
    const response = await fetch("/api/dishes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create dish");
    }

    const newDish = await response.json();

    // Revalidate the cache
    mutate();

    return newDish;
  };

  // Update dish with optimistic update
  const updateDish = async (id: string, input: UpdateDishInput): Promise<DishWithCount> => {
    // Optimistic update
    const optimisticData = data?.map((dish) =>
      dish.id === id ? { ...dish, ...input } : dish
    );

    const updatePromise = async () => {
      const response = await fetch(`/api/dishes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update dish");
      }

      return response.json();
    };

    // Use optimistic update with rollback on error
    try {
      mutate(updatePromise(), {
        optimisticData,
        rollbackOnError: true,
        revalidate: true,
      });

      return await updatePromise();
    } catch (error) {
      // Re-fetch on error to restore correct state
      mutate();
      throw error;
    }
  };

  // Delete dish with optimistic update
  const deleteDish = async (id: string, force = false): Promise<void> => {
    // Optimistic update - remove from list
    const optimisticData = data?.filter((dish) => dish.id !== id);

    const deletePromise = async () => {
      const url = force ? `/api/dishes/${id}?force=true` : `/api/dishes/${id}`;
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete dish");
      }

      return data?.filter((dish) => dish.id !== id) || [];
    };

    try {
      await mutate(deletePromise(), {
        optimisticData,
        rollbackOnError: true,
        revalidate: true,
      });
    } catch (error) {
      // Re-fetch on error to restore correct state
      mutate();
      throw error;
    }
  };

  return {
    dishes: data ?? [],
    isLoading,
    error,
    mutate,
    createDish,
    updateDish,
    deleteDish,
  };
}

// Hook to fetch a single dish
export function useDish(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<DishWithCount>(
    id ? `/api/dishes/${id}` : null,
    fetcher
  );

  return {
    dish: data,
    isLoading,
    error,
    mutate,
  };
}
