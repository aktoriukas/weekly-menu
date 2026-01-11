import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseISO, isValid, startOfDay } from "date-fns";

// GET: Get single day's menu with all meals
export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
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

    const { date: dateStr } = await params;
    const parsedDate = parseISO(dateStr);

    if (!isValid(parsedDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const normalizedDate = startOfDay(parsedDate);

    // Fetch menu day with meals and dish details
    const menuDay = await prisma.menuDay.findUnique({
      where: {
        date_householdId: {
          date: normalizedDate,
          householdId: membership.householdId,
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

    // Return empty day structure if no menu exists
    if (!menuDay) {
      return NextResponse.json({
        id: null,
        date: dateStr,
        householdId: membership.householdId,
        meals: [],
      });
    }

    return NextResponse.json(menuDay);
  } catch (error) {
    console.error("Error fetching menu day:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Clear all meals for a day
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ date: string }> }
) {
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

    const { date: dateStr } = await params;
    const parsedDate = parseISO(dateStr);

    if (!isValid(parsedDate)) {
      return NextResponse.json(
        { error: "Invalid date format. Use YYYY-MM-DD" },
        { status: 400 }
      );
    }

    const normalizedDate = startOfDay(parsedDate);

    // Find the menu day
    const menuDay = await prisma.menuDay.findUnique({
      where: {
        date_householdId: {
          date: normalizedDate,
          householdId: membership.householdId,
        },
      },
    });

    if (!menuDay) {
      return NextResponse.json({ message: "No menu found for this date" });
    }

    // Delete all meals for this day (cascade will handle this, but being explicit)
    await prisma.meal.deleteMany({
      where: {
        menuDayId: menuDay.id,
      },
    });

    // Optionally delete the menu day itself if it has no meals
    await prisma.menuDay.delete({
      where: { id: menuDay.id },
    });

    return NextResponse.json({ message: "Menu cleared successfully" });
  } catch (error) {
    console.error("Error clearing menu day:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
