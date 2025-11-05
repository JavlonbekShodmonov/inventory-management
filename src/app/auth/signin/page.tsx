import { Suspense } from "react";
import SignInContent from "../signin/signin-content";

export const dynamic = 'force-dynamic';

export default function SignIn() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}