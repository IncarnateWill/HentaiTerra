import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { User } from '@/models';
import { isFullAdmin } from '@/lib/admin-permissions';
import { ResponseMonitor } from '@/lib/response-monitor';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = await User.findOne({ clerkId: userId }).lean();
  if (!admin || typeof admin !== 'object' || Array.isArray(admin) || !isFullAdmin(admin as { roles?: string[] })) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Pagination, search, and role filtering
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '20', 10)));
  const search = url.searchParams.get('search') || '';
  const roleFilter = url.searchParams.get('role') || '';
  const query: any = {};
  
  // Build query conditions
  const conditions: any[] = [];
  
  if (search) {
    conditions.push({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    });
  }
  
  if (roleFilter) {
    conditions.push({
      $or: [
        { roles: roleFilter },
        { role: roleFilter } // Support legacy role field
      ]
    });
  }
  
  if (conditions.length > 0) {
    query.$and = conditions;
  }
  const total = await User.countDocuments(query);
  const usersRaw = await User.find(query, 'username email roles role clerkId')
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  const users = usersRaw.map(u => ({
    ...u,
    roles: Array.isArray(u.roles) && u.roles.length > 0
      ? u.roles
      : u.role ? [u.role] : ['user'],
  }));
  return ResponseMonitor.monitorResponse({ users, total, page, totalPages: Math.ceil(total / limit) });
  // Removed Cache-Control headers
}

export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = await User.findOne({ clerkId: userId }).lean();
  if (!admin || typeof admin !== 'object' || Array.isArray(admin) || !isFullAdmin(admin as { roles?: string[] })) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { clerkId, roles, username, email } = await req.json();
  if (!clerkId) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

  const update: any = {};
  const allowedRoles = ['user', 'owner', 'co-owner', 'admin', 'encoder', 'verificator', 'traducator', 'staff'];
  if (roles) {
    if (!Array.isArray(roles) || roles.some((r: string) => !allowedRoles.includes(r))) {
      return NextResponse.json({ error: 'Invalid roles' }, { status: 400 });
    }
    update.roles = roles;
    update.$unset = { role: "" };
  }
  if (username !== undefined) {
    if (typeof username !== 'string' || username.length < 3) return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    update.username = username;
  }
  if (email !== undefined) {
    if (typeof email !== 'string' || !email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    update.email = email;
  }
  if (Object.keys(update).length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

  const user = await User.findOneAndUpdate({ clerkId }, update, { new: true }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ user });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const admin = await User.findOne({ clerkId: userId }).lean();
  if (!admin || typeof admin !== 'object' || Array.isArray(admin) || !isFullAdmin(admin as { roles?: string[] })) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { clerkId } = await req.json();
  if (!clerkId) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  if (clerkId === userId) return NextResponse.json({ error: 'You cannot delete yourself.' }, { status: 400 });

  const user = await User.findOneAndDelete({ clerkId }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}