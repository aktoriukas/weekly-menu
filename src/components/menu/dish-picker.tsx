"use client";

import { useState } from "react";
import Link from "next/link";
import { useDishes } from "@/hooks/use-dishes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, ExternalLink, Loader2, Type } from "lucide-react";
import type { DishCategory } from "@/types";
import { DISH_CATEGORIES } from "@/types";

interface DishPickerProps {
  onSelect: (dishId: string) => void;
  onCustomName?: (name: string) => void;
  onClear?: () => void;
  onClose?: () => void;
  showClear?: boolean;
}

export function DishPicker({ onSelect, onCustomName, onClear, onClose, showClear = false }: DishPickerProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DishCategory | null>(null);
  const [customNameInput, setCustomNameInput] = useState("");

  const { dishes, isLoading } = useDishes({ category: selectedCategory });

  // Filter dishes by search term
  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (dishId: string) => {
    onSelect(dishId);
    onClose?.();
  };

  const handleClear = () => {
    onClear?.();
    onClose?.();
  };

  const handleCustomNameSubmit = () => {
    if (customNameInput.trim() && onCustomName) {
      onCustomName(customNameInput.trim());
      setCustomNameInput("");
      onClose?.();
    }
  };

  return (
    <div className="w-[calc(100vw-3rem)] sm:w-72 max-w-72 p-3 space-y-3">
      {/* Custom Name Input */}
      {onCustomName && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Type className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Quick entry</span>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type meal name..."
              value={customNameInput}
              onChange={(e) => setCustomNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCustomNameSubmit();
                }
              }}
              className="h-9"
            />
            <Button
              size="sm"
              onClick={handleCustomNameSubmit}
              disabled={!customNameInput.trim()}
              className="h-9 px-3"
            >
              Add
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-popover px-2 text-muted-foreground">or select dish</span>
            </div>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 size-7"
            onClick={() => setSearch("")}
          >
            <X className="size-3" />
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer text-xs"
          onClick={() => setSelectedCategory(null)}
        >
          All
        </Badge>
        {DISH_CATEGORIES.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer capitalize text-xs"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Dish List */}
      <ScrollArea className="h-48 max-h-[40vh]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : filteredDishes.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            {search ? "No dishes found" : "No dishes available"}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredDishes.map((dish) => (
              <button
                key={dish.id}
                onClick={() => handleSelect(dish.id)}
                className="w-full text-left px-2 py-2 rounded-md hover:bg-accent active:bg-accent transition-colors text-sm"
              >
                <span className="font-medium truncate block">{dish.name}</span>
                {dish.category && (
                  <Badge variant="secondary" className="mt-1 text-xs capitalize">
                    {dish.category}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t gap-2">
        {showClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-destructive hover:text-destructive"
          >
            <X className="size-4 mr-1" />
            Clear
          </Button>
        )}
        <Link href="/dishes" className="ml-auto">
          <Button variant="ghost" size="sm">
            <span className="hidden sm:inline">View All</span>
            <span className="sm:hidden">All</span>
            <ExternalLink className="size-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
