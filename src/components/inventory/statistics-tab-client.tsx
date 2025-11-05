"use client";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Hash, Type, Calendar } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";

interface Field {
  id: string;
  title: string;
  fieldType: string;
}

interface NumericStat {
  field: Field;
  count: number;
  average: string | null;
  min: number | null;
  max: number | null;
  sum: string | null;
}

interface StringStat {
  field: Field;
  count: number;
  unique: number;
  mostFrequent: [string, number][];
}

interface BoolStat {
  field: Field;
  total: number;
  trueCount: number;
  falseCount: number;
  truePercentage: string;
}

interface StatisticsTabClientProps {
  totalItems: number;
  last7Days: number;
  last30Days: number;
  fieldsCount: number;
  numericStats: NumericStat[];
  stringStats: StringStat[];
  boolStats: BoolStat[];
  hasItems: boolean;
}

export default function StatisticsTabClient({
  totalItems,
  last7Days,
  last30Days,
  fieldsCount,
  numericStats,
  stringStats,
  boolStats,
  hasItems,
}: StatisticsTabClientProps) {
  const { locale } = useLocale();

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {locale === "ru" ? "Всего элементов" : "Total Items"}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {totalItems}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Hash className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {locale === "ru" ? "Последние 7 дней" : "Last 7 Days"}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {last7Days}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {locale === "ru" ? "Последние 30 дней" : "Last 30 Days"}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {last30Days}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {locale === "ru" ? "Пользовательские поля" : "Custom Fields"}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {fieldsCount}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
              <Type className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Numeric Field Statistics */}
      {numericStats.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold">
              {locale === "ru" ? "Статистика числовых полей" : "Numeric Fields Statistics"}
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {locale === "ru" ? "Поле" : "Field"}
                </TableHead>
                <TableHead>
                  {locale === "ru" ? "Всего" : "Total"}
                </TableHead>
                <TableHead>
                  {locale === "ru" ? "Среднее" : "Average"}
                </TableHead>
                <TableHead>
                  {locale === "ru" ? "Мин" : "Min"}
                </TableHead>
                <TableHead>
                  {locale === "ru" ? "Макс" : "Max"}
                </TableHead>
                <TableHead>
                  {locale === "ru" ? "Сумма" : "Sum"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {numericStats.map((stat) => (
                <TableRow key={stat.field.id}>
                  <TableCell className="font-medium">{stat.field.title}</TableCell>
                  <TableCell>{stat.count}</TableCell>
                  <TableCell>
                    {stat.average ? (
                      <Badge variant="secondary">{stat.average}</Badge>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {stat.min !== null ? stat.min : <span className="text-gray-400">N/A</span>}
                  </TableCell>
                  <TableCell>
                    {stat.max !== null ? stat.max : <span className="text-gray-400">N/A</span>}
                  </TableCell>
                  <TableCell>
                    {stat.sum !== null ? stat.sum : <span className="text-gray-400">N/A</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* String Field Statistics */}
      {stringStats.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Type className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">
              {locale === "ru" ? "Статистика текстовых полей" : "String Fields Statistics"}
            </h3>
          </div>
          <div className="space-y-6">
            {stringStats.map((stat) => (
              <div key={stat.field.id}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {stat.field.title}
                  </h4>
                  <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      {locale === "ru" ? "Всего" : "Total"}: {stat.count}
                    </span>
                    <span>
                      {locale === "ru" ? "Уникальных" : "Unique"}: {stat.unique}
                    </span>
                  </div>
                </div>
                {stat.mostFrequent.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {locale === "ru"
                        ? "Наиболее часто используемые значения:"
                        : "Most Frequent Values:"}
                    </p>
                    {stat.mostFrequent.map(([value, count], index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded p-2"
                      >
                        <span className="text-sm">{value}</span>
                        <Badge variant="outline">
                          {count} ({((count / stat.count) * 100).toFixed(1)}%)
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">
                    {locale === "ru"
                      ? "Нет данных для отображения."
                      : "No data to display."}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Boolean Field Statistics */}
      {boolStats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {locale === "ru" ? "Статистика логических полей" : "Boolean Fields Statistics"}
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {locale === "ru" ? "Поле" : "Field"}
                </TableHead>
                <TableHead>
                  {locale === "ru" ? "Всего" : "Total"}
                </TableHead>
                <TableHead>
                  {locale === "ru" ? "Истина" : "True"}
                </TableHead>
                <TableHead>
                  {locale === "ru" ? "Ложь" : "False"}
                </TableHead>
                <TableHead>
                  {locale === "ru" ? "Процент истины" : "True Percentage"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boolStats.map((stat) => (
                <TableRow key={stat.field.id}>
                  <TableCell className="font-medium">{stat.field.title}</TableCell>
                  <TableCell>{stat.total}</TableCell>
                  <TableCell>
                    <Badge variant="default">{stat.trueCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{stat.falseCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{stat.truePercentage}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* No Data Message */}
      {!hasItems && (
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {locale === "ru"
              ? "Нет данных для отображения статистики"
              : "No Data to Display Statistics"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {locale === "ru"
              ? "Добавьте элементы в ваш инвентарь, чтобы увидеть статистику здесь."
              : "Add items to your inventory to see statistics here."}
          </p>
        </Card>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>
            {locale === "ru"
              ? "Примечание: Эта вкладка только для чтения."
              : "Note: This tab is read-only."}
          </strong>{" "}
          {locale === "ru"
            ? "Статистика обновляется автоматически при добавлении или изменении элементов."
            : "Statistics are updated automatically when items are added or modified."}
        </p>
      </div>
    </div>
  );
}