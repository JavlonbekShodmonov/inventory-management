"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import TagsInput from "./tags-input";
import { useLocale } from "@/components/providers/locale-provider";

const CATEGORIES = [
  "Equipment",
  "Furniture",
  "Books",
  "Documents",
  "Electronics",
  "Office Supplies",
  "Other",
];

interface SettingsTabProps {
  inventory: any;
}

export default function SettingsTab({ inventory }: SettingsTabProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: inventory.title,
    description: inventory.description,
    category: inventory.category,
    isPublic: inventory.isPublic,
  });
  const { locale } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/inventories/${inventory.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          version: inventory.version,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update inventory");
      }

      alert("Inventory updated successfully!");
      router.refresh();
    } catch (error: any) {
      console.error("Error updating inventory:", error);
      alert(error.message || "Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">
        {locale === "ru" ? "Настройки инвентаря" : "Inventory Settings"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="title">
            {locale === "ru" ? "Название" : "Title"}
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            {locale === "ru" ? "Описание" : "Description"}
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
            <Label htmlFor="category">
              {locale === "ru" ? "Категория" : "Category"}
            </Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) =>
              setFormData({ ...formData, isPublic: e.target.checked })
            }
            className="rounded"
          />
          <Label htmlFor="isPublic" className="cursor-pointer">
            {locale === "ru"
              ? "Сделать инвентарь общедоступным"
              : "Make Inventory Public"}
          </Label>
        </div>

        <div className="space-y-2">
          <Label>
            {locale === "ru" ? "Теги инвентаря" : "Inventory Tags"}
          </Label>
          <TagsInput
            inventoryId={inventory.id}
            initialTags={inventory.tags || []}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {locale === "ru" ? "Сохранить изменения" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.refresh()}
          >
            {locale === "ru" ? "Сбросить" : "Reset"}
          </Button>
        </div>
      </form>
    </div>
  );
}
