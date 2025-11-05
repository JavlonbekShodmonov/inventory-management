"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreVertical, Shield, ShieldOff, Trash2, Ban, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "@/components/providers/locale-provider";

interface UserActionsCellProps {
  user: any;
}

export default function UserActionsCell({ user }: UserActionsCellProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const {locale} = useLocale();
  const isCurrentUser = session?.user?.id === user.id;
  const isAdmin = user.role === "ADMIN";

  const handleAction = async (action: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Action failed");
      }

      router.refresh();
      
      // If current user removed their own admin, redirect to home
      if (isCurrentUser && action === "remove-admin") {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Error performing action:", error);
      alert(error.message || "Failed to perform action");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete user");
      }

      setShowDeleteDialog(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert(error.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  const confirmRoleChange = (action: string) => {
    setActionType(action);
    setShowRoleDialog(true);
  };

  const executeRoleChange = async () => {
    setShowRoleDialog(false);
    await handleAction(actionType);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={loading}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isAdmin ? (
            <DropdownMenuItem
              onClick={() => confirmRoleChange("remove-admin")}
              className="text-orange-600"
            >
              <ShieldOff className="w-4 h-4 mr-2" />
              {locale === 'ru' ? 'Удалить Админ Роль' : 'Remove Admin Role'}
              {isCurrentUser && " (Yourself!)"}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => confirmRoleChange("make-admin")}>
              <Shield className="w-4 h-4 mr-2" />
              {locale === 'ru' ? 'Сделать Админом' : 'Make Admin'}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600"
            disabled={isCurrentUser}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {locale === 'ru' ? 'Удалить Пользователя' : 'Delete User'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {locale === 'ru' ? 'Удалить Пользователя?' : 'Delete User?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {locale === 'ru' ? (
                <>
                  Вы уверены, что хотите удалить пользователя{" "}
                  <strong>{user.name || user.email}</strong>? Это действие не может быть отменено.
                </>
              ) : (
                <>
                  Are you sure you want to delete user{" "}
                  <strong>{user.name || user.email}</strong>? This action cannot be undone.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>{locale === 'ru'?'Дефолт': 'Default'}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "make-admin" ? "Make Admin?" : "Remove Admin Role?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "make-admin" ? (
                <>
                  Grant admin privileges to <strong>{user.name || user.email}</strong>?
                  They will be able to manage all users and access all inventories.
                </>
              ) : (
                <>
                  Remove admin role from <strong>{user.name || user.email}</strong>
                  {isCurrentUser && " (yourself)"}? 
                  {isCurrentUser && " You will lose access to this admin panel."}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={executeRoleChange}
              disabled={loading}
              className={actionType === "remove-admin" ? "bg-orange-600 hover:bg-orange-700" : ""}
            >
              {loading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}