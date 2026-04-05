'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { HiPencil } from 'react-icons/hi';
import { canManageContent } from '@/lib/admin-permissions';
import { Button } from '@/components/ui';

interface QuickEditButtonProps {
  /** The edit URL to redirect to */
  editUrl: string;
  /** Optional custom label for the button */
  label?: string;
  /** Optional custom styling */
  className?: string;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
}

const QuickEditButton = ({
  editUrl,
  label = 'Quick Edit',
  className = '',
  size = 'sm',
  variant = 'outline'
}: QuickEditButtonProps) => {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user roles and check permissions
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!isSignedIn || !user) {
        console.log('QuickEditButton: User not signed in or user object missing');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const responseData = await response.json();
          // API returns user data nested under 'user' property
          const userData = responseData.user || responseData;
          const roles = userData.roles || [];
          setUserRoles(roles);
          const permission = canManageContent({ roles });
          setHasPermission(permission || false);
          
          // Only log if debugging is enabled (check localStorage)
          if (localStorage.getItem('debug-quickedit') === 'true') {
            console.log('QuickEditButton Debug:', {
              roles,
              permission,
              userData: userData,
              responseData: responseData
            });
          }
        } else {
          console.error('QuickEditButton: Failed to fetch user profile:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('QuickEditButton: Error fetching user roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [isSignedIn, user]);

  const handleClick = () => {
    router.push(editUrl);
  };

  // Don't render if user doesn't have permission or is loading
  const debugEnabled = typeof window !== 'undefined' && localStorage.getItem('debug-quickedit') === 'true';
  
  if (debugEnabled) {
    console.log('QuickEditButton render check:', { isLoading, hasPermission, isSignedIn, userRoles });
  }
  
  if (isLoading) {
    if (debugEnabled) console.log('QuickEditButton: Still loading, not rendering');
    return null;
  }
  
  if (!hasPermission) {
    if (debugEnabled) console.log('QuickEditButton: No permission, not rendering');
    return null;
  }
  
  if (debugEnabled) {
    console.log('QuickEditButton: Rendering button with editUrl:', editUrl);
  }

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      icon={<HiPencil className="w-4 h-4" />}
      iconPosition="left"
      className={`
        transition-all duration-200 
        hover:scale-105 
        focus:ring-2 focus:ring-blue-500/50 focus:outline-none
        ${className}
      `}
      aria-label={`${label} - Opens edit page`}
      title={`${label} - Opens edit page`}
    >
      {label}
    </Button>
  );
};

export default QuickEditButton;