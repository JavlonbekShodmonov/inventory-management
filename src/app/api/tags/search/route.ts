import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (query.length < 1) {
      return NextResponse.json([]);
    }

    const tags = await prisma.tag.findMany({
      where: {
        name: {
          startsWith: query,
          mode: "insensitive",
        },
      },
      include: {
        _count: {
          select: {
            inventories: true,
          },
        },
      },
      take: 10,
      orderBy: {
        inventories: {
          _count: "desc",
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error searching tags:", error);
    return NextResponse.json(
      { error: "Failed to search tags" },
      { status: 500 }
    );
  }
}