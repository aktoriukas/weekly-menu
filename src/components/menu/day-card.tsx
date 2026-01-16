"use client";

import { format, isToday } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MealSlot } from "./meal-slot";
import type { MenuDay, MealType, Dish } from "@/types";

interface DayCardProps {
  date: Date;
  menuDay: MenuDay | null;
  onSetMeal: (mealType: MealType, dishId: string) => void;
  onSetCustomMeal: (mealType: MealType, customName: string) => void;
  onClearMeal: (mealType: MealType) => void;
  isLoading?: boolean;
}

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];

export function DayCard({
  date,
  menuDay,
  onSetMeal,
  onSetCustomMeal,
  onClearMeal,
  isLoading = false,
}: DayCardProps) {
  const today = isToday(date);
  const dateStr = format(date, "yyyy-MM-dd");
  const dayName = format(date, "EEEE");
  const dayNumber = format(date, "d");
  const monthName = format(date, "MMM");

  // Get dish for a meal type
  const getDishForMeal = (mealType: MealType): Dish | null => {
    if (!menuDay) return null;
    const meal = menuDay.meals.find((m) => m.type === mealType);
    return meal?.dish || null;
  };

  // Get custom name for a meal type
  const getCustomNameForMeal = (mealType: MealType): string | null => {
    if (!menuDay) return null;
    const meal = menuDay.meals.find((m) => m.type === mealType);
    return meal?.customName || null;
  };

  return (
    <Card
      className={cn(
        "transition-shadow hover:shadow-md",
        today && "ring-2 ring-primary"
      )}
    >
      <CardHeader className="pb-2">
        <Link href={`/calendar?date=${dateStr}`} className="hover:underline">
          <CardTitle className="flex items-baseline gap-2">
            <span
              className={cn(
                "text-2xl font-bold",
                today && "text-primary"
              )}
            >
              {dayNumber}
            </span>
            <span className="text-sm text-muted-foreground">{monthName}</span>
            <span
              className={cn(
                "text-sm font-medium ml-auto",
                today ? "text-primary" : "text-muted-foreground"
              )}
            >
              {dayName}
              {today && (
                <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  Today
                </span>
              )}
            </span>
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {MEAL_TYPES.map((mealType) => (
          <MealSlot
            key={mealType}
            mealType={mealType}
            dish={getDishForMeal(mealType)}
            customName={getCustomNameForMeal(mealType)}
            onSelectDish={(dishId) => onSetMeal(mealType, dishId)}
            onCustomName={(name) => onSetCustomMeal(mealType, name)}
            onClearDish={() => onClearMeal(mealType)}
            isLoading={isLoading}
          />
        ))}
      </CardContent>
    </Card>
  );
}
