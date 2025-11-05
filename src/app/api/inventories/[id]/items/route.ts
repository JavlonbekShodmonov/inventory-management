import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Generate custom ID based on inventory format
async function generateCustomId(inventoryId: string, format: any[]): Promise<string> {
  let customId = "";

  for (const element of format) {
    switch (element.type) {
      case "text":
        customId += element.value || "";
        break;
      case "sequence":
        // Get the highest sequence number for this inventory
        const lastItem = await prisma.item.findFirst({
          where: { inventoryId },
          orderBy: { createdAt: "desc" },
          select: { customId: true },
        });

        let nextSeq = 1;
        if (lastItem) {
          // Extract sequence number from last item (very basic implementation)
          const matches = lastItem.customId.match(/\d+/g);
          if (matches) {
            const lastSeq = parseInt(matches[matches.length - 1]);
            nextSeq = lastSeq + 1;
          }
        }

        const format = element.format || "000000";
        customId += nextSeq.toString().padStart(format.length, "0");
        break;
      case "random20":
        customId += Math.floor(Math.random() * 1048576)
          .toString(16)
          .toUpperCase()
          .padStart(5, "0");
        break;
      case "random32":
        customId += Math.floor(Math.random() * 4294967296)
          .toString(16)
          .toUpperCase()
          .padStart(8, "0");
        break;
      case "random6":
        customId += Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0");
        break;
      case "random9":
        customId += Math.floor(Math.random() * 1000000000)
          .toString()
          .padStart(9, "0");
        break;
      case "guid":
        customId += crypto.randomUUID();
        break;
      case "datetime":
        const now = new Date();
        customId += now.toISOString().replace(/[-:T.]/g, "").slice(0, 14);
        break;
      default:
        break;
    }
  }

  return customId || `ITEM-${Date.now()}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get inventory
    const inventory = await prisma.inventory.findUnique({
      where: { id: params.id },
      include: {
        accessGrants: true,
      },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    // Check write access
    const isOwner = inventory.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const hasAccess = inventory.accessGrants.some(
      (grant) => grant.userId === session.user.id
    );

    if (!isOwner && !isAdmin && !inventory.isPublic && !hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate custom ID
    const customIdFormat = inventory.customIdFormat as any[];
    const customId = await generateCustomId(params.id, customIdFormat);

    // Create item
    const item = await prisma.item.create({
      data: {
        inventoryId: params.id,
        customId,
        createdById: session.user.id,
        stringField1: body.string_1 || null,
        stringField2: body.string_2 || null,
        stringField3: body.string_3 || null,
        textField1: body.text_1 || null,
        textField2: body.text_2 || null,
        textField3: body.text_3 || null,
        numberField1: body.number_1 ? parseFloat(body.number_1) : null,
        numberField2: body.number_2 ? parseFloat(body.number_2) : null,
        numberField3: body.number_3 ? parseFloat(body.number_3) : null,
        linkField1: body.link_1 || null,
        linkField2: body.link_2 || null,
        linkField3: body.link_3 || null,
        boolField1: body.bool_1 || null,
        boolField2: body.bool_2 || null,
        boolField3: body.bool_3 || null,
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Error creating item:", error);

    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          error:
            "An item with this custom ID already exists. Please try again.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
// Bulk delete items
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemIds } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json(
        { error: "No items specified" },
        { status: 400 }
      );
    }

    // Ensure inventory exists and user has delete access
    const inventory = await prisma.inventory.findUnique({
      where: { id: params.id },
      include: { accessGrants: true },
    });

    if (!inventory) {
      return NextResponse.json({ error: "Inventory not found" }, { status: 404 });
    }

    const isOwner = inventory.creatorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const hasAccess = inventory.accessGrants.some(
      (grant) => grant.userId === session.user.id
    );

    if (!isOwner && !isAdmin && !inventory.isPublic && !hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete only items that belong to this inventory
    const deleteResult = await prisma.item.deleteMany({
      where: {
        id: { in: itemIds },
        inventoryId: params.id,
      },
    });

    return NextResponse.json({ deleted: deleteResult.count });
  } catch (error: any) {
    console.error("Error deleting items:", error);
    return NextResponse.json(
      { error: "Failed to delete items" },
      { status: 500 }
    );
  }
}