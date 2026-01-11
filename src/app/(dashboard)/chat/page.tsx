"use client"

import { ChatWindow } from "@/components/chat/chat-window"
import { useDishes } from "@/hooks/use-dishes"

export default function ChatPage() {
  const { mutate } = useDishes()

  const handleDishAdded = () => {
    // Revalidate dishes cache when a new dish is added via chat
    mutate()
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">
          Get meal suggestions, recipe ideas, and add dishes to your library.
        </p>
      </div>
      <ChatWindow onDishAdded={handleDishAdded} />
    </div>
  )
}
