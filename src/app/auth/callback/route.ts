import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { logToDiscordWebhook } from "@/lib/discord-webhook";

// Reusable connection
const dbConnection = connectToDatabase().catch(async (err) => {
    await logToDiscordWebhook(`Failed to connect to database: ${err}`);
});

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL));
    }

    await dbConnection;

    // Get user data from Clerk
    const user = await currentUser();
    if (!user) {
      return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL));
    }

    // Check if user exists in database
    const existingUser = await User.findOne({ clerkId: userId });
    
    if (!existingUser) {
      // Create new user
      await User.create({
        clerkId: userId,
        email: user.emailAddresses[0]?.emailAddress,
        username: user.username || user.firstName || userId,
        imageUrl: user.imageUrl,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL));
  } catch (error) {
    await logToDiscordWebhook(`Error in auth callback: ${error}`);
    return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL));
  }
}