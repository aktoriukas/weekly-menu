import { UtensilsCrossed } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center animate-pulse">
          <UtensilsCrossed className="size-8 text-primary-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
          <div className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
          <div className="size-2 rounded-full bg-primary animate-bounce" />
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
