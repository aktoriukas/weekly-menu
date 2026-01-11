"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Loader2, UtensilsCrossed, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { DishForm } from "./dish-form";
import { useDishes } from "@/hooks/use-dishes";
import { DISH_CATEGORIES, type DishCategory, type CreateDishInput } from "@/types";

const categoryLabels: Record<DishCategory | "all", string> = {
  all: "All Categories",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
  dessert: "Dessert",
  any: "Any Meal",
};

export function DishList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<DishCategory | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { dishes, isLoading, error, createDish } = useDishes();

  // Filter dishes based on search and category
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      // Category filter
      if (categoryFilter !== "all" && dish.category !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesDescription = dish.description?.toLowerCase().includes(query);
        const matchesIngredient = dish.ingredients?.some((i) =>
          i.toLowerCase().includes(query)
        );
        return matchesName || matchesDescription || matchesIngredient;
      }

      return true;
    });
  }, [dishes, searchQuery, categoryFilter]);

  const handleCreate = async (data: CreateDishInput) => {
    setIsSubmitting(true);
    try {
      await createDish(data);
      toast.success("Dish created successfully");
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create dish");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load dishes. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(value) => setCategoryFilter(value as DishCategory | "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {DISH_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Dish
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredDishes.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <UtensilsCrossed className="size-12 mx-auto text-muted-foreground mb-4" />
          {dishes.length === 0 ? (
            <>
              <h3 className="text-lg font-medium mb-2">No dishes yet</h3>
              <p className="text-muted-foreground mb-4">
                Start building your recipe collection by adding your first dish.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="size-4 mr-2" />
                Add Your First Dish
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-2">No matching dishes</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
            </>
          )}
        </div>
      )}

      {/* Dish list */}
      {!isLoading && filteredDishes.length > 0 && (
        <div className="border rounded-lg divide-y">
          {filteredDishes.map((dish) => (
            <Link
              key={dish.id}
              href={`/dishes/${dish.id}`}
              className="flex items-center justify-between p-4 hover:bg-accent transition-colors"
            >
              <span className="font-medium">{dish.name}</span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{dish.ingredients?.length || 0} ingredients</span>
                <ChevronRight className="size-4" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Add dish dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Dish</DialogTitle>
            <DialogDescription>
              Create a new dish for your meal planning.
            </DialogDescription>
          </DialogHeader>
          <DishForm
            onSubmit={handleCreate}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
