"use client";

import { useParams, useRouter } from "next/navigation";
import { useDish, useDishes } from "@/hooks/use-dishes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, Pencil, Trash2, UtensilsCrossed, Plus, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { DishForm } from "@/components/dishes/dish-form";
import type { DishCategory, CreateDishInput } from "@/types";

// Strip amount/quantity from ingredient string
// Examples: "2 cups flour" -> "flour", "1/2 lb chicken" -> "chicken", "3 large eggs" -> "eggs"
function stripAmount(ingredient: string): string {
  // Remove leading numbers, fractions, and common units
  const units = [
    "cups?", "tbsps?", "tsps?", "tablespoons?", "teaspoons?",
    "oz", "ounces?", "lbs?", "pounds?", "g", "grams?", "kg", "kilograms?",
    "ml", "milliliters?", "l", "liters?", "litres?",
    "pieces?", "slices?", "cloves?", "heads?", "bunches?", "cans?", "jars?",
    "small", "medium", "large", "extra-large",
  ].join("|");

  // Pattern to match: number (including fractions) + optional unit + optional size descriptor
  const pattern = new RegExp(
    `^[\\d\\s./]+\\s*(?:${units})?\\s*(?:of\\s+)?`,
    "i"
  );

  const stripped = ingredient.replace(pattern, "").trim();

  // If we stripped everything or most of it, return original
  if (stripped.length < 2) {
    return ingredient.trim();
  }

  // Capitalize first letter
  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
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

export default function DishDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dishId = params.id as string;

  const { dish, isLoading, error, mutate: mutateDish } = useDish(dishId);
  const { updateDish, deleteDish } = useDishes();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [addedIngredients, setAddedIngredients] = useState<Set<string>>(new Set());
  const [addingIngredient, setAddingIngredient] = useState<string | null>(null);

  const handleAddIngredient = async (ingredient: string) => {
    const cleanedIngredient = stripAmount(ingredient);
    setAddingIngredient(ingredient);

    try {
      const response = await fetch("/api/shopping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanedIngredient }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to shopping list");
      }

      setAddedIngredients((prev) => new Set(prev).add(ingredient));
      toast.success(`Added "${cleanedIngredient}" to shopping list`);
    } catch (error) {
      toast.error("Failed to add to shopping list");
    } finally {
      setAddingIngredient(null);
    }
  };

  const handleUpdate = async (data: CreateDishInput) => {
    setIsUpdating(true);
    try {
      await updateDish(dishId, data);
      await mutateDish();
      toast.success("Dish updated");
      setEditDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update dish");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDish(dishId);
      toast.success("Dish deleted");
      router.push("/dishes");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete dish");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !dish) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Dish not found</p>
            <Button className="mt-4" onClick={() => router.push("/dishes")}>
              Go to Dishes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const category = dish.category as DishCategory | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{dish.name}</h1>
            {category && (
              <Badge variant="secondary" className={categoryColors[category]}>
                {categoryLabels[category]}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Pencil className="size-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="size-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            {dish.description ? (
              <p className="text-muted-foreground">{dish.description}</p>
            ) : (
              <p className="text-muted-foreground italic">No description</p>
            )}
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UtensilsCrossed className="size-5" />
              Ingredients ({dish.ingredients.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Click an ingredient to add it to your shopping list
            </p>
          </CardHeader>
          <CardContent>
            {dish.ingredients.length > 0 ? (
              <TooltipProvider>
                <ul className="space-y-2">
                  {dish.ingredients.map((ingredient, index) => {
                    const isAdded = addedIngredients.has(ingredient);
                    const isAdding = addingIngredient === ingredient;
                    const cleanedName = stripAmount(ingredient);

                    return (
                      <li key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => !isAdded && handleAddIngredient(ingredient)}
                              disabled={isAdded || isAdding}
                              className="flex items-center gap-2 text-sm w-full text-left p-2 -m-2 rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                            >
                              {isAdding ? (
                                <Loader2 className="size-4 animate-spin text-muted-foreground" />
                              ) : isAdded ? (
                                <Check className="size-4 text-green-600" />
                              ) : (
                                <Plus className="size-4 text-muted-foreground" />
                              )}
                              <span className={isAdded ? "line-through text-muted-foreground" : ""}>
                                {ingredient}
                              </span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isAdded
                              ? "Already added"
                              : `Add "${cleanedName}" to shopping list`}
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  })}
                </ul>
              </TooltipProvider>
            ) : (
              <p className="text-muted-foreground italic">No ingredients listed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dish</DialogTitle>
          </DialogHeader>
          <DishForm
            dish={dish}
            onSubmit={handleUpdate}
            onCancel={() => setEditDialogOpen(false)}
            isSubmitting={isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dish</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{dish.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
