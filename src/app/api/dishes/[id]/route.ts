import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DISH_CATEGORIES, type DishCategory } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper to verify dish ownership
async function verifyDishOwnership(dishId: string, userId: string) {
  const membership = await prisma.householdMember.findFirst({
    where: { userId },
  });

  if (!membership) {
    return { error: "No household found", status: 404 };
  }

  const dish = await prisma.dish.findUnique({
    where: { id: dishId },
    include: {
      _count: {
        select: { meals: true },
      },
    },
  });

  if (!dish) {
    return { error: "Dish not found", status: 404 };
  }

  if (dish.householdId !== membership.householdId) {
    return { error: "Forbidden", status: 403 };
  }

  return { dish, membership };
}

// GET: Get single dish
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await verifyDishOwnership(id, session.user.id);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    return NextResponse.json(result.dish);
  } catch (error) {
    console.error("Error fetching dish:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update dish
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await verifyDishOwnership(id, session.user.id);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    const body = await request.json();
    const { name, description, ingredients, category, imageUrl } = body;

    // Build update data object
    const updateData: {
      name?: string;
      description?: string | null;
      ingredients?: string[];
      category?: string | null;
      imageUrl?: string | null;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    if (ingredients !== undefined) {
      if (!Array.isArray(ingredients)) {
        return NextResponse.json(
          { error: "Ingredients must be an array" },
          { status: 400 }
        );
      }
      updateData.ingredients = ingredients.filter((i: string) => i.trim());
    }

    if (category !== undefined) {
      if (category && !DISH_CATEGORIES.includes(category as DishCategory)) {
        return NextResponse.json(
          { error: `Invalid category. Must be one of: ${DISH_CATEGORIES.join(", ")}` },
          { status: 400 }
        );
      }
      updateData.category = category || null;
    }

    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl?.trim() || null;
    }

    // Update the dish
    const updatedDish = await prisma.dish.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { meals: true },
        },
      },
    });

    return NextResponse.json(updatedDish);
  } catch (error) {
    console.error("Error updating dish:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete dish
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const result = await verifyDishOwnership(id, session.user.id);

    if ("error" in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // Check if dish is used in any meals
    const mealCount = result.dish._count.meals;

    // Parse query params for force delete option
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    if (mealCount > 0 && !force) {
      return NextResponse.json(
        {
          error: `This dish is used in ${mealCount} meal(s). Set ?force=true to delete anyway.`,
          mealCount,
        },
        { status: 409 }
      );
    }

    // Delete the dish (cascade will handle meals due to schema)
    await prisma.dish.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting dish:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
