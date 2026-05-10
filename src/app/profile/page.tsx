import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

// Reusable connection
const dbConnection = connectToDatabase().catch(async (err) => {
    await logToDiscordWebhook(`Failed to connect to database: ${err} | User ID: Unknown`);
});

// Add these export statements at the top of the file
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function ProfileRedirectPage() {
  let userId;
  let user;

  try {
    // Authenticate user
    const authResult = await auth();
    userId = authResult.userId;

    if (!userId) {
      await logToDiscordWebhook(`Authentication failed | User ID: Not provided`);
      return (
        <div className="container mx-auto py-8">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Authentication Required</h2>
            <p className="text-gray-300">You must be signed in to view your profile.</p>
          </div>
        </div>
      );
    }

    // Connect to database with error handling
    try {
      await dbConnection;
    } catch (dbError) {
      await logToDiscordWebhook(`Database connection error: ${dbError} | User ID: ${userId}`);
      return (
        <div className="container mx-auto py-8">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Database Error</h2>
            <p className="text-gray-300">Unable to connect to the database. Please try again later.</p>
          </div>
        </div>
      );
    }

    // Find user with error handling
    try {
      user = await User.findOne({ clerkId: userId }).lean();
      
      if (!user) {
        await logToDiscordWebhook(`Profile not found | User ID: ${userId}`);
        return (
          <div className="container mx-auto py-8">
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-yellow-400 mb-2">Profile Not Found</h2>
              <p className="text-gray-300">Your profile could not be found. Please contact support if this issue persists.</p>
            </div>
          </div>
        );
      }
      
      if (!('username' in user) || !user.username) {
        await logToDiscordWebhook(`Username not set | User ID: ${userId}`);
        return (
          <div className="container mx-auto py-8">
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-yellow-400 mb-2">Username Not Set</h2>
              <p className="text-gray-300">Your profile is missing a username. Please update your profile settings.</p>
            </div>
          </div>
        );
      }
      
      // Validate username format before redirecting
      const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
      if (!usernameRegex.test(user.username)) {
        await logToDiscordWebhook(`Invalid username format | User ID: ${userId}`);
        return (
          <div className="container mx-auto py-8">
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-6 text-center">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Invalid Username Format</h2>
              <p className="text-gray-300">Your username contains invalid characters. Please update your profile with a valid username.</p>
            </div>
          </div>
        );
      }
    } catch (userError) {
      await logToDiscordWebhook(`User fetch error: ${userError} | User ID: ${userId}`);
      return (
        <div className="container mx-auto py-8">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Profile Error</h2>
            <p className="text-gray-300">An error occurred while retrieving your profile. Please try again later.</p>
          </div>
        </div>
      );
    }
  } catch (error) {
    await logToDiscordWebhook(`Unexpected error in profile page: ${error} | User ID: ${userId || 'Unknown'}`);
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-400 mb-2">Unexpected Error</h2>
          <p className="text-gray-300">An unexpected error occurred. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Redirect outside of all try-catch blocks to avoid catching NEXT_REDIRECT
  if (user && 'username' in user && user.username) {
    const sanitizedUsername = encodeURIComponent(user.username);
    redirect(`/profile/${sanitizedUsername}`);
  }

  return null;
}

export default ProfileRedirectPage;