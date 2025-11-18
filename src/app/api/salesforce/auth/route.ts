import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SalesforceService } from '@/lib/salesforce';

export async function GET(request: NextRequest) {
  try {
    console.log("Salesforce auth endpoint called");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "exists" : "missing");

    if (!session?.user?.id) {
      console.error("No session or user ID found");
      return NextResponse.json(
        { error: 'Unauthorized - Please log in first' },
        { status: 401 }
      );
    }

    console.log("Generating auth URL for user:", session.user.id);
    
    // Check environment variables
    if (!process.env.SALESFORCE_CLIENT_ID) {
      console.error("SALESFORCE_CLIENT_ID not set");
      return NextResponse.json(
        { error: 'Salesforce configuration missing - CLIENT_ID' },
        { status: 500 }
      );
    }

    if (!process.env.SALESFORCE_REDIRECT_URI) {
      console.error("SALESFORCE_REDIRECT_URI not set");
      return NextResponse.json(
        { error: 'Salesforce configuration missing - REDIRECT_URI' },
        { status: 500 }
      );
    }

    // Generate PKCE values (code_verifier and code_challenge)
    const { codeVerifier, codeChallenge } = SalesforceService.generatePKCE();
    console.log("Generated PKCE challenge");

    // Generate authorization URL with PKCE challenge
    const authUrl = SalesforceService.getAuthorizationUrl(session.user.id, codeChallenge);
    console.log("Auth URL generated with PKCE");

    // Create response with the auth URL
    const response = NextResponse.json({ authUrl });
    
    // Store code_verifier in a secure, httpOnly cookie
    // This will be retrieved in the callback to complete the PKCE flow
    response.cookies.set('sf_code_verifier', codeVerifier, {
      httpOnly: true, // JavaScript cannot access this cookie
      secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
      sameSite: 'lax', // CSRF protection while allowing OAuth redirects
      maxAge: 600, // 10 minutes - enough time for user to authorize
      path: '/', // Available to all routes
    });

    console.log("Code verifier stored in secure cookie");

    return response;
  } catch (error) {
    console.error('Salesforce auth error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate authorization URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}