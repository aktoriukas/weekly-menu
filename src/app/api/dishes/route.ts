import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DISH_CATEGORIES, type DishCategory } from "@/types";

// GET: List all dishes for user's household
export async function GET(request: Request) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Build where clause
    const whereClause: {
      householdId: string;
      category?: string;
    } = {
      householdId: membership.householdId,
    };

    // Filter by category if provided and valid
    if (category && DISH_CATEGORIES.includes(category as DishCategory)) {
      whereClause.category = category;
    }

    // Fetch dishes
    const dishes = await prisma.dish.findMany({
      where: whereClause,
      orderBy: [{ name: "asc" }],
      include: {
        _count: {
          select: { meals: true },
        },
      },
    });

    return NextResponse.json(dishes);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create new dish
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
    const { name, description, ingredients, category, imageUrl } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Validate ingredients is an array
    if (ingredients && !Array.isArray(ingredients)) {
      return NextResponse.json(
        { error: "Ingredients must be an array" },
        { status: 400 }
      );
    }

    // Validate category if provided
    if (category && !DISH_CATEGORIES.includes(category as DishCategory)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${DISH_CATEGORIES.join(", ")}` },
        { status: 400 }
      );
    }

    // Create the dish
    const dish = await prisma.dish.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ingredients: ingredients?.filter((i: string) => i.trim()) || [],
        category: category || null,
        imageUrl: imageUrl?.trim() || null,
        householdId: membership.householdId,
      },
      include: {
        _count: {
          select: { meals: true },
        },
      },
    });

    return NextResponse.json(dish, { status: 201 });
  } catch (error) {
    console.error("Error creating dish:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
