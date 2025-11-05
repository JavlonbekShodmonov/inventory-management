import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get latest inventories
    const latestInventories = await prisma.inventory.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
    });

    // Get popular inventories
    const popularInventories = await prisma.inventory.findMany({
      take: 5,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { items: true },
        },
      },
      orderBy: {
        items: {
          _count: "desc",
        },
      },
    });

    return NextResponse.json({
      latest: latestInventories,
      popular: popularInventories,
    });
  } catch (error) {
    console.error("Error fetching home data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}