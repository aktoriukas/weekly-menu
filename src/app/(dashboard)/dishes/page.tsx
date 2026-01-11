import { DishList } from "@/components/dishes/dish-list";

export default function DishesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dishes</h1>
        <p className="text-muted-foreground">
          Manage your dish collection. Add, edit, and organize your favorite
          recipes.
        </p>
      </div>
      <DishList />
    </div>
  );
}
