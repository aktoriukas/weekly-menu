"use client";

import { useState, useMemo } from "react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import useSWR from "swr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useShoppingList } from "@/hooks/use-shopping";
import type { MenuDay, ShoppingItem } from "@/types";
import type { DateRange } from "react-day-picker";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch");
  }
  return res.json();
};

interface GenerateDialogProps {
  existingItems: ShoppingItem[];
}

export function GenerateDialog({ existingItems }: GenerateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Default to current week
  const today = new Date();
  const defaultStart = startOfWeek(today, { weekStartsOn: 1 });
  const defaultEnd = endOfWeek(today, { weekStartsOn: 1 });

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultStart,
    to: defaultEnd,
  });

  const { generateFromMenu } = useShoppingList();

  // Fetch menu data for the selected date range
  const startStr = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const endStr = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  const { data: menuDays, isLoading: isLoadingMenu } = useSWR<MenuDay[]>(
    startStr && endStr ? `/api/menu?start=${startStr}&end=${endStr}` : null,
    fetcher
  );

  // Compute preview of ingredients that will be added
  const previewIngredients = useMemo(() => {
    if (!menuDays) return [];

    // Collect all ingredients
    const allIngredients: string[] = [];
    for (const day of menuDays) {
      for (const meal of day.meals || []) {
        if (meal.dish?.ingredients) {
          allIngredients.push(...meal.dish.ingredients);
        }
      }
    }

    // Deduplicate (case-insensitive)
    const existingNames = new Set(
      existingItems.map((item) => item.name.toLowerCase().trim())
    );
    const seenIngredients = new Set<string>();
    const newIngredients: string[] = [];

    for (const ingredient of allIngredients) {
      const normalized = ingredient.toLowerCase().trim();
      if (existingNames.has(normalized) || seenIngredients.has(normalized)) {
        continue;
      }
      seenIngredients.add(normalized);
      newIngredients.push(ingredient.trim());
    }

    return newIngredients;
  }, [menuDays, existingItems]);

  const handleGenerate = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select a date range");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateFromMenu(
        format(dateRange.from, "yyyy-MM-dd"),
        format(dateRange.to, "yyyy-MM-dd")
      );
      toast.success(`Added ${result.addedCount} item${result.addedCount !== 1 ? "s" : ""} to your shopping list`);
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate shopping list");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="size-4 mr-2" />
          Generate from Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Generate Shopping List</DialogTitle>
          <DialogDescription>
            Select a date range to add ingredients from your planned meals to the
            shopping list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 min-h-0 overflow-y-auto">
          {/* Date Range Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4 shrink-0" />
                  <span className="truncate">
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      "Pick a date range"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center" side="bottom">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Preview ({previewIngredients.length} new items)
            </label>
            <div className="rounded-md border bg-muted/30 p-3 max-h-[30vh] overflow-y-auto">
              {isLoadingMenu ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : previewIngredients.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  {menuDays?.length === 0
                    ? "No meals planned for this date range"
                    : "All ingredients are already in your list"}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {previewIngredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || previewIngredients.length === 0}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" />
                Add {previewIngredients.length} Items
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
