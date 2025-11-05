import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Settings, Users, MessageSquare,BarChart3 } from "lucide-react";
import Link from "next/link";
import ItemsTab from "@/components/inventory/items-tab";
import SettingsTab from "@/components/inventory/settings-tab";
import FieldsTab from "@/components/inventory/fields-tab";
import CustomIdTab from "@/components/inventory/custom-id-tab";
import AccessTab from "@/components/inventory/access-tab";
import DiscussionTab from "@/components/inventory/discussion-tab";
import StatisticsTab from "@/components/inventory/statistics-tab";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InventoryDetailPage({ params }: PageProps) {
  const { id } = await params; // ✅ Await params before using
  const user = await requireAuth();

  const inventory = await prisma.inventory.findUnique({
    where: { id },
    include: {
      creator: true,
      items: {
        include: {
          createdBy: true,
          _count: {
            select: { likes: true },
          },
          likes: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      fields: {
        orderBy: {
          order: "asc",
        },
      },
      accessGrants: {
        include: {
          user: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!inventory) notFound();

  const isOwner = inventory.creatorId === user.id;
  const isAdmin = user.role === "ADMIN";
  const hasWriteAccess =
    isOwner ||
    isAdmin ||
    inventory.isPublic ||
    inventory.accessGrants.some((grant) => grant.userId === user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {inventory.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="secondary">{inventory.category}</Badge>
                {inventory.isPublic ? (
                  <Badge variant="default">Public</Badge>
                ) : (
                  <Badge variant="outline">Private</Badge>
                )}
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Created by {inventory.creator.name || inventory.creator.email}
                </span>
              </div>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                {inventory.description}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="items" className="space-y-6">
          <TabsList>
            <TabsTrigger value="items">
              Items ({inventory.items.length})
            </TabsTrigger>
            <TabsTrigger value="discussion">
              Discussion ({inventory.comments.length})
            </TabsTrigger>
            {(isOwner || isAdmin) && (
              <>
                <TabsTrigger value="settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="fields">
                  <Edit className="w-4 h-4 mr-2" />
                  Custom Fields
                </TabsTrigger>
                <TabsTrigger value="customid">Custom ID Format</TabsTrigger>
                <TabsTrigger value="statistics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Statistics
                </TabsTrigger>
                <TabsTrigger value="access">
                  <Users className="w-4 h-4 mr-2" />
                  Access Control
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="items">
            <ItemsTab
              inventory={inventory}
              items={inventory.items}
              fields={inventory.fields}
              hasWriteAccess={hasWriteAccess}
              isOwner={isOwner || isAdmin}
            />
          </TabsContent>

          <TabsContent value="discussion">
            <DiscussionTab
              inventoryId={inventory.id}
              initialComments={inventory.comments}
            />
          </TabsContent>

          {(isOwner || isAdmin) && (
            <>
              <TabsContent value="settings">
                <SettingsTab inventory={inventory} />
              </TabsContent>

              <TabsContent value="fields">
                <FieldsTab
                  inventoryId={inventory.id}
                  existingFields={inventory.fields}
                />
              </TabsContent>
              <TabsContent value="customid">
                <CustomIdTab
                  inventoryId={inventory.id}
                  currentFormat={inventory.customIdFormat as any[]}
                />
              </TabsContent>

              <TabsContent value="statistics">
  <StatisticsTab inventoryId={inventory.id} />
</TabsContent>

              <TabsContent value="access">
                <AccessTab
                  inventoryId={inventory.id}
                  accessGrants={inventory.accessGrants}
                  isPublic={inventory.isPublic}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
