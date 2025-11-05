"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User as UserIcon } from "lucide-react";
import LikeButton from "@/components/item/like-button";
import { useLocale } from "@/components/providers/locale-provider";

interface ItemPageProps {
  params: { id: string | string[] }; // <-- fix here
}

export default function ItemPage({ params }: ItemPageProps) {
  const id = Array.isArray(params.id) ? params.id[0] : params.id; // normalize
  const { locale } = useLocale();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundItem, setNotFoundItem] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/items/${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFoundItem(true);
          throw new Error("Item not found");
        }
        return res.json();
      })
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">
          {locale === "ru" ? "Загрузка..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (notFoundItem || !item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">
          {locale === "ru" ? "Элемент не найден" : "Item not found"}
        </p>
      </div>
    );
  }

  const isLiked = item.likes && item.likes.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href={`/inventories/${item.inventory.id}`}
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {locale === "ru"
            ? `Назад в ${item.inventory.title}`
            : `Back to ${item.inventory.title}`}
        </Link>

        {/* Item Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-mono mb-2">
                {item.customId}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{item.inventory.category}</Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {locale === "ru" ? "внутри" : "in"} {item.inventory.title}
                </span>
              </div>
            </div>
            <LikeButton
              itemId={item.id}
              initialLikeCount={item._count?.likes || 0}
              initialIsLiked={isLiked}
            />
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              <span>
                {locale === "ru" ? "Создал " : "Created by "}
                <Link
                  href={`/users/${item.createdBy.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {item.createdBy.name || item.createdBy.email}
                </Link>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(item.createdAt).toLocaleString(
                  locale === "ru" ? "ru-RU" : "en-US"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Item Fields */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {locale === "ru" ? "Детали" : "Details"}
          </h2>
          <div className="space-y-4">
            {item.inventory.fields.map((field: any) => {
              const fieldKey = field.fieldType.toLowerCase();
              const value = item[fieldKey];

              if (value === null || value === undefined) return null;

              return (
                <div
                  key={field.id}
                  className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                >
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {field.title}
                  </div>
                  <div className="text-gray-900 dark:text-white">
                    {field.fieldType.startsWith("BOOL")
                      ? value
                        ? locale === "ru"
                          ? "✓ Да"
                          : "✓ Yes"
                        : locale === "ru"
                        ? "✗ Нет"
                        : "✗ No"
                      : field.fieldType.startsWith("LINK")
                      ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 underline"
                        >
                          {value}
                        </a>
                      )
                      : String(value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
