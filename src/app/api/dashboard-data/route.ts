import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ownedInventories = await prisma.inventory.findMany({
      where: { creatorId: session.user.id },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const accessibleInventories = await prisma.inventory.findMany({
      where: {
        accessGrants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        creator: true,
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totalItems = await prisma.item.count({
      where: {
        inventory: {
          OR: [
            { creatorId: session.user.id },
            { accessGrants: { some: { userId: session.user.id } } },
          ],
        },
      },
    });

    return NextResponse.json({
      ownedInventories,
      accessibleInventories,
      totalItems,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}