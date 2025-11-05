"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // ✅
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search as SearchIcon } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

export default function SearchPage() {
  const { locale } = useLocale();
  const searchParams = useSearchParams(); // ✅
  const q = searchParams.get("q") || "";  // unwrap safely

  const [query, setQuery] = useState(q);
  const [inventories, setInventories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length >= 2) {
      setLoading(true);
      const controller = new AbortController();
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then(res => res.json())
        .then(data => {
          setInventories(data.inventories);
          setItems(data.items);
          setLoading(false);
        })
        .catch(err => {
          if (err.name !== "AbortError") {
            console.error(err);
            setLoading(false);
          }
        });
      return () => controller.abort();
    } else {
      setInventories([]);
      setItems([]);
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {locale === "ru" ? "Результаты поиска" : "Search Results"}
          </h1>
        </div>

        {/* Search input */}
        <div className="mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === "ru" ? "Введите минимум 2 символа..." : "Enter at least 2 characters..."}
            className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-gray-600 dark:text-gray-400">{locale === "ru" ? "Загрузка..." : "Loading..."}</p>
        )}

        {/* No query */}
        {!loading && query.length < 2 && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {locale === "ru"
                ? "Введите как минимум 2 символа для поиска"
                : "Enter at least 2 characters to search"}
            </p>
          </div>
        )}

        {/* No results */}
        {!loading && query.length >= 2 && inventories.length === 0 && items.length === 0 && (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {locale === "ru" ? `Ничего не найдено для "${query}"` : `No results found for "${query}"`}
            </p>
          </div>
        )}

        {/* Inventories */}
        {inventories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {locale === "ru" ? `Инвентари (${inventories.length})` : `Inventories (${inventories.length})`}
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === "ru" ? "Название" : "Title"}</TableHead>
                    <TableHead>{locale === "ru" ? "Категория" : "Category"}</TableHead>
                    <TableHead>{locale === "ru" ? "Предметы" : "Items"}</TableHead>
                    <TableHead>{locale === "ru" ? "Создатель" : "Creator"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventories.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Link
                          href={`/inventories/${inv.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          {inv.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{inv.category}</Badge>
                      </TableCell>
                      <TableCell>{inv._count.items}</TableCell>
                      <TableCell>{inv.creator.name || inv.creator.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Items */}
        {items.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {locale === "ru" ? `Предметы (${items.length})` : `Items (${items.length})`}
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{locale === "ru" ? "ID" : "Custom ID"}</TableHead>
                    <TableHead>{locale === "ru" ? "Инвентарь" : "Inventory"}</TableHead>
                    <TableHead>{locale === "ru" ? "Категория" : "Category"}</TableHead>
                    <TableHead>{locale === "ru" ? "Создал" : "Created By"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Link
                          href={`/inventories/${item.inventory.id}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-mono"
                        >
                          {item.customId}
                        </Link>
                      </TableCell>
                      <TableCell>{item.inventory.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.inventory.category}</Badge>
                      </TableCell>
                      <TableCell>{item.createdBy?.name || item.createdBy?.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
