"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Temporary diagnostic component to help debug Salesforce connection issues
 * Remove this after the issue is resolved
 */
export function SalesforceDiagnostic() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      checks: {},
    };

    try {
      // Check 1: Session
      console.log("🔍 Checking session...");
      try {
        const sessionRes = await fetch("/api/test-session");
        diagnostics.checks.session = {
          status: sessionRes.status,
          data: await sessionRes.json(),
        };
      } catch (err) {
        diagnostics.checks.session = {
          error: err instanceof Error ? err.message : "Failed",
        };
      }

      // Check 2: Salesforce Auth Endpoint
      console.log("🔍 Checking Salesforce auth endpoint...");
      try {
        const authRes = await fetch("/api/salesforce/auth");
        const authData = await authRes.json();
        diagnostics.checks.salesforceAuth = {
          status: authRes.status,
          data: authData,
          hasAuthUrl: !!authData.authUrl,
        };
      } catch (err) {
        diagnostics.checks.salesforceAuth = {
          error: err instanceof Error ? err.message : "Failed",
        };
      }

      // Check 3: Sync Status
      console.log("🔍 Checking sync status...");
      try {
        const syncRes = await fetch("/api/salesforce/sync");
        diagnostics.checks.syncStatus = {
          status: syncRes.status,
          data: await syncRes.json(),
        };
      } catch (err) {
        diagnostics.checks.syncStatus = {
          error: err instanceof Error ? err.message : "Failed",
        };
      }

      // Check 4: Environment (client-side check)
      console.log("🔍 Checking environment...");
      diagnostics.checks.environment = {
        appUrl: window.location.origin,
        protocol: window.location.protocol,
        host: window.location.host,
      };

      console.log("📊 Diagnostic Results:", diagnostics);
      setResults(diagnostics);
    } catch (err) {
      console.error("Diagnostic error:", err);
      diagnostics.error = err instanceof Error ? err.message : "Unknown error";
      setResults(diagnostics);
    } finally {
      setLoading(false);
    }
  };

  const testDirectRedirect = () => {
    const clientId = prompt("Enter your Salesforce CLIENT_ID:");
    if (!clientId) return;

    const url = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${window.location.origin}/api/salesforce/callback&scope=api refresh_token offline_access&state=test-direct`;
    
    console.log("🚀 Direct redirect to:", url);
    window.location.href = url;
  };

  return (
    <div className="border border-yellow-500 bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
        🔧 Salesforce Integration Diagnostics
      </h3>
      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
        Temporary debugging tool - remove after fixing the issue
      </p>

      <div className="flex gap-2 mb-4">
        <Button
          onClick={runDiagnostics}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? "Running..." : "Run Diagnostics"}
        </Button>
        <Button
          onClick={testDirectRedirect}
          variant="outline"
          size="sm"
        >
          Test Direct Redirect
        </Button>
      </div>

      {results && (
        <div className="bg-white dark:bg-gray-900 p-3 rounded border overflow-auto max-h-96">
          <pre className="text-xs">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-xs space-y-1 text-yellow-700 dark:text-yellow-300">
        <p><strong>What to check:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>session:</strong> Should have hasSession: true and a userId</li>
          <li><strong>salesforceAuth:</strong> Should have status: 200 and hasAuthUrl: true</li>
          <li><strong>syncStatus:</strong> Status 200 or 401 is expected (401 means not connected yet)</li>
          <li><strong>environment:</strong> Verify your app URL is correct</li>
        </ul>
      </div>
    </div>
  );
}