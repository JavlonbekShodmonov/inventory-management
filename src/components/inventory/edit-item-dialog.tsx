"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocale } from "@/components/providers/locale-provider";

interface EditItemDialogProps {
  item: any;
  fields: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditItemDialog({
  item,
  fields,
  open,
  onOpenChange,
}: EditItemDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({
    customId: item.customId,
  });
  const { locale } = useLocale();

  // Initialize form data when item changes
  useEffect(() => {
    const initialData: Record<string, any> = {
      customId: item.customId,
    };

    fields.forEach((field) => {
      const fieldKey = field.fieldType.toLowerCase();
      initialData[fieldKey] = (item as any)[fieldKey] ?? "";
    });

    setFormData(initialData);
  }, [item, fields]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          version: item.version, // Optimistic locking
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update item");
      }

      onOpenChange(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error updating item:", error);
      setError(error.message || "Failed to update item");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {locale === "ru" ? "Редактировать элемент" : "Edit Item"}
            </DialogTitle>
            <DialogDescription>
              {locale === "ru"
                ? "Внесите изменения в элемент. Пользовательский ID можно редактировать вручную."
                : "Make changes to the item. Custom ID can be edited manually."}
            </DialogDescription>

            <DialogDescription>
              {locale === "ru"
                ? "Элемент версии: " + item.version
                : "Item Version: " + item.version}
</DialogDescription>

{/* ADD THIS */}
{item._count?.likes > 0 && (
  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
    <Heart className="w-4 h-4 fill-red-600 text-red-600" />
    <span>{item._count.likes} {item._count.likes === 1 ? 'like' : 'likes'}</span>
  </div>
)}
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 py-4">
            {/* Custom ID */}
            <div className="grid gap-2">
              <Label htmlFor="customId">
                {locale === "ru" ? "Пользовательский ID *" : "Custom ID *"}
                <span className="ml-2 text-xs text-gray-500">
                  {locale === "ru"
                    ? "(Можно редактировать вручную)"
                    : "(Can be edited manually)"}
                </span>
              </Label>
              <Input
                id="customId"
                value={formData.customId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, customId: e.target.value })
                }
                required
              />
            </div>

            {/* Custom Fields */}
            {fields
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
              ))}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {locale === "ru" ? "Отмена" : "Cancel"}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {locale === "ru" ? "Сохранить изменения" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}