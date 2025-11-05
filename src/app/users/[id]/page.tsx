import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
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
import { User, Package, Calendar } from "lucide-react";

interface UserPageProps {
  params: {
    id: string;
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      inventories: {
        include: {
          _count: {
            select: {
              items: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      _count: {
        select: {
          inventories: true,
          items: true,
          comments: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <div className="flex items-start gap-6">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "User"}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="w-12 h-12" />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {user.name || "Unknown User"}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {user.email}
              </p>
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" && (
                  <Badge variant="destructive">Admin</Badge>
                )}
                <Badge variant="secondary">
                  <Calendar className="w-3 h-3 mr-1" />
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user._count.inventories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Inventories Created
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user._count.items}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Items Added
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {user._count.comments}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Comments Posted
              </div>
            </div>
          </div>
        </div>

        {/* Inventories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              Inventories ({user.inventories.length})
            </h2>
          </div>
          {user.inventories.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No inventories yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.inventories.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link
                        href={`/inventories/${inv.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                      >
                        {inv.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{inv.category}</Badge>
                    </TableCell>
                    <TableCell>{inv._count.items}</TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(inv.createdAt).toLocaleDateString()}
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