import { Suspense } from "react";
import SearchPageContent from "../search/search-content";

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}