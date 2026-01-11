import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DISH_CATEGORIES, type DishCategory } from "@/types";

// System prompt for the meal planning assistant
const SYSTEM_PROMPT = `You are a helpful meal planning assistant for a household. You help users discover new dishes, get recipe ideas, and plan their meals.

Your capabilities:
1. Suggest dishes based on ingredients the user has available
2. Provide random dish ideas for inspiration
3. Help plan meals for different times of day (breakfast, lunch, dinner, snacks, desserts)
4. Add dishes to the user's household dish library when they confirm

When suggesting a dish, always format it clearly with:
- **Name**: [dish name]
- **Category**: [breakfast/lunch/dinner/snack/dessert/any]
- **Description**: [brief description of the dish]
- **Ingredients**: [comma-separated list of main ingredients]

If the user wants to add a dish to their library, use the addDish tool with the dish details. Only use the tool when the user explicitly confirms they want to add it.

Be conversational and friendly. Ask about:
- Dietary preferences or restrictions
- Available ingredients
- Cuisine preferences
- Time constraints for cooking

Keep responses concise but helpful. Focus on practical, achievable meal suggestions.`;

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user's household
    const membership = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
      include: {
        household: true,
      },
    });

    if (!membership) {
      return new Response(JSON.stringify({ error: "No household found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get user's existing dishes for context
    const existingDishes = await prisma.dish.findMany({
      where: { householdId: membership.householdId },
      select: {
        name: true,
        category: true,
        ingredients: true,
      },
      take: 50, // Limit to keep context manageable
      orderBy: { createdAt: "desc" },
    });

    // Build context about existing dishes
    const dishContext =
      existingDishes.length > 0
        ? `\n\nThe user's household already has these dishes in their library:\n${existingDishes
            .map(
              (d) =>
                `- ${d.name}${d.category ? ` (${d.category})` : ""}${d.ingredients.length > 0 ? `: ${d.ingredients.slice(0, 5).join(", ")}${d.ingredients.length > 5 ? "..." : ""}` : ""}`
            )
            .join("\n")}\n\nConsider these when making suggestions - avoid suggesting duplicates unless the user specifically asks.`
        : "\n\nThe user's dish library is currently empty. Encourage them to add dishes they like!";

    const { messages } = await request.json();

    // Define the addDish tool schema
    const addDishSchema = z.object({
      name: z.string().min(1).max(100).describe("The name of the dish"),
      description: z
        .string()
        .max(500)
        .optional()
        .describe("A brief description of the dish"),
      ingredients: z
        .array(z.string())
        .describe("List of main ingredients for the dish"),
      category: z
        .enum(DISH_CATEGORIES)
        .describe(
          "The meal category: breakfast, lunch, dinner, snack, dessert, or any"
        ),
    });

    const householdId = membership.householdId;

    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: SYSTEM_PROMPT + dishContext,
      messages,
      tools: {
        addDish: tool({
          description:
            "Add a dish to the user's household dish library. Use this when the user confirms they want to save a suggested dish.",
          inputSchema: addDishSchema,
          execute: async ({ name, description, ingredients, category }) => {
            try {
              // Check if dish already exists with this name
              const existingDish = await prisma.dish.findFirst({
                where: {
                  householdId: householdId,
                  name: {
                    equals: name,
                    mode: "insensitive",
                  },
                },
              });

              if (existingDish) {
                return {
                  success: false,
                  error: `A dish named "${name}" already exists in your library.`,
                };
              }

              // Create the dish
              const dish = await prisma.dish.create({
                data: {
                  name: name.trim(),
                  description: description?.trim() || null,
                  ingredients: ingredients.filter((i: string) => i.trim()),
                  category: category as DishCategory,
                  householdId: householdId,
                },
              });

              return {
                success: true,
                dish: {
                  id: dish.id,
                  name: dish.name,
                  description: dish.description,
                  ingredients: dish.ingredients,
                  category: dish.category,
                },
              };
            } catch (error) {
              console.error("Error adding dish:", error);
              return {
                success: false,
                error: "Failed to add dish to library. Please try again.",
              };
            }
          },
        }),
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
