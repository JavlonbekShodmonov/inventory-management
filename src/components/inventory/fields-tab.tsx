"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Plus, GripVertical, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/providers/locale-provider";

const FIELD_TYPES = [
  { value: "STRING", label: "Single-line Text", max: 3 },
  { value: "TEXT", label: "Multi-line Text", max: 3 },
  { value: "NUMBER", label: "Number", max: 3 },
  { value: "LINK", label: "Link/Document", max: 3 },
  { value: "BOOL", label: "Checkbox (Yes/No)", max: 3 },
];

interface Field {
  id?: string;
  fieldType: string;
  title: string;
  description: string;
  visibleInTable: boolean;
  order: number;
}

interface FieldsTabProps {
  inventoryId: string;
  existingFields: any[];
}

export default function FieldsTab({
  inventoryId,
  existingFields,
}: FieldsTabProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState<Field[]>(
    existingFields.map((f) => ({
      id: f.id,
      fieldType: f.fieldType.replace(/_\d+$/, ""), // STRING_1 -> STRING
      title: f.title,
      description: f.description || "",
      visibleInTable: f.visibleInTable,
      order: f.order,
    }))
  );
  const { locale } = useLocale();

  const getFieldCount = (type: string) => {
    return fields.filter((f) => f.fieldType === type).length;
  };

  const canAddField = (type: string) => {
    const typeConfig = FIELD_TYPES.find((t) => t.value === type);
    return getFieldCount(type) < (typeConfig?.max || 3);
  };

  const addField = (type: string) => {
    if (!canAddField(type)) return;

    const count = getFieldCount(type);
    const newField: Field = {
      fieldType: type,
      title: "",
      description: "",
      visibleInTable: true,
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<Field>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const handleSave = async () => {
    // Validate
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].title.trim()) {
        alert(`Field #${i + 1} must have a title`);
        return;
      }
    }

    // Check limits
    for (const typeConfig of FIELD_TYPES) {
      const count = getFieldCount(typeConfig.value);
      if (count > typeConfig.max) {
        alert(
          `You can only have up to ${typeConfig.max} ${typeConfig.label} fields`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/inventories/${inventoryId}/fields`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        throw new Error("Failed to save fields");
      }

      alert("Fields saved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error saving fields:", error);
      alert("Failed to save fields");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold">Custom Fields</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {locale === "ru"
              ? "Добавляйте и настраивайте пользовательские поля для элементов вашего инвентаря."
              : "Add and customize custom fields for your inventory items."}
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {locale === "ru" ? "Сохранить поля" : "Save Fields"}
        </Button>
      </div>

      {/* Add Field Buttons */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {FIELD_TYPES.map((type) => (
          <Button
            key={type.value}
            variant="outline"
            size="sm"
            onClick={() => addField(type.value)}
            disabled={!canAddField(type.value)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {type.label} ({getFieldCount(type.value)}/{type.max})
          </Button>
        ))}
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        {fields.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {locale === "ru"
              ? "Пользовательские поля не добавлены. Используйте кнопки выше, чтобы добавить новые поля."
              : "No custom fields added. Use the buttons above to add new fields."}
          </div>
        ) : (
          fields.map((field, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                <div className="pt-2 cursor-move">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>
                      {locale === "ru" ? "Тип поля" : "Field Type"}
                    </Label>
                    <Input
                      value={
                        FIELD_TYPES.find((t) => t.value === field.fieldType)
                          ?.label || field.fieldType
                      }
                      disabled
                      className="bg-gray-100 dark:bg-gray-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {locale === "ru" ? "Заголовок поля" : "Field Title"}
                    </Label>
                    <Input
                      value={field.title}
                      onChange={(e) =>
                        updateField(index, { title: e.target.value })
                      }
                      placeholder="e.g., Model Name"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>
                      {locale === "ru"
                        ? "Описание поля (необязательно)"
                        : "Field Description"}
                       (optional)</Label>
                    <Textarea
                      value={field.description}
                      onChange={(e) =>
                        updateField(index, { description: e.target.value })
                      }
                      placeholder="Help text for this field"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`visible-${index}`}
                      checked={field.visibleInTable}
                      onChange={(e) =>
                        updateField(index, { visibleInTable: e.target.checked })
                      }
                      className="rounded"
                    />
                    <Label htmlFor={`visible-${index}`} className="cursor-pointer">
                      {locale === "ru"
                        ? "Показывать в таблице инвентаря"
                        : "Visible in Inventory Table"}
                    </Label>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeField(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}