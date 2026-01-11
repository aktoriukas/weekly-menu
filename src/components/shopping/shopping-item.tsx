"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingItem as ShoppingItemType } from "@/types";

interface ShoppingItemProps {
  item: ShoppingItemType;
  onToggle: (id: string) => void;
  onUpdate: (id: string, data: { name?: string; quantity?: string }) => void;
  onDelete: (id: string) => void;
}

export function ShoppingItem({
  item,
  onToggle,
  onUpdate,
  onDelete,
}: ShoppingItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editQuantity, setEditQuantity] = useState(item.quantity || "");

  const handleSave = () => {
    if (editName.trim()) {
      onUpdate(item.id, {
        name: editName.trim(),
        quantity: editQuantity.trim() || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditName(item.name);
    setEditQuantity(item.quantity || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 rounded-lg">
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
          placeholder="Item name"
          autoFocus
        />
        <Input
          value={editQuantity}
          onChange={(e) => setEditQuantity(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-24"
          placeholder="Qty"
        />
        <Button size="icon-sm" variant="ghost" onClick={handleSave}>
          <Check className="size-4" />
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={handleCancel}>
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors",
        item.checked && "opacity-60"
      )}
    >
      <Checkbox
        id={`item-${item.id}`}
        checked={item.checked}
        onCheckedChange={() => onToggle(item.id)}
        className="size-5"
      />
      <div className="flex-1 min-w-0">
        <label
          htmlFor={`item-${item.id}`}
          className={cn(
            "block cursor-pointer",
            item.checked && "line-through text-muted-foreground"
          )}
        >
          {item.name}
        </label>
        {item.quantity && (
          <span className="text-sm text-muted-foreground">{item.quantity}</span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          disabled={item.checked}
        >
          <Pencil className="size-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onDelete(item.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
