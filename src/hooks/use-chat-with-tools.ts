"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useCallback, useMemo, useRef } from "react";
import type { DishCategory } from "@/types";

// Type for dish added via the addDish tool
export interface AddedDish {
  id: string;
  name: string;
  description: string | null;
  ingredients: string[];
  category: DishCategory | null;
}

// Tool result types
interface AddDishSuccess {
  success: true;
  dish: AddedDish;
}

interface AddDishError {
  success: false;
  error: string;
}

type AddDishResult = AddDishSuccess | AddDishError;

// Type for tool invocation info
export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  state: "partial-call" | "call" | "result";
  args?: Record<string, unknown>;
  result?: unknown;
}

export interface UseChatWithToolsOptions {
  id?: string;
  onDishAdded?: (dish: AddedDish) => void;
  onDishAddError?: (error: string) => void;
  onError?: (error: Error) => void;
  onFinish?: () => void;
}

export function useChatWithTools(options: UseChatWithToolsOptions = {}) {
  const { id, onDishAdded, onDishAddError, onError, onFinish } = options;

  // Track dishes added during this conversation
  const [addedDishes, setAddedDishes] = useState<AddedDish[]>([]);

  // Track processed tool calls to avoid duplicates
  const processedToolCalls = useRef(new Set<string>());

  // Create transport instance
  const transportRef = useRef(
    new DefaultChatTransport({
      api: "/api/chat",
    })
  );

  const chat = useChat({
    id,
    transport: transportRef.current,
    onError,
    onFinish: () => {
      onFinish?.();
    },
  });

  // Process tool results from messages
  const processToolResults = useCallback(
    (messages: UIMessage[]) => {
      for (const message of messages) {
        if (message.role !== "assistant") continue;

        // Check for tool invocations in the message parts
        for (const part of message.parts) {
          if (part.type !== "tool-invocation") continue;

          const invocation = part as unknown as ToolInvocation;
          if (invocation.toolName !== "addDish") continue;
          if (invocation.state !== "result") continue;
          if (processedToolCalls.current.has(invocation.toolCallId)) continue;

          const result = invocation.result as AddDishResult;
          processedToolCalls.current.add(invocation.toolCallId);

          if (result.success) {
            setAddedDishes((prev) => [...prev, result.dish]);
            onDishAdded?.(result.dish);
          } else {
            onDishAddError?.(result.error);
          }
        }
      }
    },
    [onDishAdded, onDishAddError]
  );

  // Watch for new messages and process tool results
  const messagesWithToolProcessing = useMemo(() => {
    processToolResults(chat.messages);
    return chat.messages;
  }, [chat.messages, processToolResults]);

  // Clear added dishes (useful when starting a new conversation)
  const clearAddedDishes = useCallback(() => {
    setAddedDishes([]);
    processedToolCalls.current.clear();
  }, []);

  // Reset function to start fresh
  const reset = useCallback(() => {
    clearAddedDishes();
    chat.setMessages([]);
  }, [chat, clearAddedDishes]);

  return {
    ...chat,
    messages: messagesWithToolProcessing,
    addedDishes,
    clearAddedDishes,
    reset,
  };
}
