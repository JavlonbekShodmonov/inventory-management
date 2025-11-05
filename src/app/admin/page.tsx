"use client";

import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Users } from "lucide-react";
import UserActionsCell from "@/components/admin/user-actions-cell";
import { useLocale } from "@/components/providers/locale-provider";

export default async function AdminPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          inventories: true,
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "ADMIN").length,
    regular: users.filter((u) => u.role === "USER").length,
  };

  const { locale } = useLocale();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {locale === "ru" ? "Панель админа" : "Admin Panel"}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {locale === "ru"
              ? "Управление пользователями, разрешениями и доступом к системе"
              : "Manage users, permissions, and system access"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {locale === "ru" ? "Все участники" : "Total Users"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {locale === "ru" ? "Администраторы" : "Administrators"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.admins}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {locale === "ru" ? "Регулярные участники" : "Regular Users"}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.regular}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {locale === "ru" ? "Все Участники" : "All Users"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{locale === "ru" ? "Участник" : "User"}</TableHead>
                  <TableHead>{locale === "ru" ? "Имейл" : "Email"}</TableHead>
                  <TableHead>{locale === "ru" ? "Позиция" : "Role"}</TableHead>
                  <TableHead>
                    {locale === "ru" ? "Инвентари" : "Inventories"}
                  </TableHead>
                  <TableHead>{locale === "ru" ? "Вещи" : "Items"}</TableHead>
                  <TableHead>{locale === "ru" ? "Зарегистрирован" : "Joined"}</TableHead>
                  <TableHead className="text-right">
                    {locale === "ru" ? "Действия" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || (locale === "ru" ? "Участник" : "User")}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <Users className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-medium">
                          {user.name || (locale === "ru" ? "Неизвестный" : "Unknown")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      {user.role === "ADMIN" ? (
                        <Badge variant="destructive">
                          <Shield className="w-3 h-3 mr-1" />
                          {locale === "ru" ? "Админ" : "Admin"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          {locale === "ru" ? "Участник" : "User"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user._count.inventories}</TableCell>
                    <TableCell>{user._count.items}</TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString(
                        locale === "ru" ? "ru-RU" : "en-US"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserActionsCell user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
