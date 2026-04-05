"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { isFullAdmin, canManageContent } from "@/lib/admin-permissions";

export default function DebugUserPage() {
  const { user, isSignedIn } = useUser();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isSignedIn) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        } else {
          const errorData = await response.json();
          setError(`API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
      } catch (err) {
        setError(`Network Error: ${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Debug User Permissions</h1>
        <p className="text-red-400">Please sign in to debug your permissions.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Debug User Permissions</h1>
        <p>Loading...</p>
      </div>
    );
  }

  const roles = userProfile?.user?.roles || [];
  const hasFullAdmin = isFullAdmin({ roles });
  const hasContentPermission = canManageContent({ roles });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Debug User Permissions</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Clerk User Data</h2>
          <pre className="text-sm overflow-auto bg-gray-700 p-3 rounded">
            {JSON.stringify({
              id: user?.id,
              emailAddresses: user?.emailAddresses?.map(e => e.emailAddress),
              username: user?.username,
              firstName: user?.firstName,
              lastName: user?.lastName
            }, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Database User Profile</h2>
          {error ? (
            <p className="text-red-400">{error}</p>
          ) : (
            <pre className="text-sm overflow-auto bg-gray-700 p-3 rounded">
              {JSON.stringify(userProfile, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Permission Analysis</h2>
          <div className="space-y-2">
            <p><strong>Roles Array:</strong> {JSON.stringify(roles)}</p>
            <p><strong>Is Full Admin:</strong> <span className={hasFullAdmin ? 'text-green-400' : 'text-red-400'}>{hasFullAdmin ? 'YES' : 'NO'}</span></p>
            <p><strong>Can Manage Content:</strong> <span className={hasContentPermission ? 'text-green-400' : 'text-red-400'}>{hasContentPermission ? 'YES' : 'NO'}</span></p>
            <p><strong>Should Have Admin Access:</strong> <span className={hasFullAdmin || hasContentPermission ? 'text-green-400' : 'text-red-400'}>{hasFullAdmin || hasContentPermission ? 'YES' : 'NO'}</span></p>
          </div>
        </div>

        <div className="bg-blue-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Expected Roles for Admin Access</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Full Admin:</strong> owner, co-owner, admin</li>
            <li><strong>Content Management:</strong> owner, co-owner, admin, staff</li>
          </ul>
        </div>

        <div className="bg-yellow-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Troubleshooting</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Check if your user exists in the database (see Database User Profile above)</li>
            <li>Verify your roles array contains the expected roles</li>
            <li>If roles are empty or incorrect, contact an administrator to update your roles</li>
            <li>Try refreshing the page or signing out and back in</li>
          </ol>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Quick Actions</h2>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mr-2"
            >
              Refresh Page
            </button>
            <a 
              href="/admin" 
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded inline-block"
            >
              Try Admin Access
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}