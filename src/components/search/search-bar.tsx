"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useLocale } from "@/components/providers/locale-provider";

export default function SearchBar() {
  const { locale } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>({ inventories: [], items: [] });
  const [loading, setLoading] = useState(false);

  // Open search with Cmd+K or Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults({ inventories: [], items: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (type: string, id: string) => {
    setOpen(false);
    setQuery("");
    if (type === "inventory") {
      router.push(`/inventories/${id}`);
    } else {
      // Navigate to inventory with item highlighted
      router.push(`/inventories/${id}`);
    }
  };

  const handleSearchPage = () => {
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">
          {locale === "ru" ? "Поиск инвентарей и предметов..." : "Search inventories and items..."}
        </span>
        <span className="inline-flex lg:hidden">
          {locale === "ru" ? "Поиск..." : "Search..."}
        </span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search inventories and items..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {loading ? (
            <div className="py-6 text-center text-sm">
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            </div>
          ) : query.length < 2 ? (
            <CommandEmpty>
              {locale === "ru"
                ? "Введите не менее 2 символов для поиска"
                : "Type at least 2 characters to search"}
            </CommandEmpty>
          ) : results.inventories.length === 0 && results.items.length === 0 ? (
            <CommandEmpty>
              {locale === "ru"
                ? "Нет результатов для"
                : "No results for"}
               "{query}"
              <Button
                variant="link"
                size="sm"
                onClick={handleSearchPage}
                className="mt-2"
              >
                {locale === "ru"
                  ? "Просмотреть все результаты"
                  : "View all results"}
              </Button>
            </CommandEmpty>
          ) : (
            <>
              {results.inventories.length > 0 && (
                <CommandGroup heading="Inventories">
                  {results.inventories.map((inv: any) => (
                    <CommandItem
                      key={inv.id}
                      onSelect={() => handleSelect("inventory", inv.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{inv.title}</span>
                        <span className="text-xs text-gray-500">
                          {inv.category} • {inv._count.items} items • by{" "}
                          {inv.creator.name || inv.creator.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {results.items.length > 0 && (
                <>
                  {results.inventories.length > 0 && <CommandSeparator />}
                  <CommandGroup heading="Items">
                    {results.items.map((item: any) => (
                      <CommandItem
                        key={item.id}
                        onSelect={() =>
                          handleSelect("item", item.inventory.id)
                        }
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium font-mono">
                            {item.customId}
                          </span>
                          <span className="text-xs text-gray-500">
                            in {item.inventory.title}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}

              {(results.inventories.length > 0 || results.items.length > 0) && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSearchPage}
                    className="w-full"
                  >
                    {locale === "ru"
                      ? "Просмотреть все результаты для"
                      : "View all results for"}
                     "{query}"
                  </Button>
                </div>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}