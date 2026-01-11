"use client";

import useSWR from "swr";
import type { ShoppingItem } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Failed to fetch shopping items");
    throw error;
  }
  return res.json();
};

export function useShoppingList() {
  const { data, error, isLoading, mutate } = useSWR<ShoppingItem[]>(
    "/api/shopping",
    fetcher
  );

  // Add new item
  const addItem = async (name: string, quantity?: string): Promise<ShoppingItem> => {
    const response = await fetch("/api/shopping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, quantity }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add item");
    }

    const newItem = await response.json();

    // Revalidate the cache
    mutate();

    return newItem;
  };

  // Update item
  const updateItem = async (
    id: string,
    updates: { name?: string; quantity?: string; checked?: boolean }
  ): Promise<ShoppingItem> => {
    const response = await fetch(`/api/shopping/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update item");
    }

    const updatedItem = await response.json();

    // Revalidate the cache
    mutate();

    return updatedItem;
  };

  // Toggle checked status with optimistic update
  const toggleItem = async (id: string): Promise<ShoppingItem> => {
    const item = data?.find((i) => i.id === id);
    if (!item) {
      throw new Error("Item not found");
    }

    const newChecked = !item.checked;

    // Optimistic update
    const optimisticData = data?.map((i) =>
      i.id === id ? { ...i, checked: newChecked } : i
    );

    // Sort optimistic data: unchecked first, then by createdAt desc
    optimisticData?.sort((a, b) => {
      if (a.checked !== b.checked) {
        return a.checked ? 1 : -1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const togglePromise = async (): Promise<ShoppingItem[]> => {
      const response = await fetch(`/api/shopping/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: newChecked }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to toggle item");
      }

      // Return the sorted data
      const updated = data?.map((i) =>
        i.id === id ? { ...i, checked: newChecked } : i
      );
      updated?.sort((a, b) => {
        if (a.checked !== b.checked) {
          return a.checked ? 1 : -1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return updated || [];
    };

    try {
      await mutate(togglePromise(), {
        optimisticData,
        rollbackOnError: true,
        revalidate: true,
      });

      return { ...item, checked: newChecked };
    } catch (error) {
      mutate();
      throw error;
    }
  };

  // Delete item
  const deleteItem = async (id: string): Promise<void> => {
    // Optimistic update
    const optimisticData = data?.filter((i) => i.id !== id);

    const deletePromise = async (): Promise<ShoppingItem[]> => {
      const response = await fetch(`/api/shopping/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete item");
      }

      return data?.filter((i) => i.id !== id) || [];
    };

    try {
      await mutate(deletePromise(), {
        optimisticData,
        rollbackOnError: true,
        revalidate: true,
      });
    } catch (error) {
      mutate();
      throw error;
    }
  };

  // Clear all checked items
  const clearChecked = async (): Promise<void> => {
    // Optimistic update
    const optimisticData = data?.filter((i) => !i.checked);

    const clearPromise = async (): Promise<ShoppingItem[]> => {
      const response = await fetch("/api/shopping/clear", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to clear checked items");
      }

      return data?.filter((i) => !i.checked) || [];
    };

    try {
      await mutate(clearPromise(), {
        optimisticData,
        rollbackOnError: true,
        revalidate: true,
      });
    } catch (error) {
      mutate();
      throw error;
    }
  };

  // Generate from menu
  const generateFromMenu = async (
    startDate: string,
    endDate: string
  ): Promise<{ addedCount: number; items: ShoppingItem[] }> => {
    const response = await fetch("/api/shopping/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate, endDate }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to generate shopping list");
    }

    const result = await response.json();

    // Update the cache with the new items
    mutate(result.items, { revalidate: false });

    return result;
  };

  // Computed properties
  const checkedCount = data?.filter((i) => i.checked).length ?? 0;
  const totalCount = data?.length ?? 0;

  return {
    items: data ?? [],
    isLoading,
    error,
    mutate,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    clearChecked,
    generateFromMenu,
    checkedCount,
    totalCount,
  };
}
