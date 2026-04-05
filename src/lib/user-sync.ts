export async function syncUserData(user: any) {
  const now = Date.now();
  const lastSync = localStorage.getItem('lastUserSync');
  const SYNC_COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours

  if (lastSync && now - parseInt(lastSync) < SYNC_COOLDOWN) {
    return null; // Skip if synced recently
  }

  try {
    const response = await fetch("/api/user/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username || user.firstName || user.id,
        imageUrl: user.imageUrl,
      }),
    });
    const result = await response.json();
    if (result.user) {
      localStorage.setItem('lastUserSync', now.toString());
    }
    return result;
  } catch (error) {
    console.error("Error syncing user data:", error);
    return null;
  }
}