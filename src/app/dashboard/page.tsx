import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "../dashboard/DashboardClient";

export default async function DashboardPage() {
  // Fetch session server-side
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch user + Salesforce integration
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      salesforceIntegration: {
        select: {
          salesforceAccountId: true,
          salesforceContactId: true,
          lastSyncedAt: true,
        },
      },
    },
  });

  return <DashboardClient serverUser={user} serverSession={session} />;
}
