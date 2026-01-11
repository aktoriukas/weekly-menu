import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center gap-3">
          <div className="size-12 rounded-xl bg-primary flex items-center justify-center">
            <UtensilsCrossed className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">Menu for a Week</h1>
        </div>

        <p className="text-muted-foreground text-lg">
          Welcome! Plan your meals for the week.
        </p>

        <Button asChild size="lg">
          <Link href="/login">Sign in with Google</Link>
        </Button>
      </div>
    </div>
  );
}
