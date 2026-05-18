import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';
import { auth } from '@clerk/nextjs/server';

// Helper function to sanitize input
function sanitizeInput(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
}

// Reusable connection
const dbConnection = connectToDatabase().catch(console.error);


// export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    // Connect to database with error handling
    try {
      await dbConnection;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Find user in database
    try {
      const user = await User.findOne({ clerkId: userId }).lean();
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Ensure roles is always an array
      const userRoles = Array.isArray((user as any).roles) && (user as any).roles.length > 0
        ? (user as any).roles 
        : ((user as any).role ? [(user as any).role] : ['user']);

      // Return sanitized user data
      return NextResponse.json({
        user: {
          _id: (user as any)._id,
          clerkId: (user as any).clerkId,
          username: (user as any).username,
          email: (user as any).email,
          bio: (user as any).bio || '',
          pfp: (user as any).pfp || (user as any).imageUrl || '',
          social: (user as any).social || {},
          role: (user as any).role,
          roles: userRoles,
          points: (user as any).points || 0
        }
      });
    } catch (queryError) {
      console.error('User query error:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in profile GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Validate request method
    if (req.method !== 'PATCH') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Connect to database with error handling
    try {
      await dbConnection;
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    let data;
    try {
      data = await req.json();
    } catch (parseError) {
      console.error('Request parsing error:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }


    // Create update object with type definition
    type UserUpdate = {
      bio?: string;
      pfp?: string;
      social?: {
        discord?: string;
        instagram?: string;
        youtube?: string;
        twitch?: string;
        [key: string]: string | undefined;
      };
    };
    
    const update: UserUpdate = {};
    
    // Validate and sanitize bio
    if (data.bio !== undefined) {
      if (typeof data.bio !== 'string') {
        return NextResponse.json(
          { error: 'Bio must be a string' },
          { status: 400 }
        );
      }
      
      if (data.bio.length > 500) {
        return NextResponse.json(
          { error: 'Bio cannot exceed 500 characters' },
          { status: 400 }
        );
      }
      
      update.bio = sanitizeInput(data.bio);
    }
    
    // Validate and sanitize profile picture URL
    if (data.pfp !== undefined) {
      if (typeof data.pfp !== 'string') {
        return NextResponse.json(
          { error: 'Profile picture URL must be a string' },
          { status: 400 }
        );
      }
      
      if (data.pfp && !isValidUrl(data.pfp)) {
        return NextResponse.json(
          { error: 'Invalid profile picture URL format' },
          { status: 400 }
        );
      }
      
      update.pfp = sanitizeInput(data.pfp);
    }
    
    // Validate and sanitize social links
    if (data.social !== undefined) {
      if (typeof data.social !== 'object' || data.social === null) {
        return NextResponse.json(
          { error: 'Social links must be an object' },
          { status: 400 }
        );
      }
      
      update.social = {};
      
      // Validate each social platform
      const allowedPlatforms = ['discord', 'instagram', 'youtube', 'twitch'];
      
      for (const platform of allowedPlatforms) {
        if (data.social[platform] !== undefined) {
          if (typeof data.social[platform] !== 'string') {
            return NextResponse.json(
              { error: `${platform} link must be a string` },
              { status: 400 }
            );
          }
          
          // Only validate non-empty URLs
          if (data.social[platform] && !isValidUrl(data.social[platform])) {
            return NextResponse.json(
              { error: `Invalid ${platform} URL format` },
              { status: 400 }
            );
          }
          
          update.social[platform] = sanitizeInput(data.social[platform]);
        }
      }
    }
    
    // Update user with error handling
    try {
      const user = await User.findOneAndUpdate(
        { clerkId: userId },
        update,
        { new: true }
      );
      
      if (!user) {
        return NextResponse.json(
          { error: 'Profile not found' },
          { status: 404 }
        );
      }
      
      // Invalidate staff cache if user has staff role
      const userRoles = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['user']);
      
      
      // Return sanitized updated user data
      return NextResponse.json({
        user: {
          _id: user._id,
          clerkId: user.clerkId,
          username: user.username,
          email: user.email,
          bio: user.bio || '',
          pfp: user.pfp || user.imageUrl || '',
          social: user.social || {},
          role: user.role,
          roles: userRoles,
          points: user.points || 0
        }
      });
    } catch (updateError) {
      console.error('User update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in profile PATCH API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}