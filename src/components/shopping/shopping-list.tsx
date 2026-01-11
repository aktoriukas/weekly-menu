"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ShoppingItem } from "./shopping-item";
import { useShoppingList } from "@/hooks/use-shopping";

export function ShoppingList() {
  const {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    clearChecked,
    checkedCount,
    totalCount,
  } = useShoppingList();

  const [newItemName, setNewItemName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    setIsAdding(true);
    try {
      await addItem(newItemName.trim());
      setNewItemName("");
      toast.success("Item added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isAdding) {
      handleAddItem();
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await toggleItem(id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const handleUpdate = async (
    id: string,
    data: { name?: string; quantity?: string }
  ) => {
    try {
      await updateItem(id, data);
      toast.success("Item updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update item");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success("Item deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete item");
    }
  };

  const handleClearChecked = async () => {
    if (checkedCount === 0) return;

    setIsClearing(true);
    try {
      await clearChecked();
      toast.success(`Cleared ${checkedCount} item${checkedCount !== 1 ? "s" : ""}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to clear checked items"
      );
    } finally {
      setIsClearing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-destructive">
            Failed to load shopping list. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="size-5" />
            Items
            {totalCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {checkedCount}/{totalCount}
              </Badge>
            )}
          </CardTitle>
          {checkedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChecked}
              disabled={isClearing}
              className="text-destructive hover:text-destructive"
            >
              {isClearing ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="size-4 mr-2" />
              )}
              Clear Checked
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add item input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add an item..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAdding}
          />
          <Button onClick={handleAddItem} disabled={isAdding || !newItemName.trim()}>
            {isAdding ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
          </Button>
        </div>

        {/* Items list */}
        {items.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart className="size-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Your shopping list is empty</p>
            <p className="text-sm text-muted-foreground">
              Add items manually or generate from your weekly menu
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <ShoppingItem
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
