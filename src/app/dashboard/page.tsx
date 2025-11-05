"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PackageOpen, Users } from "lucide-react";
import CreateInventoryButton from "@/components/inventory/create-inventory-button";
import { useLocale } from "../../components/providers/locale-provider";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { locale } = useLocale();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/dashboard-data")
        .then((res) => res.json())
        .then((data) => {
          setData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">
          {locale === 'ru' ? 'Загрузка...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {locale === 'ru' ? 'Панель Управление' : 'Dashboard'}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {locale === 'ru' ? 'Управляй своими инвентарями и вещами' : 'Manage your inventories and items'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {locale === 'ru' ? 'Мои Инвентари' : 'My Inventories'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {data?.ownedInventories?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <PackageOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {locale === 'ru' ? 'Поделённый Со Мной' : 'Shared With Me'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {data?.accessibleInventories?.length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {locale === 'ru' ? 'Все Вещи' : 'Total Items'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {data?.totalItems || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <PackageOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* My Inventories */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {locale === 'ru' ? 'Мои Инвентари' : 'My Inventories'}
            </h2>
            <CreateInventoryButton />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{locale === 'ru' ? 'Титул' : 'Title'}</TableHead>
                  <TableHead>{locale === 'ru' ? 'Категория' : 'Category'}</TableHead>
                  <TableHead>{locale === 'ru' ? 'Вещи' : 'Items'}</TableHead>
                  <TableHead>{locale === 'ru' ? 'Видность' : 'Visibility'}</TableHead>
                  <TableHead>{locale === 'ru' ? 'Создано' : 'Created'}</TableHead>
                  <TableHead className="text-right">
                    {locale === 'ru' ? 'Дейсвие' : 'Actions'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data?.ownedInventories || data.ownedInventories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <PackageOpen className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {locale === 'ru' 
                            ? 'Пока нет инвентарей. Создайте свой первый!' 
                            : 'No inventories yet. Create your first one!'}
                        </p>
                        <CreateInventoryButton />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.ownedInventories.map((inventory: any) => (
                    <TableRow key={inventory.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/inventories/${inventory.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          {inventory.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{inventory.category}</Badge>
                      </TableCell>
                      <TableCell>{inventory._count.items}</TableCell>
                      <TableCell>
                        {inventory.isPublic ? (
                          <Badge variant="default">
                            {locale === 'ru' ? 'Публичный' : 'Public'}
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            {locale === 'ru' ? 'Приватный' : 'Private'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(inventory.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/inventories/${inventory.id}`}>
                          <Button variant="ghost" size="sm">
                            {locale === 'ru' ? 'Вид' : 'View'}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Shared Inventories */}
        {data?.accessibleInventories && data.accessibleInventories.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {locale === 'es' ? 'Поделённый со мной' : 'Shared With Me'}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === 'ru' ? 'Титул' : 'Title'}</TableHead>
                    <TableHead>{locale === 'ru' ? 'Владелец' : 'Owner'}</TableHead>
                    <TableHead>{locale === 'ru' ? 'Категория' : 'Category'}</TableHead>
                    <TableHead>{locale === 'ru' ? 'Вещи' : 'Items'}</TableHead>
                    <TableHead className="text-right">
                      {locale === 'ru' ? 'Действие' : 'Actions'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.accessibleInventories.map((inventory: any) => (
                    <TableRow key={inventory.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/inventories/${inventory.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                        >
                          {inventory.title}
                        </Link>
                      </TableCell>
                      <TableCell>{inventory.creator.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{inventory.category}</Badge>
                      </TableCell>
                      <TableCell>{inventory._count.items}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/inventories/${inventory.id}`}>
                          <Button variant="ghost" size="sm">
                            {locale === 'ru' ? 'Вид' : 'View'}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}