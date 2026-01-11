import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: Accept invitation (find by current user's email, add user to household)
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();

    // Find a pending invitation for this user's email
    const invite = await prisma.householdInvite.findFirst({
      where: {
        email: userEmail,
        expiresAt: { gt: new Date() },
      },
      include: {
        household: true,
      },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "No pending invitation found for your email" },
        { status: 404 }
      );
    }

    // Check if user is already a member of the target household
    const existingMembership = await prisma.householdMember.findUnique({
      where: {
        userId_householdId: {
          userId: session.user.id,
          householdId: invite.householdId,
        },
      },
    });

    if (existingMembership) {
      // Delete the invite since user is already a member
      await prisma.householdInvite.delete({
        where: { id: invite.id },
      });

      return NextResponse.json(
        { error: "You are already a member of this household" },
        { status: 400 }
      );
    }

    // Get user's current household membership (they may have their own household)
    const currentMembership = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
    });

    // Use a transaction to handle the membership transfer
    await prisma.$transaction(async (tx) => {
      // If user has a current household and is the owner, handle it
      if (currentMembership) {
        if (currentMembership.role === "OWNER") {
          // Check if there are other members in the current household
          const otherMembers = await tx.householdMember.findMany({
            where: {
              householdId: currentMembership.householdId,
              userId: { not: session.user.id },
            },
          });

          if (otherMembers.length === 0) {
            // Delete the empty household
            await tx.household.delete({
              where: { id: currentMembership.householdId },
            });
          } else {
            // Transfer ownership to the first other member
            await tx.householdMember.update({
              where: { id: otherMembers[0].id },
              data: { role: "OWNER" },
            });
            // Remove user from current household
            await tx.householdMember.delete({
              where: { id: currentMembership.id },
            });
          }
        } else {
          // User is a member, just remove them
          await tx.householdMember.delete({
            where: { id: currentMembership.id },
          });
        }
      }

      // Add user to the new household
      await tx.householdMember.create({
        data: {
          userId: session.user.id,
          householdId: invite.householdId,
          role: "MEMBER",
        },
      });

      // Delete the invitation
      await tx.householdInvite.delete({
        where: { id: invite.id },
      });
    });

    // Fetch the new household with members
    const newHousehold = await prisma.household.findUnique({
      where: { id: invite.householdId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        },
        invites: {
          where: {
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return NextResponse.json(newHousehold);
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
