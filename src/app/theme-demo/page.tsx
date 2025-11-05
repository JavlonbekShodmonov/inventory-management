"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/providers/locale-provider";

export default function ThemeDemoPage() {
  const { locale } = useLocale();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {locale === 'ru' ? 'Демонстрация Темы' : 'Theme Demo'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {locale === 'ru'
              ? 'Просмотрите различные компоненты UI в светлой и темной темах.'
              : 'Explore various UI components in light and dark themes.'}
          </p>
        </div>

        {/* Cards */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === 'ru' ? 'Карточки' : 'Cards'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-2">  </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {locale === 'ru'
                  ? 'Это простая карточка с текстом.'
                  : 'This is a simple card with text.'}
              </p>
            </Card>
            <Card className="p-6 bg-blue-50 dark:bg-blue-950">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
               {locale === 'ru' ? 'Цветная Карточка' : 'Colored Card'}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {locale === 'ru'
                  ? 'Карточки могут иметь разные фоны.'
                  : 'Cards can have different backgrounds.'}
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-2">{locale === "ru" ? 'С Бейджом':'With Badge'}</h3>
              <Badge variant="secondary" className="mb-2">
                {locale === 'ru' ? 'Статус' : 'Status'}
              </Badge>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {locale === 'ru'?'Компоненты работают вместе':'Components work together seamlessly.'}
              </p>
            </Card>
          </div>
        </section>

        {/* Buttons */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === 'ru' ? 'Кнопки' : 'Buttons'}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button>{locale === 'ru' ?'Важный':'Primary'}</Button>
            <Button variant="secondary">{locale === 'ru'?'Второместный':'Secondary'}</Button>
            <Button variant="destructive">{locale === 'ru'?'Разбивающий':'Destructive'}</Button>
            <Button variant="outline">{locale === 'ru'?'Контур':'Outline'}</Button>
            <Button variant="ghost">{locale === 'ru'?'Призрак':'Ghost'}</Button>
            <Button variant="link">{locale === 'ru'?'Линк':'Link'}</Button>
          </div>
        </section>

        {/* Badges */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === 'ru' ? 'Бейджи' : 'Badges'}
          </h2>
          <div className="flex flex-wrap gap-2">
            <Badge>{locale === 'ru'?'Дефолт': 'Default'}</Badge>
            <Badge variant="secondary">{locale === 'ru'?'Второместный': 'Secondary'}</Badge>
            <Badge variant="destructive">{locale === 'ru'?'Разбивающий': 'Destructive'}</Badge>
            <Badge variant="outline">{locale === 'ru'?'Контур': 'Outline'}</Badge>
          </div>
        </section>

        {/* Form Elements */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === 'ru' ? 'Элементы Формы' : 'Form Elements'}
          </h2>
          <Card className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {locale === 'ru' ? 'Текстовое Поле' : 'Text Input'}
              </label>
              <Input placeholder="Enter some text..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {locale === 'ru' ? 'Выпадающий Список' : 'Select Dropdown'}
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
                <option>
                  {locale === 'ru' ? 'Опция 1' : 'Option 1'}

                </option>
                <option>
                  {locale === 'ru' ? 'Опция 2' : 'Option 2'}
                  </option>
                <option>
                  {locale === 'ru' ? 'Опция 3' : 'Option 3'}
                  </option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="demo-check" className="rounded" />
              <label htmlFor="demo-check" className="text-sm">
                {locale === 'ru' ? 'Флажок' : 'Checkbox'}
              </label>
            </div>
          </Card>
        </section>

        {/* Tables */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === 'ru' ? 'Таблицы' : 'Tables'}
          </h2>
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {locale === 'ru' ? 'Имя' : 'Name'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {locale === 'ru' ? 'Статус' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    {locale === 'ru' ? 'Роль' : 'Role'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm">
                    {locale === 'ru' ? 'Джон Доу' : 'John Doe'}
                    </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant="secondary">
                      {locale === 'ru' ? 'Активен' : 'Active'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {locale === 'ru' ? 'Админ' : 'Admin'}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm">
                    {locale === 'ru' ? 'Джейн Смит' : 'Jane Smith'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <Badge variant="outline">
                      {locale === 'ru' ? 'Неактивен' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {locale === 'ru' ? 'Пользователь' : 'User'}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* Color Palette */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {locale === 'ru' ? 'Цветовая Палитра' : 'Color Palette'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"></div>
              <p className="text-sm text-center">
                {locale === 'ru' ? 'Фон' : 'Background'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"></div>
              <p className="text-sm text-center">
                {locale === 'ru' ? 'Поверхность' : 'Surface'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-blue-600 rounded"></div>
              <p className="text-sm text-center">
                {locale === 'ru' ? 'Основной' : 'Primary'}
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-red-600 rounded"></div>
              <p className="text-sm text-center">
                {locale === 'ru' ? 'Разбивающий' : 'Destructive'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}