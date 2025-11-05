import { getCurrentUser } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TagCloud from "@/components/home/tag-cloud";

export default async function Home() {
  const user = await getCurrentUser();

  // Get latest inventories
  const latestInventories = await prisma.inventory.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      creator: true,
      _count: {
        select: { items: true },
      },
    },
  });

  // Get popular inventories (by item count)
  const popularInventories = await prisma.inventory.findMany({
    take: 5,
    include: {
      creator: true,
      _count: {
        select: { items: true },
      },
    },
    orderBy: {
      items: {
        _count: "desc",
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {user.name}
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/api/auth/signout"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Sign Out
                </Link>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Latest Inventories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Latest Inventories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestInventories.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 col-span-full">
                No inventories yet. {user && "Create your first one!"}
              </p>
            ) : (
              latestInventories.map((inventory) => (
                <div
                  key={inventory.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {inventory.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {inventory.description}
                  </p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      By {inventory.creator.name}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">
                      {inventory._count.items} items
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Popular Inventories */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Most Popular Inventories
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Creator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {popularInventories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      No inventories yet
                    </td>
                  </tr>
                ) : (
                  popularInventories.map((inventory) => (
                    <tr key={inventory.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {inventory.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {inventory.creator.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {inventory._count.items}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {inventory.category}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Tag Cloud */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Popular Tags
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <TagCloud />
          </div>
        </section>
      </main>
    </div>
  );
}
