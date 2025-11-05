"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import AddItemDialog from "./add-item-dialog";
import LikeButton from "@/components/item/like-button";
import { useSession } from "next-auth/react";
import { useLocale } from "@/components/providers/locale-provider";

interface ItemsTabProps {
  inventory: any;
  items: any[];
  fields: any[];
  hasWriteAccess: boolean;
  isOwner: boolean;
}

function isoToDateOnly(iso: Date | string | null | undefined) {
  if (!iso) return "—";

  // If it's a Date object, convert to ISO string first
  const isoString = iso instanceof Date ? iso.toISOString() : iso;

  return isoString.slice(0, 10); // "YYYY-MM-DD"
}


export default function ItemsTab({
  inventory,
  items,
  fields,
  hasWriteAccess,
  isOwner,
}: ItemsTabProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };
  const {locale} = useLocale();

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId]);
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selectedItems.length} items?`)) return;

    try {
      await fetch("/api/items", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIds: selectedItems }),
      });
      setSelectedItems([]);
      router.refresh();
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("Failed to delete items");
    }
  };

  // Get visible fields
  const visibleFields = fields.filter((field) => field.visibleInTable);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {selectedItems.length > 0 && (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.length} {locale === "ru" ? "выбранных элементов" : "selected items"}
              </span>
              {hasWriteAccess && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteSelected}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {locale === "ru" ? "Удалить выбранные" : "Delete Selected"}
                </Button>
              )}
            </>
          )}
        </div>
        {hasWriteAccess && <AddItemDialog inventoryId={inventory.id} fields={fields} />}
      </div>

      {/* Items Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {hasWriteAccess && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={items.length > 0 && selectedItems.length === items.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </TableHead>
              )}
              <TableHead>
                {locale === "ru" ? "Пользовательский ID" : "Custom ID"}
              </TableHead>
              {visibleFields.map((field) => (
                <TableHead key={field.id}>{field.title}</TableHead>
              ))}
              <TableHead>
                {locale === "ru" ? "Создано" : "Created By"}
              </TableHead>
              <TableHead>
                {locale === "ru" ? "Дата создания" : "Created At"}
              </TableHead>
              <TableHead>
                {locale === "ru" ? "Лайки" : "Likes"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={visibleFields.length + (hasWriteAccess ? 5 : 4)}
                  className="text-center py-8"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500 dark:text-gray-400">
                      {locale === "ru"
                        ? "В этом инвентаре нет элементов."
                        : "No items in this inventory."}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                       {hasWriteAccess && "Add your first item!"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  {hasWriteAccess && (
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                        className="rounded"
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{item.customId}</TableCell>
                  {visibleFields.map((field) => {
                    const fieldKey = field.fieldType.toLowerCase();
                    const value = (item as any)[fieldKey];
                    return (
                      <TableCell key={field.id}>
                        {value !== null && value !== undefined ? String(value) : "-"}
                      </TableCell>
                    );
                  })}
                  <TableCell>{item.createdBy?.name || item.createdBy?.email || "—"}</TableCell>
                  <TableCell>{isoToDateOnly(item.createdAt)}</TableCell>
                  <TableCell>
                    <LikeButton
                      itemId={item.id}
                      initialLikeCount={item._count?.likes ?? 0}
                      initialIsLiked={
                        session?.user ? item.likes.some((like: any) => like.userId === session.user.id) : false
                      }
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      {items.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            {locale === "ru" ? "Всего элементов:" : "Total Items:"}
             {items.length} 
             {locale === "ru" ? "элементов" : "items"}
             </span>
          <span>
            {locale === "ru" ? "Показаны элементы:" : "Showing Items:"}
             {items.length} 
             {items.length}
          </span>
        </div>
      )}
    </div>
  );
}
