import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // Adjust to your auth config path
import { prisma } from '@/lib/prisma';
import { SalesforceService } from '@/lib/salesforce';
import { z } from 'zod';

const syncSchema = z.object({
  jobTitle: z.string().optional(),
  interests: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Load Salesforce integration (stored in a separate model)
    const salesforceIntegration = await prisma.salesforceIntegration.findUnique({
      where: { userId: session.user.id },
    });

    if (!salesforceIntegration) {
      return NextResponse.json(
        { error: 'Salesforce not connected. Please connect first.' },
        { status: 400 }
      );
    }

    // Check if already synced
    if (
      salesforceIntegration.salesforceAccountId &&
      salesforceIntegration.salesforceContactId
    ) {
      return NextResponse.json(
        {
          message: 'Already synced to Salesforce',
          accountId: salesforceIntegration.salesforceAccountId,
          contactId: salesforceIntegration.salesforceContactId,
        },
        { status: 200 }
      );
    }

    // Parse request body
    const body = await request.json();
    const validatedData = syncSchema.parse(body);

    // Create Account and Contact in Salesforce
    const { accountId, contactId } = await SalesforceService.createAccountAndContact(
      session.user.id,
      {
        name: user.name || 'Unknown User',
        email: user.email || '',
        jobTitle: validatedData.jobTitle,
        interests: validatedData.interests,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully synced to Salesforce',
      accountId,
      contactId,
    });
  } catch (error) {
    console.error('Salesforce sync error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to sync to Salesforce' },
      { status: 500 }
    );
  }
}

// Check sync status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const integration = await prisma.salesforceIntegration.findUnique({
      where: { userId: session.user.id },
      select: {
        salesforceAccountId: true,
        salesforceContactId: true,
        lastSyncedAt: true,
      },
    });

    return NextResponse.json({
      connected: !!integration,
      synced: !!(integration?.salesforceAccountId && integration?.salesforceContactId),
      lastSyncedAt: integration?.lastSyncedAt,
    });
  } catch (error) {
    console.error('Salesforce status error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}