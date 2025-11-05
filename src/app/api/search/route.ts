import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ inventories: [], items: [] });
    }

    // Search inventories
    const inventories = await prisma.inventory.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    // Search items
    const items = await prisma.item.findMany({
      where: {
        OR: [
          {
            customId: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            stringField1: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            stringField2: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            stringField3: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            textField1: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            textField2: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            textField3: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        inventory: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ inventories, items });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}