"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { DISH_CATEGORIES, type DishCategory, type CreateDishInput } from "@/types";
import type { DishWithCount } from "@/hooks/use-dishes";

interface DishFormProps {
  dish?: DishWithCount | null;
  onSubmit: (data: CreateDishInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const categoryLabels: Record<DishCategory, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  dessert: "Dessert",
  any: "Any Meal",
};

function parseIngredients(text: string): string[] {
  // Support both newlines and commas as separators
  return text
    .split(/[\n,]/)
    .map((i) => i.trim())
    .filter((i) => i.length > 0);
}

function formatIngredients(ingredients: string[]): string {
  return ingredients.join("\n");
}

export function DishForm({ dish, onSubmit, onCancel, isSubmitting = false }: DishFormProps) {
  const [name, setName] = useState(dish?.name ?? "");
  const [description, setDescription] = useState(dish?.description ?? "");
  const [ingredientsText, setIngredientsText] = useState(
    dish?.ingredients ? formatIngredients(dish.ingredients) : ""
  );
  const [category, setCategory] = useState<DishCategory | "">(
    (dish?.category as DishCategory) ?? ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data: CreateDishInput = {
      name: name.trim(),
      description: description.trim() || undefined,
      ingredients: parseIngredients(ingredientsText),
      category: category || undefined,
    };

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter dish name"
          disabled={isSubmitting}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value as DishCategory)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {DISH_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter a description (optional)"
          disabled={isSubmitting}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients</Label>
        <Textarea
          id="ingredients"
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          placeholder="Enter ingredients (one per line or comma-separated)"
          disabled={isSubmitting}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Enter each ingredient on a new line, or separate with commas
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              {dish ? "Updating..." : "Creating..."}
            </>
          ) : dish ? (
            "Update Dish"
          ) : (
            "Create Dish"
          )}
        </Button>
      </div>
    </form>
  );
}
