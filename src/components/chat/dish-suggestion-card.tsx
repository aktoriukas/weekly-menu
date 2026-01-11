"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Check, UtensilsCrossed } from "lucide-react";
import type { DishCategory } from "@/types";

interface ParsedDish {
  name: string;
  description: string;
  ingredients: string[];
  category: DishCategory;
}

interface DishSuggestionCardProps {
  content: string;
  onAdd: (dish: ParsedDish) => void;
}

const categoryColors: Record<DishCategory, string> = {
  breakfast:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
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

// Parse dish details from AI message content
function parseDishFromContent(content: string): ParsedDish | null {
  try {
    // Extract name: **Name**: [value] or - **Name**: [value]
    const nameMatch = content.match(/\*\*Name\*\*:\s*(.+?)(?:\n|$)/i);
    if (!nameMatch) return null;

    // Extract category
    const categoryMatch = content.match(/\*\*Category\*\*:\s*(.+?)(?:\n|$)/i);
    const categoryRaw = categoryMatch?.[1]?.toLowerCase().trim() || "any";
    const category = (
      ["breakfast", "lunch", "dinner", "snack", "dessert", "any"].includes(
        categoryRaw
      )
        ? categoryRaw
        : "any"
    ) as DishCategory;

    // Extract description
    const descMatch = content.match(/\*\*Description\*\*:\s*(.+?)(?:\n|$)/i);
    const description = descMatch?.[1]?.trim() || "";

    // Extract ingredients
    const ingredientsMatch = content.match(
      /\*\*Ingredients\*\*:\s*([\s\S]+?)(?:\n\n|\n-\s*\*\*|$)/i
    );
    let ingredients: string[] = [];
    if (ingredientsMatch) {
      const ingredientsStr = ingredientsMatch[1].trim();
      // Handle comma-separated or newline-separated lists
      ingredients = ingredientsStr
        .split(/[,\n]/)
        .map((i) => i.replace(/^[-*]\s*/, "").trim())
        .filter((i) => i.length > 0);
    }

    return {
      name: nameMatch[1].trim(),
      description,
      ingredients,
      category,
    };
  } catch {
    return null;
  }
}

export function DishSuggestionCard({ content, onAdd }: DishSuggestionCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const dish = parseDishFromContent(content);

  if (!dish) return null;

  const handleAdd = () => {
    onAdd(dish);
    setIsAdded(true);
  };

  return (
    <Card className="mt-3 border-dashed">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{dish.name}</CardTitle>
          {dish.category && (
            <Badge variant="secondary" className={categoryColors[dish.category]}>
              {categoryLabels[dish.category]}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {dish.description && (
          <p className="text-sm text-muted-foreground">{dish.description}</p>
        )}
        {dish.ingredients.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UtensilsCrossed className="size-4 flex-shrink-0" />
            <span className="line-clamp-2">
              {dish.ingredients.slice(0, 5).join(", ")}
              {dish.ingredients.length > 5 && "..."}
            </span>
          </div>
        )}
        <Button
          size="sm"
          variant={isAdded ? "secondary" : "default"}
          onClick={handleAdd}
          disabled={isAdded}
          className="w-full"
        >
          {isAdded ? (
            <>
              <Check className="size-4 mr-2" />
              Added to Library
            </>
          ) : (
            <>
              <Plus className="size-4 mr-2" />
              Add to My Dishes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
