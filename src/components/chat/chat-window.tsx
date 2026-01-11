"use client";

import { useRef, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Loader2, Sparkles, Coffee, Moon, Utensils, Shuffle } from "lucide-react";
import { Message } from "./message";
import {
  useChatWithTools,
  type AddedDish,
} from "@/hooks/use-chat-with-tools";
import type { DishCategory } from "@/types";
import { toast } from "sonner";

interface ChatWindowProps {
  onDishAdded?: (dish: AddedDish) => void;
}

const quickActions = [
  {
    label: "What can I make with...",
    prompt: "What dishes can I make with ",
    icon: Utensils,
    placeholder: true,
  },
  {
    label: "Breakfast idea",
    prompt: "Suggest a delicious breakfast idea that's easy to make.",
    icon: Coffee,
    placeholder: false,
  },
  {
    label: "Quick dinner",
    prompt: "Suggest a quick and easy dinner recipe that takes less than 30 minutes to prepare.",
    icon: Moon,
    placeholder: false,
  },
  {
    label: "Surprise me!",
    prompt: "Surprise me with a random dish suggestion! Pick any cuisine or meal type.",
    icon: Shuffle,
    placeholder: false,
  },
];

export function ChatWindow({ onDishAdded }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    sendMessage,
    status,
    error,
    addedDishes,
  } = useChatWithTools({
    onDishAdded: (dish) => {
      toast.success(`Added "${dish.name}" to your dish library!`);
      onDishAdded?.(dish);
    },
    onDishAddError: (error) => {
      toast.error(error);
    },
    onError: (err) => {
      toast.error(err.message || "Something went wrong");
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const input = inputRef.current;
    if (!input || !input.value.trim() || isLoading) return;

    const message = input.value.trim();
    input.value = "";
    await sendMessage({ text: message });
  };

  const handleQuickAction = async (action: (typeof quickActions)[number]) => {
    if (isLoading) return;

    if (action.placeholder) {
      // For "What can I make with..." - focus input with partial prompt
      if (inputRef.current) {
        inputRef.current.value = action.prompt;
        inputRef.current.focus();
      }
    } else {
      // Send the prompt directly
      await sendMessage({ text: action.prompt });
    }
  };

  const handleAddDishFromSuggestion = async (dish: {
    name: string;
    description: string;
    ingredients: string[];
    category: DishCategory;
  }) => {
    // Ask the AI to add the dish using the tool
    await sendMessage({
      text: `Please add this dish to my library: "${dish.name}" - ${dish.description}. Category: ${dish.category}. Ingredients: ${dish.ingredients.join(", ")}`,
    });
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-12rem)] border-0 shadow-none">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-8">
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">AI Meal Planning Assistant</h3>
              <p className="text-muted-foreground max-w-md">
                I can help you discover new dishes, suggest meals based on ingredients you have,
                and add recipes directly to your dish library.
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-auto py-3 px-4 flex flex-col items-center gap-2"
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                >
                  <action.icon className="size-5" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onAddDish={handleAddDishFromSuggestion}
              />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 p-4 rounded-lg bg-muted/50">
                <div className="flex-shrink-0 size-8 rounded-full bg-secondary flex items-center justify-center">
                  <Loader2 className="size-4 animate-spin" />
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            {/* Error display */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error.message || "Something went wrong. Please try again."}
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Added dishes summary */}
      {addedDishes.length > 0 && (
        <div className="px-4 py-2 border-t bg-green-50 dark:bg-green-950/20">
          <p className="text-xs text-green-700 dark:text-green-300">
            {addedDishes.length} dish{addedDishes.length !== 1 ? "es" : ""} added
            this session:{" "}
            {addedDishes.map((d) => d.name).join(", ")}
          </p>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Ask for meal suggestions..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading} size="icon">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        {/* Quick actions when there are messages */}
        {messages.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {quickActions.slice(1).map((action) => (
              <Button
                key={action.label}
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => handleQuickAction(action)}
                disabled={isLoading}
              >
                <action.icon className="size-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </form>
    </Card>
  );
}
