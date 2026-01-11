"use client";

import { ShoppingList } from "@/components/shopping/shopping-list";
import { GenerateDialog } from "@/components/shopping/generate-dialog";
import { useShoppingList } from "@/hooks/use-shopping";

export default function ShoppingPage() {
  const { items } = useShoppingList();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shopping List</h1>
          <p className="text-muted-foreground">
            Manage your shopping list and generate from planned meals.
          </p>
        </div>
        <GenerateDialog existingItems={items} />
      </div>

      <ShoppingList />
    </div>
  );
}
