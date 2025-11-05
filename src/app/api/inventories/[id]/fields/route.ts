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
    const { fields } = body;

    // Get inventory and check permissions
    const inventory = await prisma.inventory.findUnique({
      where: { id: params.id },
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

    // Delete existing fields and create new ones
    await prisma.$transaction(async (tx) => {
      // Delete old fields
      await tx.inventoryField.deleteMany({
        where: { inventoryId: params.id },
      });

      // Create new fields with proper indexing
      const fieldCounts: Record<string, number> = {};

      for (let i = 0; i < fields.length; i++) {
        const field = fields[i];
        const baseType = field.fieldType;

        // Track count for this type
        if (!fieldCounts[baseType]) {
          fieldCounts[baseType] = 0;
        }
        const index = fieldCounts[baseType];
        fieldCounts[baseType]++;

        // Create field with indexed type (e.g., STRING_1, STRING_2)
        await tx.inventoryField.create({
          data: {
            inventoryId: params.id,
            fieldType: `${baseType}_${index + 1}`,
            fieldIndex: index,
            title: field.title,
            description: field.description || null,
            visibleInTable: field.visibleInTable,
            order: i,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving fields:", error);
    return NextResponse.json(
      { error: "Failed to save fields" },
      { status: 500 }
    );
  }
}