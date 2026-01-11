"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Dish } from "@/types";

// Strip amount/quantity from ingredient string
function stripAmount(ingredient: string): string {
  const units = [
    "cups?", "tbsps?", "tsps?", "tablespoons?", "teaspoons?",
    "oz", "ounces?", "lbs?", "pounds?", "g", "grams?", "kg", "kilograms?",
    "ml", "milliliters?", "l", "liters?", "litres?",
    "pieces?", "slices?", "cloves?", "heads?", "bunches?", "cans?", "jars?",
    "small", "medium", "large", "extra-large",
  ].join("|");

  const pattern = new RegExp(
    `^[\\d\\s./]+\\s*(?:${units})?\\s*(?:of\\s+)?`,
    "i"
  );

  const stripped = ingredient.replace(pattern, "").trim();

  if (stripped.length < 2) {
    return ingredient.trim();
  }

  return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

interface AddIngredientsDialogProps {
  dish: Dish | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AddIngredientsDialog({
  dish,
  open,
  onOpenChange,
  onConfirm,
}: AddIngredientsDialogProps) {
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);

  // Reset selection when dialog opens with new dish
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && dish) {
      // Select all ingredients by default
      setSelectedIngredients(new Set(dish.ingredients));
    }
    onOpenChange(newOpen);
  };

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (!dish) return;
    if (selectedIngredients.size === dish.ingredients.length) {
      setSelectedIngredients(new Set());
    } else {
      setSelectedIngredients(new Set(dish.ingredients));
    }
  };

  const handleAddToShoppingList = async () => {
    if (selectedIngredients.size === 0) {
      onConfirm();
      onOpenChange(false);
      return;
    }

    setIsAdding(true);
    try {
      // Add each ingredient to shopping list (with amounts stripped)
      const promises = Array.from(selectedIngredients).map((ingredient) =>
        fetch("/api/shopping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: stripAmount(ingredient) }),
        })
      );

      await Promise.all(promises);
      toast.success(`Added ${selectedIngredients.size} item(s) to shopping list`);
      onConfirm();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add items to shopping list");
    } finally {
      setIsAdding(false);
    }
  };

  const handleSkip = () => {
    onConfirm();
    onOpenChange(false);
  };

  if (!dish) return null;

  const hasIngredients = dish.ingredients && dish.ingredients.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5 shrink-0" />
            <span className="truncate">Add to Shopping List?</span>
          </DialogTitle>
          <DialogDescription className="break-words">
            {hasIngredients
              ? `Would you like to add ingredients from "${dish.name}" to your shopping list?`
              : `"${dish.name}" has no ingredients listed.`}
          </DialogDescription>
        </DialogHeader>

        {hasIngredients && (
          <div className="space-y-3 flex-1 min-h-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIngredients.size} of {dish.ingredients.length} selected
              </span>
              <Button variant="ghost" size="sm" onClick={toggleAll} className="shrink-0">
                {selectedIngredients.size === dish.ingredients.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </div>

            <ScrollArea className="h-48 max-h-[40vh] border rounded-md p-3">
              <div className="space-y-3">
                {dish.ingredients.map((ingredient) => (
                  <div key={ingredient} className="flex items-start gap-3">
                    <Checkbox
                      id={ingredient}
                      checked={selectedIngredients.has(ingredient)}
                      onCheckedChange={() => toggleIngredient(ingredient)}
                      className="mt-0.5"
                    />
                    <Label
                      htmlFor={ingredient}
                      className="text-sm font-normal cursor-pointer leading-tight break-words"
                    >
                      {ingredient}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleSkip} disabled={isAdding} className="w-full sm:w-auto">
            Skip
          </Button>
          {hasIngredients && (
            <Button
              onClick={handleAddToShoppingList}
              disabled={isAdding || selectedIngredients.size === 0}
              className="w-full sm:w-auto"
            >
              {isAdding ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="size-4 mr-2" />
                  Add {selectedIngredients.size} Item(s)
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
