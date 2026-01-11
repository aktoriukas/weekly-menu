import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Create invitation
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find user's household and verify they're the owner
    const membership = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
      include: { household: true },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No household found" },
        { status: 404 }
      );
    }

    if (membership.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the owner can invite members" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.householdMember.findFirst({
      where: {
        householdId: membership.householdId,
        user: { email: normalizedEmail },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this household" },
        { status: 400 }
      );
    }

    // Check if there's already a pending invite for this email
    const existingInvite = await prisma.householdInvite.findFirst({
      where: {
        householdId: membership.householdId,
        email: normalizedEmail,
        expiresAt: { gt: new Date() },
      },
    });

    if (existingInvite) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Create the invite (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.householdInvite.create({
      data: {
        email: normalizedEmail,
        householdId: membership.householdId,
        invitedBy: session.user.id,
        expiresAt,
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: List pending invitations for household
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user's household
    const membership = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No household found" },
        { status: 404 }
      );
    }

    // Get pending invitations
    const invites = await prisma.householdInvite.findMany({
      where: {
        householdId: membership.householdId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
