import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Update item
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { customId, version, ...fieldData } = body;

    // Get item with inventory
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        inventory: {
          include: {
            accessGrants: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check write access
    const isOwner = item.inventory.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const hasAccess = item.inventory.accessGrants.some(
      (grant) => grant.userId === session.user.id
    );

    if (!isOwner && !isAdmin && !item.inventory.isPublic && !hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Optimistic locking check
    if (version !== undefined && item.version !== version) {
      return NextResponse.json(
        {
          error:
            "This item has been modified by another user. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    // Update item
    try {
      const updatedItem = await prisma.item.update({
        where: {
          id: params.id,
          version: item.version,
        },
        data: {
          customId,
          stringField1: fieldData.string_1 || null,
          stringField2: fieldData.string_2 || null,
          stringField3: fieldData.string_3 || null,
          textField1: fieldData.text_1 || null,
          textField2: fieldData.text_2 || null,
          textField3: fieldData.text_3 || null,
          numberField1: fieldData.number_1 ? parseFloat(fieldData.number_1) : null,
          numberField2: fieldData.number_2 ? parseFloat(fieldData.number_2) : null,
          numberField3: fieldData.number_3 ? parseFloat(fieldData.number_3) : null,
          linkField1: fieldData.link_1 || null,
          linkField2: fieldData.link_2 || null,
          linkField3: fieldData.link_3 || null,
          boolField1: fieldData.bool_1 ?? null,
          boolField2: fieldData.bool_2 ?? null,
          boolField3: fieldData.bool_3 ?? null,
          version: {
            increment: 1,
          },
        },
      });

      return NextResponse.json(updatedItem);
    } catch (error: any) {
      // Handle unique constraint violation for custom ID
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error:
              "An item with this custom ID already exists in this inventory. Please use a different ID.",
          },
          { status: 409 }
        );
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get item with inventory
    const item = await prisma.item.findUnique({
      where: { id: params.id },
      include: {
        inventory: {
          include: {
            accessGrants: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check write access
    const isOwner = item.inventory.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const hasAccess = item.inventory.accessGrants.some(
      (grant) => grant.userId === session.user.id
    );

    if (!isOwner && !isAdmin && !item.inventory.isPublic && !hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete item
    await prisma.item.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}