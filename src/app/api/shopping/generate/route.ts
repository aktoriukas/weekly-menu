import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO, isValid, startOfDay } from "date-fns";

// POST: Generate shopping list from week menu
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's household
    const membership = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No household found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { startDate: startDateStr, endDate: endDateStr } = body;

    // Validate dates
    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    const startDate = parseISO(startDateStr);
    const endDate = parseISO(endDateStr);

    if (!isValid(startDate) || !isValid(endDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Get all menu days in the date range with their meals and dishes
    const menuDays = await prisma.menuDay.findMany({
      where: {
        householdId: membership.householdId,
        date: {
          gte: startOfDay(startDate),
          lte: startOfDay(endDate),
        },
      },
      include: {
        meals: {
          include: {
            dish: true,
          },
        },
      },
    });

    // Collect all ingredients from all dishes
    const allIngredients: string[] = [];
    for (const day of menuDays) {
      for (const meal of day.meals) {
        if (meal.dish?.ingredients) {
          allIngredients.push(...meal.dish.ingredients);
        }
      }
    }

    // Get existing shopping items for case-insensitive duplicate detection
    const existingItems = await prisma.shoppingItem.findMany({
      where: {
        householdId: membership.householdId,
      },
      select: {
        name: true,
      },
    });

    const existingNames = new Set(
      existingItems.map((item) => item.name.toLowerCase().trim())
    );

    // Filter out duplicates (case-insensitive) and already existing items
    const seenIngredients = new Set<string>();
    const newIngredients: string[] = [];

    for (const ingredient of allIngredients) {
      const normalized = ingredient.toLowerCase().trim();

      // Skip if already in shopping list or already seen in this batch
      if (existingNames.has(normalized) || seenIngredients.has(normalized)) {
        continue;
      }

      seenIngredients.add(normalized);
      newIngredients.push(ingredient.trim());
    }

    // Create new shopping items
    if (newIngredients.length > 0) {
      await prisma.shoppingItem.createMany({
        data: newIngredients.map((name) => ({
          name,
          householdId: membership.householdId,
        })),
      });
    }

    // Return updated list
    const items = await prisma.shoppingItem.findMany({
      where: {
        householdId: membership.householdId,
      },
      orderBy: [
        { checked: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      addedCount: newIngredients.length,
      items,
    });
  } catch (error) {
    console.error("Error generating shopping list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
