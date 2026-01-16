"use client";

import { useState } from "react";
import Link from "next/link";
import { Sun, CloudSun, Moon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DishPicker } from "./dish-picker";
import { AddIngredientsDialog } from "./add-ingredients-dialog";
import { useDishes } from "@/hooks/use-dishes";
import type { MealType, Dish } from "@/types";

interface MealSlotProps {
  mealType: MealType;
  dish: Dish | null;
  customName?: string | null;
  onSelectDish: (dishId: string) => void;
  onCustomName: (name: string) => void;
  onClearDish: () => void;
  isLoading?: boolean;
  showDishLink?: boolean;
}

const mealTypeConfig: Record<MealType, { icon: typeof Sun; label: string; color: string }> = {
  BREAKFAST: {
    icon: Sun,
    label: "Breakfast",
    color: "text-amber-500",
  },
  LUNCH: {
    icon: CloudSun,
    label: "Lunch",
    color: "text-blue-500",
  },
  DINNER: {
    icon: Moon,
    label: "Dinner",
    color: "text-indigo-500",
  },
};

export function MealSlot({
  mealType,
  dish,
  customName,
  onSelectDish,
  onCustomName,
  onClearDish,
  isLoading = false,
  showDishLink = true,
}: MealSlotProps) {
  const [open, setOpen] = useState(false);
  const [ingredientsDialogOpen, setIngredientsDialogOpen] = useState(false);
  const [pendingDish, setPendingDish] = useState<Dish | null>(null);

  const { dishes } = useDishes();
  const config = mealTypeConfig[mealType];
  const Icon = config.icon;

  // Determine display name: dish name takes priority, then custom name
  const displayName = dish?.name || customName;
  const hasMeal = !!dish || !!customName;

  const handleSelectDish = (dishId: string) => {
    // Find the full dish object
    const selectedDish = dishes.find((d) => d.id === dishId);
    if (selectedDish) {
      setPendingDish(selectedDish);
      setOpen(false);
      setIngredientsDialogOpen(true);
    } else {
      // Fallback if dish not found (shouldn't happen)
      onSelectDish(dishId);
      setOpen(false);
    }
  };

  const handleIngredientsConfirm = () => {
    if (pendingDish) {
      onSelectDish(pendingDish.id);
      setPendingDish(null);
    }
  };

  const handleIngredientsDialogClose = (open: boolean) => {
    setIngredientsDialogOpen(open);
    if (!open && pendingDish) {
      // User closed dialog without confirming, still add the dish
      onSelectDish(pendingDish.id);
      setPendingDish(null);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={isLoading}
            className={cn(
              "w-full flex items-center gap-2 p-2 rounded-md transition-colors text-left",
              hasMeal
                ? "bg-accent/50 hover:bg-accent"
                : "border border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 hover:bg-accent/30",
              isLoading && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className={cn("size-4 shrink-0", config.color)} />
            {hasMeal ? (
              dish && showDishLink ? (
                <Link
                  href={`/dishes/${dish.id}`}
                  className="text-sm font-medium truncate hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {displayName}
                </Link>
              ) : (
                <span className="text-sm font-medium truncate">{displayName}</span>
              )
            ) : (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Plus className="size-3" />
                Add {config.label.toLowerCase()}
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" side="bottom" sideOffset={4}>
          <DishPicker
            onSelect={handleSelectDish}
            onCustomName={onCustomName}
            onClear={onClearDish}
            onClose={() => setOpen(false)}
            showClear={hasMeal}
          />
        </PopoverContent>
      </Popover>

      <AddIngredientsDialog
        dish={pendingDish}
        open={ingredientsDialogOpen}
        onOpenChange={handleIngredientsDialogClose}
        onConfirm={handleIngredientsConfirm}
      />
    </>
  );
}
