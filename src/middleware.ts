import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Combined middleware
export default clerkMiddleware(async (auth, request) => {
  // Create basic response
  const response = NextResponse.next();
  
  // Add basic security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  
  return response;
}, {
  clockSkewInMs: 60000, // Allow for 60 seconds of clock skew
  debug: false, // Set to true temporarily if you need more detailed logs
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // EXCLUDE homepage and home route from middleware
    '/((?!home|^/$).*)',
  ],
}