"use client";

import { ShoppingList } from "@/components/shopping/shopping-list";
import { GenerateDialog } from "@/components/shopping/generate-dialog";
import { useShoppingList } from "@/hooks/use-shopping";

export default function ShoppingPage() {
  const { items } = useShoppingList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Shopping List</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your shopping list and generate from planned meals.
          </p>
        </div>
        <GenerateDialog existingItems={items} />
      </div>

      <ShoppingList />
    </div>
  );
}
