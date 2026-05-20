import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';

// Pre-compiled regex and constants
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_RESPONSE_FIELDS = {
  _id: 1, clerkId: 1, username: 1, email: 1, imageUrl: 1, role: 1
};

// Reusable connection
const dbConnection = connectToDatabase().catch(console.error);

// Optimized sanitization
function sanitizeInput(input: string = ''): string {
  return input.trim().replace(/[&<>"']/g, (char) => 
    ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', 
      '"': '&quot;', "'": '&#039;'
    }[char] || char));
}

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    await dbConnection;

    const data = await req.json().catch(() => null);
    if (!data) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { clerkId, email, username, imageUrl } = data;

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Missing required field: clerkId' },
        { status: 400 }
      );
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: 'Invalid or missing email' },
        { status: 400 }
      );
    }

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedImageUrl = sanitizeInput(imageUrl);

    // Check for existing user and username in parallel
    const [existingUser, usernameTaken] = await Promise.all([
      User.findOne({ clerkId }, USER_RESPONSE_FIELDS),
      User.findOne({ 
        username: sanitizedUsername, 
        clerkId: { $ne: clerkId } 
      }).select('username')
    ]);

    if (usernameTaken) {
      console.log(`Username conflict: '${sanitizedUsername}' already taken by user ${usernameTaken._id}, requested by clerkId: ${clerkId}`);
      return NextResponse.json(
        { 
          error: 'Username already taken',
          message: 'Please choose a different username',
          code: 'USERNAME_TAKEN',
          conflictingUsername: sanitizedUsername
        },
        { status: 409 }
      );
    }

    // If user exists, update only if there are changes
    if (existingUser) {
      const updates: Record<string, string> = {};
      
      if (existingUser.email !== sanitizedEmail) updates.email = sanitizedEmail;
      if (existingUser.username !== sanitizedUsername) updates.username = sanitizedUsername;
      if (existingUser.imageUrl !== sanitizedImageUrl) updates.imageUrl = sanitizedImageUrl;
      
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date().toISOString();
        const updatedUser = await User.findOneAndUpdate(
          { clerkId },
          { $set: updates },
          { new: true, projection: USER_RESPONSE_FIELDS }
        );
        
        return NextResponse.json({ user: updatedUser });
      }
      
      return NextResponse.json({ user: existingUser });
    }

    // Create new user
    const newUser = await User.create({
      clerkId,
      email: sanitizedEmail,
      username: sanitizedUsername,
      imageUrl: sanitizedImageUrl,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      user: {
        _id: newUser._id,
        clerkId: newUser.clerkId,
        username: newUser.username,
        email: newUser.email,
        imageUrl: newUser.imageUrl,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error in sync API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}