"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2, UtensilsCrossed } from "lucide-react";
import type { DishWithCount } from "@/hooks/use-dishes";
import type { DishCategory } from "@/types";

interface DishCardProps {
  dish: DishWithCount;
  onEdit: (dish: DishWithCount) => void;
  onDelete: (dish: DishWithCount) => void;
}

const categoryColors: Record<DishCategory, string> = {
  breakfast: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  lunch: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  dinner: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  snack: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  dessert: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  any: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const categoryLabels: Record<DishCategory, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  dessert: "Dessert",
  any: "Any Meal",
};

export function DishCard({ dish, onEdit, onDelete }: DishCardProps) {
  const category = dish.category as DishCategory | null;
  const ingredientCount = dish.ingredients?.length ?? 0;

  return (
    <Card className="group relative hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1">{dish.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-1"
              >
                <MoreVertical className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(dish)}>
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(dish)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {category && (
          <Badge variant="secondary" className={categoryColors[category]}>
            {categoryLabels[category]}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {dish.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {dish.description}
          </p>
        )}
        {ingredientCount > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Ingredients:</p>
            <div className="flex flex-wrap gap-1">
              {dish.ingredients.map((ingredient, index) => (
                <span
                  key={index}
                  className="text-xs bg-muted px-2 py-0.5 rounded-full"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <UtensilsCrossed className="size-4" />
            {ingredientCount} ingredient{ingredientCount !== 1 ? "s" : ""}
          </span>
          {dish._count.meals > 0 && (
            <span className="text-xs">
              Used in {dish._count.meals} meal{dish._count.meals !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
