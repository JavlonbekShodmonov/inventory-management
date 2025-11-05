import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Add like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
const {id} = await params;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if item exists
    const item = await prisma.item.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if user already liked this item
    const existingLike = await prisma.like.findUnique({
      where: {
        itemId_userId: {
          itemId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      return NextResponse.json(
        { error: "You already liked this item" },
        { status: 400 }
      );
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        itemId: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(like);
  } catch (error: any) {
    console.error("Error creating like:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "You already liked this item" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create like" },
      { status: 500 }
    );
  }
}

// Remove like
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {id} = await params;
    // Find and delete like
    const like = await prisma.like.findUnique({
      where: {
        itemId_userId: {
          itemId: id,
          userId: session.user.id,
        },
      },
    });

    if (!like) {
      return NextResponse.json(
        { error: "Like not found" },
        { status: 404 }
      );
    }

    await prisma.like.delete({
      where: {
        id: like.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting like:", error);
    return NextResponse.json(
      { error: "Failed to delete like" },
      { status: 500 }
    );
  }
}