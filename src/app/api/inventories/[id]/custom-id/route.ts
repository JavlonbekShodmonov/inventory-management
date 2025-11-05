import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { format } = body;

    // Get inventory
    const inventory = await prisma.inventory.findUnique({
      where: { id: params.id },
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

    // Validate format
    if (!Array.isArray(format) || format.length === 0) {
      return NextResponse.json(
        { error: "Format must be a non-empty array" },
        { status: 400 }
      );
    }

    if (format.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 elements allowed" },
        { status: 400 }
      );
    }

    // Update inventory
    const updatedInventory = await prisma.inventory.update({
      where: {
        id: params.id,
      },
      data: {
        customIdFormat: format,
        version: {
          increment: 1,
        },
      },
    });

    return NextResponse.json(updatedInventory);
  } catch (error) {
    console.error("Error updating custom ID format:", error);
    return NextResponse.json(
      { error: "Failed to update custom ID format" },
      { status: 500 }
    );
  }
}