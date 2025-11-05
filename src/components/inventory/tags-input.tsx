"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

interface TagsInputProps {
  inventoryId: string;
  initialTags: any[];
  onTagsChange?: (tags: any[]) => void;
}

export default function TagsInput({
  inventoryId,
  initialTags,
  onTagsChange,
}: TagsInputProps) {
  const [tags, setTags] = useState(initialTags);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { locale } = useLocale();

  // Search tags with autocomplete
  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/tags/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          // Filter out already selected tags
          const filtered = data.filter(
            (tag: any) => !tags.some((t) => t.tag.name === tag.name)
          );
          setSuggestions(filtered);
        }
      } catch (error) {
        console.error("Error searching tags:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, tags]);

  const handleAddTag = async (tagName: string) => {
    try {
      const response = await fetch(`/api/inventories/${inventoryId}/tags`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tagName }),
      });

      if (!response.ok) {
        throw new Error("Failed to add tag");
      }

      const newTag = await response.json();
      const updatedTags = [...tags, newTag];
      setTags(updatedTags);
      setQuery("");
      setOpen(false);
      onTagsChange?.(updatedTags);
    } catch (error) {
      console.error("Error adding tag:", error);
      alert("Failed to add tag");
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    try {
      const response = await fetch(
        `/api/inventories/${inventoryId}/tags/${tagId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove tag");
      }

      const updatedTags = tags.filter((t) => t.tagId !== tagId);
      setTags(updatedTags);
      onTagsChange?.(updatedTags);
    } catch (error) {
      console.error("Error removing tag:", error);
      alert("Failed to remove tag");
    }
  };

  return (
    <div className="space-y-3">
      {/* Display Tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map((tagRelation) => (
          <Badge
            key={tagRelation.tagId}
            variant="secondary"
            className="text-sm pl-3 pr-1 py-1"
          >
            {tagRelation.tag.name}
            <button
              onClick={() => handleRemoveTag(tagRelation.tagId)}
              className="ml-2 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Add Tag Input */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            placeholder="Add tags (type to search existing tags)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandList>
              {loading ? (
                <div className="p-4 text-center text-sm">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                </div>
              ) : query.length === 0 ? (
                <CommandEmpty>
                  {locale === "ru"
                    ? "Начните вводить, чтобы найти или создать теги"
                    : "Start typing to find or create tags"}
                </CommandEmpty>
              ) : suggestions.length === 0 ? (
                <CommandGroup>
                  <CommandItem
                    onSelect={() => handleAddTag(query)}
                    className="cursor-pointer"
                  >
                      {locale === "ru"
                        ? "Создать новый тег:"
                        : "Create new tag:"}
                     <strong className="ml-1">{query}</strong>
                  </CommandItem>
                </CommandGroup>
              ) : (
                <CommandGroup>
                  {suggestions.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => handleAddTag(tag.name)}
                      className="cursor-pointer"
                    >
                      {tag.name}
                      <span className="ml-2 text-xs text-gray-500">
                        ({tag._count.inventories} inventories)
                      </span>
                    </CommandItem>
                  ))}
                  <CommandItem
                    onSelect={() => handleAddTag(query)}
                    className="cursor-pointer border-t"
                  >
                      {locale === "ru"
                        ? "Создать новый тег:"
                        : "Create new tag:"}
                     <strong className="ml-1">{query}</strong>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {locale === "ru"
          ? "Вы можете добавить существующие теги или создать новые, введя имя тега и нажав Enter."
          : "You can add existing tags or create new ones by typing the tag name and pressing Enter."}
      </p>
    </div>
  );
}