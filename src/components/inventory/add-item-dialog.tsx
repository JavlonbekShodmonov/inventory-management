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
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

interface AddItemDialogProps {
  inventoryId: string;
  fields: any[];
}

export default function AddItemDialog({
  inventoryId,
  fields,
}: AddItemDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { locale } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/inventories/${inventoryId}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create item");
      }

      setOpen(false);
      setFormData({});
      router.refresh();
    } catch (error: any) {
      console.error("Error creating item:", error);
      alert(error.message || "Failed to create item");
    } finally {
      setLoading(false);
    }
  };

  const getFieldInputType = (fieldType: string) => {
    if (fieldType.startsWith("NUMBER")) return "number";
    if (fieldType.startsWith("LINK")) return "url";
    return "text";
  };

  const renderFieldInput = (field: any) => {
    const fieldKey = field.fieldType.toLowerCase();

    if (field.fieldType.startsWith("TEXT")) {
      return (
        <Textarea
          id={fieldKey}
          value={formData[fieldKey] || ""}
          onChange={(e) =>
            setFormData({ ...formData, [fieldKey]: e.target.value })
          }
          placeholder={field.description || `Enter ${field.title.toLowerCase()}`}
          rows={3}
        />
      );
    }

    if (field.fieldType.startsWith("BOOL")) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={fieldKey}
            checked={formData[fieldKey] || false}
            onChange={(e) =>
              setFormData({ ...formData, [fieldKey]: e.target.checked })
            }
            className="rounded"
          />
          <Label htmlFor={fieldKey} className="cursor-pointer text-sm text-gray-600">
            {field.description || "Check if yes"}
          </Label>
        </div>
      );
    }

    return (
      <Input
        id={fieldKey}
        type={getFieldInputType(field.fieldType)}
        value={formData[fieldKey] || ""}
        onChange={(e) => {
          const value =
            field.fieldType.startsWith("NUMBER") && e.target.value
              ? parseFloat(e.target.value)
              : e.target.value;
          setFormData({ ...formData, [fieldKey]: value });
        }}
        placeholder={field.description || `Enter ${field.title.toLowerCase()}`}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {locale === "ru" ? "Добавить элемент" : "Add Item"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {locale === "ru" ? "Добавить новый элемент" : "Add New Item"}
            </DialogTitle>
            <DialogDescription>
              {locale === "ru"
                ? "Заполните поля ниже, чтобы добавить новый элемент в инвентарь."
                : "Fill in the fields below to add a new item to the inventory."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {locale === "ru"
                  ? "Нет доступных полей для этого инвентаря."
                  : "No fields available for this inventory."}
              </div>
            ) : (
              fields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div key={field.id} className="grid gap-2">
                    <Label htmlFor={field.fieldType.toLowerCase()}>
                      {field.title}
                      {field.description && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({field.description})
                        </span>
                      )}
                    </Label>
                    {renderFieldInput(field)}
                  </div>
                ))
            )}
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
            <Button type="submit" disabled={loading || fields.length === 0}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {locale === "ru" ? "Добавить элемент" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}