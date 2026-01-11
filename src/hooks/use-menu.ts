"use client";

import useSWR from "swr";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from "date-fns";
import type { MenuDay, MealType } from "@/types";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error("Failed to fetch menu");
    throw error;
  }
  return res.json();
};

interface UseWeekMenuOptions {
  startDate: Date;
}

interface UseMonthMenuOptions {
  year: number;
  month: number;
}

// Hook for fetching 7 days of menu data
export function useWeekMenu({ startDate }: UseWeekMenuOptions) {
  // Start week on Monday
  const weekStart = startOfWeek(startDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(startDate, { weekStartsOn: 1 });

  const startStr = format(weekStart, "yyyy-MM-dd");
  const endStr = format(weekEnd, "yyyy-MM-dd");

  const { data, error, isLoading, mutate } = useSWR<MenuDay[]>(
    `/api/menu?start=${startStr}&end=${endStr}`,
    fetcher
  );

  // Create a map of date -> MenuDay for easy lookup
  const menuByDate = new Map<string, MenuDay>();
  data?.forEach((menuDay) => {
    // Handle date as string or Date object
    const dateStr = typeof menuDay.date === "string"
      ? menuDay.date.split("T")[0]
      : format(new Date(menuDay.date), "yyyy-MM-dd");
    menuByDate.set(dateStr, menuDay);
  });

  // Generate all days of the week
  const days: Array<{ date: Date; dateStr: string; menuDay: MenuDay | null }> = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dateStr = format(date, "yyyy-MM-dd");
    days.push({
      date,
      dateStr,
      menuDay: menuByDate.get(dateStr) || null,
    });
  }

  return {
    days,
    menuByDate,
    isLoading,
    error,
    mutate,
    weekStart,
    weekEnd,
  };
}

// Hook for fetching full month of menu data
export function useMonthMenu({ year, month }: UseMonthMenuOptions) {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  const startStr = format(monthStart, "yyyy-MM-dd");
  const endStr = format(monthEnd, "yyyy-MM-dd");

  const { data, error, isLoading, mutate } = useSWR<MenuDay[]>(
    `/api/menu?start=${startStr}&end=${endStr}`,
    fetcher
  );

  // Create a map of date -> MenuDay for easy lookup
  const menuByDate = new Map<string, MenuDay>();
  data?.forEach((menuDay) => {
    const dateStr = typeof menuDay.date === "string"
      ? menuDay.date.split("T")[0]
      : format(new Date(menuDay.date), "yyyy-MM-dd");
    menuByDate.set(dateStr, menuDay);
  });

  return {
    menuDays: data ?? [],
    menuByDate,
    isLoading,
    error,
    mutate,
    monthStart,
    monthEnd,
  };
}

// Mutation function to set a meal
export async function setMeal(
  date: string,
  mealType: MealType,
  dishId: string | null
): Promise<MenuDay> {
  const response = await fetch("/api/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, mealType, dishId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update meal");
  }

  return response.json();
}

// Mutation function to clear all meals for a day
export async function clearDay(date: string): Promise<void> {
  const response = await fetch(`/api/menu/${date}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to clear day");
  }
}

// Hook for single day menu
export function useDayMenu(date: string | null) {
  const { data, error, isLoading, mutate } = useSWR<MenuDay>(
    date ? `/api/menu/${date}` : null,
    fetcher
  );

  return {
    menuDay: data,
    isLoading,
    error,
    mutate,
  };
}
