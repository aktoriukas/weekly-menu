"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MealSlot } from "@/components/menu/meal-slot";
import { useMonthMenu, setMeal } from "@/hooks/use-menu";
import type { MealType, MenuDay, Dish } from "@/types";

interface CalendarViewProps {
  initialDate?: string;
}

const MEAL_TYPES: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function CalendarView({ initialDate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState<Set<string>>(new Set());

  // Handle initial date from URL
  useEffect(() => {
    if (initialDate) {
      const date = new Date(initialDate);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date);
        setSheetOpen(true);
      }
    }
  }, [initialDate]);

  const { menuByDate, isLoading, mutate } = useMonthMenu({
    year: currentMonth.getFullYear(),
    month: currentMonth.getMonth(),
  });

  const handlePrevMonth = () => {
    setCurrentMonth((m) => subMonths(m, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((m) => addMonths(m, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSheetOpen(true);
  };

  const handleSetMeal = async (mealType: MealType, dishId: string) => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const slotKey = `${dateStr}-${mealType}`;
    setLoadingSlots((prev) => new Set(prev).add(slotKey));

    try {
      await setMeal(dateStr, mealType, dishId);
      await mutate();
      toast.success("Meal updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update meal");
    } finally {
      setLoadingSlots((prev) => {
        const next = new Set(prev);
        next.delete(slotKey);
        return next;
      });
    }
  };

  const handleClearMeal = async (mealType: MealType) => {
    if (!selectedDate) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const slotKey = `${dateStr}-${mealType}`;
    setLoadingSlots((prev) => new Set(prev).add(slotKey));

    try {
      await setMeal(dateStr, mealType, null);
      await mutate();
      toast.success("Meal cleared");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to clear meal");
    } finally {
      setLoadingSlots((prev) => {
        const next = new Set(prev);
        next.delete(slotKey);
        return next;
      });
    }
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays: Date[] = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  // Get menu day for selected date
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedMenuDay = selectedDateStr ? menuByDate.get(selectedDateStr) : null;

  const getDishForMeal = (menuDay: MenuDay | null | undefined, mealType: MealType): Dish | null => {
    if (!menuDay) return null;
    const meal = menuDay.meals.find((m) => m.type === mealType);
    return meal?.dish || null;
  };

  // Get meals for a day with dish names
  const getMealsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const menuDay = menuByDate.get(dateStr);
    if (!menuDay) return { breakfast: null, lunch: null, dinner: null };

    const breakfast = menuDay.meals.find((m) => m.type === "BREAKFAST")?.dish || null;
    const lunch = menuDay.meals.find((m) => m.type === "LUNCH")?.dish || null;
    const dinner = menuDay.meals.find((m) => m.type === "DINNER")?.dish || null;

    return { breakfast, lunch, dinner };
  };

  // Truncate dish name to fit calendar cell
  const truncateName = (name: string, maxLength: number = 8) => {
    if (name.length <= maxLength) return name;
    return name.slice(0, maxLength - 1) + "…";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleToday}
            className="gap-2 flex-1 sm:flex-none"
          >
            <CalendarDays className="size-4" />
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {weekday}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        {isLoading ? (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-md bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const inCurrentMonth = isSameMonth(date, currentMonth);
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const today = isToday(date);
              const meals = getMealsForDay(date);
              const hasSomeMeals = meals.breakfast || meals.lunch || meals.dinner;

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDayClick(date)}
                  className={cn(
                    "min-h-[70px] rounded-md p-1 transition-colors flex flex-col items-start justify-start text-left",
                    inCurrentMonth
                      ? "hover:bg-accent"
                      : "text-muted-foreground/50",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary",
                    today && !isSelected && "ring-2 ring-primary"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      today && !isSelected && "text-primary"
                    )}
                  >
                    {format(date, "d")}
                  </span>
                  {/* Meal Names */}
                  {hasSomeMeals && inCurrentMonth && (
                    <div className="flex flex-col gap-0.5 mt-0.5 w-full overflow-hidden">
                      {meals.breakfast && (
                        <div
                          className={cn(
                            "text-[10px] leading-tight truncate px-1 rounded bg-amber-100 text-amber-700",
                            isSelected && "bg-primary-foreground/20 text-primary-foreground"
                          )}
                          title={meals.breakfast.name}
                        >
                          {truncateName(meals.breakfast.name)}
                        </div>
                      )}
                      {meals.lunch && (
                        <div
                          className={cn(
                            "text-[10px] leading-tight truncate px-1 rounded bg-blue-100 text-blue-700",
                            isSelected && "bg-primary-foreground/20 text-primary-foreground"
                          )}
                          title={meals.lunch.name}
                        >
                          {truncateName(meals.lunch.name)}
                        </div>
                      )}
                      {meals.dinner && (
                        <div
                          className={cn(
                            "text-[10px] leading-tight truncate px-1 rounded bg-indigo-100 text-indigo-700",
                            isSelected && "bg-primary-foreground/20 text-primary-foreground"
                          )}
                          title={meals.dinner.name}
                        >
                          {truncateName(meals.dinner.name)}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-amber-500" />
            <span>Breakfast</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-blue-500" />
            <span>Lunch</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-indigo-500" />
            <span>Dinner</span>
          </div>
        </div>
      </Card>

      {/* Side Panel for Selected Day */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              {selectedDate ? (
                <span>
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  {selectedDate && isToday(selectedDate) && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                      Today
                    </span>
                  )}
                </span>
              ) : (
                "Select a day"
              )}
            </SheetTitle>
          </SheetHeader>

          {selectedDate && (
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Meals</h3>
              {MEAL_TYPES.map((mealType) => {
                const dateStr = format(selectedDate, "yyyy-MM-dd");
                const isSlotLoading = loadingSlots.has(`${dateStr}-${mealType}`);

                return (
                  <MealSlot
                    key={mealType}
                    mealType={mealType}
                    dish={getDishForMeal(selectedMenuDay, mealType)}
                    onSelectDish={(dishId) => handleSetMeal(mealType, dishId)}
                    onClearDish={() => handleClearMeal(mealType)}
                    isLoading={isSlotLoading}
                  />
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
