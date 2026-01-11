import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO, isValid, startOfDay } from "date-fns";

// GET: Get menu days for a date range
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
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");

    if (!startStr || !endStr) {
      return NextResponse.json(
        { error: "start and end date parameters are required" },
        { status: 400 }
      );
    }

    const startDate = parseISO(startStr);
    const endDate = parseISO(endStr);

    if (!isValid(startDate) || !isValid(endDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Fetch menu days with meals and dish details
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
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(menuDays);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create or update a meal for a specific date
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
    const { date, mealType, dishId } = body;

    // Validate required fields
    if (!date || typeof date !== "string") {
      return NextResponse.json(
        { error: "Date is required" },
        { status: 400 }
      );
    }

    if (!mealType || !["BREAKFAST", "LUNCH", "DINNER"].includes(mealType)) {
      return NextResponse.json(
        { error: "Valid mealType is required (BREAKFAST, LUNCH, or DINNER)" },
        { status: 400 }
      );
    }

    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const normalizedDate = startOfDay(parsedDate);

    // If dishId is provided, verify it belongs to the household
    if (dishId) {
      const dish = await prisma.dish.findFirst({
        where: {
          id: dishId,
          householdId: membership.householdId,
        },
      });

      if (!dish) {
        return NextResponse.json(
          { error: "Dish not found" },
          { status: 404 }
        );
      }
    }

    // Find or create the menu day
    let menuDay = await prisma.menuDay.findUnique({
      where: {
        date_householdId: {
          date: normalizedDate,
          householdId: membership.householdId,
        },
      },
    });

    if (!menuDay) {
      menuDay = await prisma.menuDay.create({
        data: {
          date: normalizedDate,
          householdId: membership.householdId,
        },
      });
    }

    // If dishId is null, remove the meal
    if (dishId === null) {
      await prisma.meal.deleteMany({
        where: {
          menuDayId: menuDay.id,
          type: mealType,
        },
      });

      // Return the updated menu day
      const updatedMenuDay = await prisma.menuDay.findUnique({
        where: { id: menuDay.id },
        include: {
          meals: {
            include: {
              dish: true,
            },
          },
        },
      });

      return NextResponse.json(updatedMenuDay);
    }

    // Create or update the meal using upsert
    const meal = await prisma.meal.upsert({
      where: {
        menuDayId_type: {
          menuDayId: menuDay.id,
          type: mealType,
        },
      },
      update: {
        dishId,
      },
      create: {
        type: mealType,
        menuDayId: menuDay.id,
        dishId,
      },
      include: {
        dish: true,
      },
    });

    // Return the updated menu day with all meals
    const updatedMenuDay = await prisma.menuDay.findUnique({
      where: { id: menuDay.id },
      include: {
        meals: {
          include: {
            dish: true,
          },
        },
      },
    });

    return NextResponse.json(updatedMenuDay);
  } catch (error) {
    console.error("Error updating meal:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
