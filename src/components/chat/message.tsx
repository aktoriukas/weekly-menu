"use client";

import { cn } from "@/lib/utils";
import { User, Bot, CheckCircle2, XCircle } from "lucide-react";
import type { UIMessage } from "@ai-sdk/react";
import { DishSuggestionCard } from "./dish-suggestion-card";
import type { DishCategory } from "@/types";

interface ToolInvocationPart {
  type: "tool-invocation";
  toolInvocation: {
    toolCallId: string;
    toolName: string;
    state: "partial-call" | "call" | "result";
    args?: {
      name?: string;
      description?: string;
      ingredients?: string[];
      category?: DishCategory;
    };
    result?: {
      success: boolean;
      error?: string;
      dish?: {
        id: string;
        name: string;
        description: string | null;
        ingredients: string[];
        category: DishCategory | null;
      };
    };
  };
}

interface MessageProps {
  message: UIMessage;
  onAddDish?: (dish: {
    name: string;
    description: string;
    ingredients: string[];
    category: DishCategory;
  }) => void;
}

// Simple markdown-like formatting for assistant messages
function formatContent(content: string): React.ReactNode {
  // Split by bold markers **text**
  const parts = content.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Handle line breaks
    return part.split("\n").map((line, lineIndex, arr) => (
      <span key={`${index}-${lineIndex}`}>
        {line}
        {lineIndex < arr.length - 1 && <br />}
      </span>
    ));
  });
}

export function Message({ message, onAddDish }: MessageProps) {
  const isUser = message.role === "user";

  // Extract text content from parts
  const textContent = message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as { type: "text"; text: string }).text)
    .join("");

  // Extract tool invocations
  const toolInvocations = message.parts.filter(
    (part) => part.type === "tool-invocation"
  ) as unknown as ToolInvocationPart[];

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg",
        isUser ? "bg-primary/5" : "bg-muted/50"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 size-8 rounded-full flex items-center justify-center",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary"
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div className="flex-1 space-y-3 overflow-hidden">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {textContent && (
            <div className="whitespace-pre-wrap break-words">
              {formatContent(textContent)}
            </div>
          )}
        </div>

        {/* Render tool invocations */}
        {toolInvocations.map((part) => {
          const invocation = part.toolInvocation;

          if (invocation.toolName === "addDish") {
            // Show loading state while tool is being called
            if (invocation.state === "call" || invocation.state === "partial-call") {
              return (
                <div
                  key={invocation.toolCallId}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Adding dish to your library...
                </div>
              );
            }

            // Show result
            if (invocation.state === "result" && invocation.result) {
              if (invocation.result.success && invocation.result.dish) {
                return (
                  <div
                    key={invocation.toolCallId}
                    className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400"
                  >
                    <CheckCircle2 className="size-4" />
                    Added &quot;{invocation.result.dish.name}&quot; to your dish
                    library!
                  </div>
                );
              } else {
                return (
                  <div
                    key={invocation.toolCallId}
                    className="flex items-center gap-2 text-sm text-destructive"
                  >
                    <XCircle className="size-4" />
                    {invocation.result.error || "Failed to add dish"}
                  </div>
                );
              }
            }
          }

          return null;
        })}

        {/* Show dish cards for suggestions that can be added */}
        {!isUser &&
          toolInvocations.length === 0 &&
          textContent.includes("**Name**:") &&
          onAddDish && (
            <DishSuggestionCard content={textContent} onAdd={onAddDish} />
          )}
      </div>
    </div>
  );
}
