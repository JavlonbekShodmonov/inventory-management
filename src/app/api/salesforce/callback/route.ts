import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SalesforceService } from '@/lib/salesforce';

export async function GET(request: NextRequest) {
  try {
    console.log("Salesforce callback endpoint called");
    
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.error("No session in callback");
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Check for OAuth errors from Salesforce
    if (error) {
      console.error("Salesforce OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      console.error("Missing code or state parameter");
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_parameters', request.url)
      );
    }

    // Verify state matches userId (CSRF protection)
    if (state !== session.user.id) {
      console.error("State mismatch - possible CSRF attack");
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_state', request.url)
      );
    }

    // Retrieve code_verifier from cookie (PKCE verification)
    const codeVerifier = request.cookies.get('sf_code_verifier')?.value;
    
    if (!codeVerifier) {
      console.error("Code verifier not found in cookie - PKCE validation failed");
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_verifier', request.url)
      );
    }

    console.log("Code verifier retrieved from cookie, proceeding with token exchange");

    // Exchange authorization code for access token using PKCE
    console.log("Exchanging code for tokens with PKCE verification...");
    const tokenData = await SalesforceService.getAccessToken(code, codeVerifier);
    console.log("Tokens received successfully");

    // Store tokens in database
    await prisma.salesforceIntegration.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        instanceUrl: tokenData.instance_url,
      },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        instanceUrl: tokenData.instance_url,
      },
    });

    console.log("Tokens stored in database for user:", session.user.id);

    // Create redirect response
    const response = NextResponse.redirect(
      new URL('/dashboard?sf_connected=true', request.url)
    );

    // Clear the code_verifier cookie (security best practice - single use only)
    response.cookies.delete('sf_code_verifier');
    console.log("Code verifier cookie cleared");

    return response;
  } catch (error) {
    console.error('Salesforce callback error:', error);
    
    // Clear the code_verifier cookie even on error
    const response = NextResponse.redirect(
      new URL('/dashboard?error=callback_failed', request.url)
    );
    response.cookies.delete('sf_code_verifier');
    
    return response;
  }
}