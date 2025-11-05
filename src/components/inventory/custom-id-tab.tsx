"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, GripVertical, Loader2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useLocale } from "@/components/providers/locale-provider";

const ID_ELEMENT_TYPES = [
  { value: "text", label: "Fixed Text", example: "ITEM" },
  { value: "sequence", label: "Sequence Number", example: "000001" },
  { value: "random20", label: "Random 20-bit", example: "A4F3E" },
  { value: "random32", label: "Random 32-bit", example: "E74FA329" },
  { value: "random6", label: "Random 6-digit", example: "123456" },
  { value: "random9", label: "Random 9-digit", example: "987654321" },
  { value: "guid", label: "GUID", example: "550e8400-e29b-41d4-a716-446655440000" },
  { value: "datetime", label: "Date/Time", example: "20250121143000" },
];

interface IdElement {
  id: string;
  type: string;
  value?: string;
  format?: string;
}

interface CustomIdTabProps {
  inventoryId: string;
  currentFormat: any[];
}

function SortableIdElement({
  element,
  onUpdate,
  onRemove,
}: {
  element: IdElement;
  onUpdate: (id: string, updates: Partial<IdElement>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeInfo = ID_ELEMENT_TYPES.find((t) => t.value === element.type);
  const { locale } = useLocale();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label className="text-xs">
            {locale === "ru" ? "Тип элемента" : "Element Type"}
          </Label>
          <Input value={typeInfo?.label || element.type} disabled className="bg-gray-50" />
        </div>

        {element.type === "text" && (
          <div className="md:col-span-2">
            <Label className="text-xs">
              {locale === "ru" ? "Фиксированный текст" : "Fixed Text"}
            </Label>
            <Input
              value={element.value || ""}
              onChange={(e) => onUpdate(element.id, { value: e.target.value })}
              placeholder="e.g., ITEM, COMP, BOOK"
            />
          </div>
        )}

        {element.type === "sequence" && (
          <div>
            <Label className="text-xs">
              {locale === "ru" ? "Формат последовательности" : "Sequence Format"}
            </Label>
            <Input
              value={element.format || "000000"}
              onChange={(e) => onUpdate(element.id, { format: e.target.value })}
              placeholder="e.g., 000000"
            />
          </div>
        )}

        {element.type !== "text" && element.type !== "sequence" && (
          <div className="md:col-span-2">
            <Label className="text-xs">
              {locale === "ru" ? "Пример значения" : "Example Value"}
            </Label>
            <Input value={typeInfo?.example || ""} disabled className="bg-gray-50" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(element.id)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}

export default function CustomIdTab({
  inventoryId,
  currentFormat,
}: CustomIdTabProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { locale } = useLocale();
  const [elements, setElements] = useState<IdElement[]>(
    currentFormat.map((el: any, index: number) => ({
      id: `element-${index}`,
      type: el.type,
      value: el.value,
      format: el.format,
    }))
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setElements((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addElement = (type: string) => {
    const newElement: IdElement = {
      id: `element-${Date.now()}`,
      type,
      value: type === "text" ? "" : undefined,
      format: type === "sequence" ? "000000" : undefined,
    };
    setElements([...elements, newElement]);
  };

  const updateElement = (id: string, updates: Partial<IdElement>) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, ...updates } : el))
    );
  };

  const removeElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
  };

  const generatePreview = () => {
    let preview = "";
    const now = new Date();

    for (const element of elements) {
      switch (element.type) {
        case "text":
          preview += element.value || "TEXT";
          break;
        case "sequence":
          const format = element.format || "000000";
          preview += "1".padStart(format.length, "0");
          break;
        case "random20":
          preview += "A4F3E";
          break;
        case "random32":
          preview += "E74FA329";
          break;
        case "random6":
          preview += "123456";
          break;
        case "random9":
          preview += "987654321";
          break;
        case "guid":
          preview += "550e8400-e29b-41d4-a716-446655440000";
          break;
        case "datetime":
          preview += now
            .toISOString()
            .replace(/[-:T.]/g, "")
            .slice(0, 14);
          break;
        default:
          break;
      }
    }

    return preview || "No elements added";
  };

  const handleSave = async () => {
    // Validate
    for (const element of elements) {
      if (element.type === "text" && !element.value?.trim()) {
        alert("Text elements must have a value");
        return;
      }
    }

    if (elements.length === 0) {
      alert("Please add at least one ID element");
      return;
    }

    if (elements.length > 10) {
      alert("Maximum 10 elements allowed");
      return;
    }

    setLoading(true);

    try {
      const format = elements.map((el) => ({
        type: el.type,
        value: el.value,
        format: el.format,
      }));

      const response = await fetch(`/api/inventories/${inventoryId}/custom-id`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ format }),
      });

      if (!response.ok) {
        throw new Error("Failed to save custom ID format");
      }

      alert("Custom ID format saved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error saving custom ID format:", error);
      alert("Failed to save custom ID format");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">
              {locale === "ru"
                ? "Настройка пользовательских форматов идентификаторов"
                : "Custom ID Format Configuration"}
            </p>
            <p>
              {locale === "ru"
                ? "Создавайте настраиваемые форматы идентификаторов для элементов вашего инвентаря, комбинируя различные типы элементов."
                : "Create custom ID formats for your inventory items by combining different element types."}
            </p>
          </div>
        </div>
      </Card>

      {/* Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Preview</h3>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 font-mono text-lg">
          {generatePreview()}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {locale === "ru"
            ? "Это пример того, как будет выглядеть идентификатор на основе текущего формата."
            : "This is an example of how the ID will look based on the current format."}
        </p>
      </div>

      {/* Add Element Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Add ID Elements</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ID_ELEMENT_TYPES.map((type) => (
            <Button
              key={type.value}
              variant="outline"
              size="sm"
              onClick={() => addElement(type.value)}
              className="justify-start"
            >
              <Plus className="w-4 h-4 mr-2" />
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Elements List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {locale === "ru" ? "Элементы формата идентификатора" : "ID Format Elements"}
          </h3>
          <Button onClick={handleSave} disabled={loading || elements.length === 0}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {locale === "ru" ? "Сохранить формат" : "Save Format"}
          </Button>
        </div>

        {elements.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              {locale === "ru"
                ? "Нет элементов в текущем формате идентификатора."
                : "No elements in the current ID format."}
            </p>
            <p className="text-sm">
              {locale === "ru"
                ? "Используйте кнопки выше, чтобы добавить элементы."
                : "Use the buttons above to add elements."}
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={elements.map((el) => el.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {elements.map((element) => (
                  <SortableIdElement
                    key={element.id}
                    element={element}
                    onUpdate={updateElement}
                    onRemove={removeElement}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {elements.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            💡{locale === 'ru'?'Совет: Используй элементы используя хват стикер чтобы перепоставить их':'Tip: Drag elements using the grip icon to reorder them'}
          </p>
        )}
      </div>

      {/* Help Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-3">
          {locale === "ru"
            ? "Типы элементов идентификатора"
            : "ID Element Types"}
        </h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>
              {locale === "ru" ? "Фиксированный текст" : "Fixed Text"}
              </strong> 
              {locale === "ru"
                ? ": Пользовательский текст, который остается неизменным в каждом идентификаторе."
                : ": Custom text that remains constant in every ID."}
          </div>
          <div>
            <strong>
              {locale === "ru" ? "Последовательный номер" : "Sequence Number"}
              </strong>
              {locale === "ru"
                ? ": Автоматически увеличивающийся номер с настраиваемым форматом."
                : ": An auto-incrementing number with a customizable format."}
          </div>
          <div>
            <strong>
              {locale === "ru" ? "Случайные числа" : "Random Numbers"}
              </strong> 
              {locale === "ru"
                ? ": Случайно сгенерированные числа или буквы заданной длины."
                : ": Randomly generated numbers or letters of specified length."}
          </div>
          <div>
            <strong>
              {locale === "ru" ? "GUID" : "GUID"}
              </strong> 
              {locale === "ru"
                ? ": Глобально уникальный идентификатор в стандартном формате."
                : ": A globally unique identifier in standard format."}
          </div>
          <div>
            <strong>
              {locale === "ru" ? "Дата/Время" : "Date/Time"}
              </strong> 
              {locale === "ru"
                ? ": Текущая дата и время в формате ГГГГММДДЧЧММСС."
                : ": The current date and time in YYYYMMDDHHMMSS format."}
          </div>
        </div>
      </div>
    </div>
  );
}