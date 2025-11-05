"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
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

export default function CreateInventoryButton() {
  const { locale } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Equipment",
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/inventories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create inventory");
      }

      const inventory = await response.json();
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "Equipment",
        isPublic: false,
      });
      router.push(`/inventories/${inventory.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error creating inventory:", error);
      alert("Failed to create inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {locale === "ru" ? "Создать инвентарь" : "Create Inventory"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {locale === "ru"
                ? "Создать новый инвентарь"
                : "Create New Inventory"}
            </DialogTitle>
            <DialogDescription>
              {locale === "ru"
                ? "Заполните поля ниже, чтобы создать новый инвентарь."
                : "Fill in the fields below to create a new inventory."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">
                {locale === "ru" ? "Название *" : "Title *"}
              </Label>
              <Input
                id="title"
                placeholder="e.g., Office Equipment"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">
                {locale === "ru" ? "Описание *" : "Description *"}
              </Label>
              <Textarea
                id="description"
                placeholder="Describe what this inventory will track..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                required
              />
            </div>
            <div className="grid gap-2">
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
                  : "Make inventory public"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              {locale === "ru" ? "Отмена" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {locale === "ru" ? "Создать инвентарь" : "Create Inventory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}