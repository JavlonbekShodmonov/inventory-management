import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, isPublic, version } = body;
    const {id} = await params;
    // Get current inventory
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    // Check permissions
    const isOwner = inventory.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optimistic locking check
    if (version !== undefined && inventory.version !== version) {
      return NextResponse.json(
        {
          error:
            "This inventory has been modified by another user. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    // Update inventory
    const updatedInventory = await prisma.inventory.update({
      where: {
        id: id,
        version: inventory.version,
      },
      data: {
        title,
        description,
        category,
        isPublic,
        version: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(updatedInventory);
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 }
    );
  }
}