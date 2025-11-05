import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tag as TagIcon, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

interface TagPageProps {
  params: Promise<{
    name: string;
}>;
}

export default async function TagPage({ params }: TagPageProps) {
  const {name} = await params;
  const tagName = decodeURIComponent(name);

  const tag = await prisma.tag.findUnique({
    where: { name: tagName },
    include: {
      inventories: {
        include: {
          inventory: {
            include: {
              creator: true,
              _count: {
                select: {
                  items: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!tag) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TagIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              #{tagName}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {tag.inventories.length}{" "}
            {tag.inventories.length === 1 ? "inventory" : "inventories"} with
            this tag
          </p>
        </div>

        {/* Inventories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {tag.inventories.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No inventories found with this tag
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Creator</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tag.inventories.map(({ inventory }) => (
                  <TableRow key={inventory.id}>
                    <TableCell>
                      <Link
                        href={`/inventories/${inventory.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {inventory.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{inventory.category}</Badge>
                    </TableCell>
                    <TableCell>{inventory._count.items}</TableCell>
                    <TableCell>
                      {inventory.creator.name || inventory.creator.email}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}