import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Add tag to inventory
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tagName } = body;
    const {id} = await params;

    if (!tagName || !tagName.trim()) {
      return NextResponse.json(
        { error: "Tag name is required" },
        { status: 400 }
      );
    }

    // Check permissions
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    const isOwner = inventory.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find or create tag
    let tag = await prisma.tag.findUnique({
      where: { name: tagName.trim().toLowerCase() },
    });

    if (!tag) {
      tag = await prisma.tag.create({
        data: { name: tagName.trim().toLowerCase() },
      });
    }

    // Check if already connected
    const existing = await prisma.inventoryTag.findUnique({
      where: {
        inventoryId_tagId: {
          inventoryId: id,
          tagId: tag.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Tag already added" },
        { status: 400 }
      );
    }

    // Connect tag to inventory
    const inventoryTag = await prisma.inventoryTag.create({
      data: {
        inventoryId: id,
        tagId: tag.id,
      },
      include: {
        tag: true,
      },
    });

    return NextResponse.json(inventoryTag);
  } catch (error) {
    console.error("Error adding tag:", error);
    return NextResponse.json(
      { error: "Failed to add tag" },
      { status: 500 }
    );
  }
}