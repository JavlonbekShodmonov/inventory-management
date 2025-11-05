"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Loader2, Search, Users, ArrowUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useLocale } from "@/components/providers/locale-provider";

interface AccessTabProps {
  inventoryId: string;
  accessGrants: any[];
  isPublic: boolean;
}

export default function AccessTab({
  inventoryId,
  accessGrants: initialGrants,
  isPublic: initialIsPublic,
}: AccessTabProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [accessGrants, setAccessGrants] = useState(initialGrants);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "email">("name");
  const { locale } = useLocale();
  // Search users with debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(
          `/api/users/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (response.ok) {
          const users = await response.json();
          // Filter out users who already have access
          const filtered = users.filter(
            (u: any) => !accessGrants.some((g) => g.userId === u.id)
          );
          setSearchResults(filtered);
        }
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, accessGrants]);

  const handleTogglePublic = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/inventories/${inventoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setIsPublic(!isPublic);
      router.refresh();
    } catch (error) {
      console.error("Error toggling public:", error);
      alert("Failed to update public setting");
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/inventories/${inventoryId}/access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) throw new Error("Failed to grant access");

      const newGrant = await response.json();
      setAccessGrants([...accessGrants, newGrant]);
      setSearchQuery("");
      setSearchOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error granting access:", error);
      alert("Failed to grant access");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (grantId: string) => {
    if (!confirm("Remove this user's access?")) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/inventories/${inventoryId}/access/${grantId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to revoke access");

      setAccessGrants(accessGrants.filter((g) => g.id !== grantId));
      router.refresh();
    } catch (error) {
      console.error("Error revoking access:", error);
      alert("Failed to revoke access");
    } finally {
      setLoading(false);
    }
  };

  const sortedGrants = [...accessGrants].sort((a, b) => {
    if (sortBy === "name") {
      const nameA = a.user.name || a.user.email || "";
      const nameB = b.user.name || b.user.email || "";
      return nameA.localeCompare(nameB);
    } else {
      const emailA = a.user.email || "";
      const emailB = b.user.email || "";
      return emailA.localeCompare(emailB);
    }
  });

  return (
    <div className="space-y-6">
      {/* Public/Private Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {locale === "ru" ? "Публичный доступ": "Public Access"}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isPublic
                ? "Anyone who is authenticated can add and edit items in this inventory."
                : "Only you and users you explicitly grant access can add and edit items."}
            </p>
          </div>
          <Button
            onClick={handleTogglePublic}
            disabled={loading}
            variant={isPublic ? "default" : "outline"}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Users className="w-4 h-4 mr-2" />
            )}
            {isPublic ? "Public" : "Private"}
          </Button>
        </div>
      </div>

      {/* Add User */}
      {!isPublic && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Grant Access to Users</h3>
          <div className="space-y-3">
            <Label>
              {locale === "ru" ? "Поиск пользователей для предоставления доступа": "Search users to grant access"}
            </Label>
            <Popover open={searchOpen} onOpenChange={setSearchOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {searchQuery || "Type to search users..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {searchLoading ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        {locale === "ru" ? "Загрузка..." : "Loading..."}
                      </div>
                    ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                      <CommandEmpty>
                        {locale === "ru" ? "Пользователи не найдены." : "No users found."}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {searchResults.map((user) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => handleGrantAccess(user.id)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-3 w-full">
                              {user.image ? (
                                <img
                                  src={user.image}
                                  alt={user.name || "User"}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                  <Users className="w-4 h-4" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-medium">
                                  {user.name || "Unknown"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {locale === "ru" ? "Начните вводить имя или электронную почту пользователя для поиска." : "Start typing a user's name or email to search."}
            </p>
          </div>
        </div>
      )}

      {/* Users with Access */}
      {!isPublic && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">
                {locale === "ru" ? "Пользователи с доступом": "Users with Access"} ({accessGrants.length})
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {locale === "ru" ? "Управляйте пользователями, которым предоставлен доступ к этому инвентарю.": "Manage users who have been granted access to this inventory."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">
                {locale === "ru" ? "Сортировать по": "Sort by"}
              </Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === "name" ? "email" : "name")}
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {sortBy === "name" ? "Name" : "Email"}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            {accessGrants.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>
                  {locale === "ru" ? "Нет пользователей с доступом." : "No users have been granted access."}
                </p>
                <p className="text-sm mt-1">
                  {locale === "ru" ? "Используйте поле выше, чтобы предоставить доступ пользователям." : "Search for users above to grant them access."}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {locale === "ru" ? "Пользователь": "User"}
                    </TableHead>
                    <TableHead>
                      {locale === "ru" ? "Электронная почта": "Email"}
                    </TableHead>
                    <TableHead>
                      {locale === "ru" ? "Предоставлен доступ": "Granted"}
                    </TableHead>
                    <TableHead className="text-right">
                      {locale === "ru" ? "Действия": "Actions"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedGrants.map((grant) => (
                    <TableRow key={grant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {grant.user.image ? (
                            <img
                              src={grant.user.image}
                              alt={grant.user.name || "User"}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                              <Users className="w-4 h-4" />
                            </div>
                          )}
                          <span className="font-medium">
                            {grant.user.name || "Unknown"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {grant.user.email}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(grant.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeAccess(grant.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          {locale === "ru" ? "Удалить": "Remove"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}