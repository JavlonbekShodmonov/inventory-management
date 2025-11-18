"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Cloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

interface SalesforceDialogProps {
  initialIsConnected?: boolean;
  initialIsSynced?: boolean;
}

export function SalesforceDialog({ 
  initialIsConnected = false, 
  initialIsSynced = false 
}: SalesforceDialogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use state for connection status so it can update
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [isSynced, setIsSynced] = useState(initialIsSynced);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const [formData, setFormData] = useState({
    jobTitle: "",
    interests: "",
  });

  // Check for OAuth callback success/error
  useEffect(() => {
    const sfConnected = searchParams.get('sf_connected');
    const errorParam = searchParams.get('error');

    if (sfConnected === 'true') {
      setIsConnected(true);
      setOpen(true); // Open dialog to show sync form
      // Clean URL
      router.replace('/dashboard');
    }

    if (errorParam) {
      setError(`Connection failed: ${errorParam}`);
      setOpen(true);
      // Clean URL
      router.replace('/dashboard');
    }
  }, [searchParams, router]);

  // Fetch current status when dialog opens
  useEffect(() => {
    if (open && !isSynced) {
      checkSyncStatus();
    }
  }, [open]);

  const checkSyncStatus = async () => {
    setCheckingStatus(true);
    try {
      const response = await fetch("/api/salesforce/sync");
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
        setIsSynced(data.synced);
      }
    } catch (err) {
      console.error("Failed to check sync status:", err);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);

    try {
      console.log("Fetching Salesforce auth URL...");
      const response = await fetch("/api/salesforce/auth");
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to connect to Salesforce");
      }

      if (!data.authUrl) {
        throw new Error("No authorization URL returned from server");
      }

      console.log("Redirecting to:", data.authUrl);
      
      // Close dialog before redirect
      setOpen(false);
      
      // Redirect to Salesforce OAuth
      window.location.href = data.authUrl;
    } catch (err) {
      console.error("Connection error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect");
      setConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/salesforce/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync to Salesforce");
      }

      setSuccess(true);
      setIsSynced(true);
      
      // Close dialog and refresh page after 2 seconds
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setFormData({ jobTitle: "", interests: "" });
        router.refresh(); // Refresh server data
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sync");
    } finally {
      setLoading(false);
    }
  };

  // Button states
  if (checkingStatus) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking status...
      </Button>
    );
  }

  if (isSynced) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        Synced to Salesforce
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Cloud className="h-4 w-4" />
          {isConnected ? "Sync to Salesforce" : "Connect to Salesforce"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {isConnected ? "Sync to Salesforce CRM" : "Connect to Salesforce"}
          </DialogTitle>
          <DialogDescription>
            {isConnected
              ? "Add your information to create an Account and Contact in Salesforce."
              : "First, you need to connect your Salesforce account."}
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="py-6">
            <Button
              type="button"
              onClick={handleConnect}
              disabled={connecting}
              className="w-full gap-2"
            >
              {connecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4" />
                  Connect Salesforce Account
                </>
              )}
            </Button>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-muted-foreground mt-4">
              You'll be redirected to Salesforce to authorize access.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="jobTitle">Job Title (Optional)</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g., Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="interests">Interests (Optional)</Label>
                <Textarea
                  id="interests"
                  placeholder="Tell us about your interests or needs..."
                  value={formData.interests}
                  onChange={(e) =>
                    setFormData({ ...formData, interests: e.target.value })
                  }
                  disabled={loading}
                  rows={4}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    Successfully synced to Salesforce!
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || success}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  "Sync to Salesforce"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}