"use client";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { useLocale } from "@/components/providers/locale-provider";

export default async function TagCloud() {
  const { locale } = useLocale();
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          inventories: true,
        },
      },
    },
    orderBy: {
      inventories: {
        _count: "desc",
      },
    },
    take: 30,
  });

  if (tags.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {locale === "ru" ? "Теги не найдены." : "No tags found."}
      </div>
    );
  }

  // Calculate font sizes based on usage
  const maxCount = Math.max(...tags.map((t) => t._count.inventories));
  const minCount = Math.min(...tags.map((t) => t._count.inventories));

  const getFontSize = (count: number) => {
    if (maxCount === minCount) return "text-base";
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.75) return "text-2xl";
    if (ratio > 0.5) return "text-xl";
    if (ratio > 0.25) return "text-lg";
    return "text-base";
  };

  const getColor = (count: number) => {
    if (maxCount === minCount) return "text-blue-600 dark:text-blue-400";
    const ratio = (count - minCount) / (maxCount - minCount);
    if (ratio > 0.75) return "text-blue-700 dark:text-blue-300";
    if (ratio > 0.5) return "text-blue-600 dark:text-blue-400";
    if (ratio > 0.25) return "text-blue-500 dark:text-blue-500";
    return "text-blue-400 dark:text-blue-600";
  };

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tags/${encodeURIComponent(tag.name)}`}
          className={`${getFontSize(tag._count.inventories)} ${getColor(
            tag._count.inventories
          )} hover:underline font-medium transition-all hover:scale-110`}
          title={`${tag._count.inventories} inventories`}
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}