"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiHome,
  HiFilm,
  HiMenu,
  HiX,
  HiUserGroup,
  HiHeart,
  HiUser,
  HiShieldCheck,
  HiMail,
  HiInformationCircle,
  HiBookOpen,
  HiStar,
} from "react-icons/hi";
import { FaDiscord, FaBook, FaGhost } from "react-icons/fa";
import { FaEarthEurope } from "react-icons/fa6";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { isFullAdmin, canManageContent } from "@/lib/admin-permissions";
import { Button, Input, cn } from "@/components/ui";
import { colors } from "@/styles/design-system";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  ariaLabel: string;
  requireAuth?: boolean;
  external?: boolean;
  admin?: boolean;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();

  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isStaffOrAdmin, setIsStaffOrAdmin] = useState(false);

  const [showMobileTop, setShowMobileTop] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll behavior
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY && currentScrollY > 20) {
            setShowMobileTop(false); // scrolling down
          } else {
            setShowMobileTop(true); // scrolling up
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync Clerk user to DB
  useEffect(() => {
    const syncUser = async () => {
      if (user && isSignedIn) {
        try {
          let username = user.username || user.firstName || user.id;
          
          const response = await fetch("/api/user/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clerkId: user.id,
              email: user.primaryEmailAddress?.emailAddress,
              username,
              imageUrl: user.imageUrl,
            }),
          });
          
          if (response.status === 409) {
            // Username conflict - try with a unique fallback
            const fallbackUsername = `${username}_${user.id.slice(-6)}`;
            console.log(`Username '${username}' taken, trying '${fallbackUsername}'`);
            
            const retryResponse = await fetch("/api/user/sync", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                clerkId: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                username: fallbackUsername,
                imageUrl: user.imageUrl,
              }),
            });
            
            if (!retryResponse.ok) {
              const errorData = await retryResponse.json();
              throw new Error(`Failed to sync user data: ${errorData.message || 'Unknown error'}`);
            }
            
            const retryData = await retryResponse.json();
            if (retryData.user) localStorage.setItem("lastUserSync", Date.now().toString());
          } else if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to sync user data: ${errorData.message || 'Unknown error'}`);
          } else {
            const data = await response.json();
            if (data.user) localStorage.setItem("lastUserSync", Date.now().toString());
          }
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      }
    };
    syncUser();
  }, [user, isSignedIn]);

  // Fetch user roles
  useEffect(() => {
    if (!isSignedIn) {
      setUserRoles([]);
      setIsStaffOrAdmin(false);
      return;
    }

    // Add a small delay to ensure user sync completes first
    const fetchUserProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          const roles = data.user?.roles || [];
          setUserRoles(roles);
          setIsStaffOrAdmin(isFullAdmin({ roles }));
        } else if (res.status === 404) {
          // User might still be syncing, retry after a short delay
          setTimeout(fetchUserProfile, 500);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    // Wait a bit for user sync to complete
    setTimeout(fetchUserProfile, 500);
  }, [isSignedIn]);

  const isActivePath = (path: string) => pathname === path;


  const navItems: NavItem[] = [
    {
      name: "Home",
      href: "/home",
      icon: HiHome,
      ariaLabel: "Home",
    },
    {
      name: "Hentai",
      href: "/hentais",
      icon: HiFilm,
      ariaLabel: "Hentai",
    },
    {
      name: "Manga",
      href: process.env.NEXT_PUBLIC_MANGA_URL || "https://mangaterra.ro",
      icon: HiBookOpen,
      ariaLabel: "Manga",
      external: true,
    },
    {
      name: "Anime",
      href: process.env.NEXT_PUBLIC_ANIME_URL || "https://animeterra.ro",
      icon: FaGhost,
      ariaLabel: "Anime",
    },
    {
      name: "Watchlist",
      href: "/watchlist",
      icon: HiHeart,
      ariaLabel: "Watchlist",
      requireAuth: true,
    },
    {
      name: "Staff",
      href: "/staff",
      icon: HiShieldCheck,
      ariaLabel: "Staff",
    },
    {
      name: "ThePornDude",
      href: "https://theporndude.com/ro",
      icon: HiStar,
      ariaLabel: "ThePornDude",
      external: true,
    },
  ];

  // Show Dashboard for users who can manage content (admin, staff, owner, co-owner)
  if (canManageContent({ roles: userRoles })) {
    navItems.push({
      name: "Dashboard",
      href: "/admin",
      icon: HiUserGroup,
      ariaLabel: "Dashboard",
      admin: true,
    });
  }

  const mobileNavItems: NavItem[] = [...navItems];

  if (isSignedIn) {
    mobileNavItems.push({
      name: "Profile",
      href: user?.username ? `/profile/${encodeURIComponent(user.username)}` : "/profile",
      icon: HiUser,
      ariaLabel: "Profile",
    });
  }

  const profileUrl = user?.username ? `/profile/${encodeURIComponent(user.username)}` : "/profile";
  const watchlistVisible = isSignedIn;
  const adminVisible = canManageContent({ roles: userRoles });
  const desktopMaxWidth = adminVisible ? 'max-w-[1250px]' : (watchlistVisible ? 'max-w-[1150px]' : 'max-w-[1100px]');

  return (
    <>
      {/* Mobile Top Navbar */}
      <nav className={cn(
        "lg:hidden fixed top-0 left-0 w-full z-50 flex items-center justify-between px-4 py-2 transition-transform duration-300",
        "bg-black/90 border-b border-white/10 backdrop-blur-md",
        showMobileTop ? 'translate-y-0' : '-translate-y-full'
      )}>
        <Link href="/home" className={cn(
          "flex items-center gap-2 font-bold text-lg transition-colors duration-200",
          "text-white hover:text-primary-300"
        )}>
          <FaEarthEurope className={cn("w-6 h-6", "text-primary-500")} />
          <span className="tracking-wide">{process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}</span>
        </Link>
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link
              href={profileUrl}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full font-semibold transition-all duration-200",
                "text-gray-200 hover:bg-white/10 hover:text-white"
              )}
              aria-label="Profile"
            >
              <HiUser className="h-5 w-5" />
              <span className="font-medium">Profile</span>
            </Link>
          </SignedIn>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
            className={cn(
              "p-2 text-gray-300 hover:text-primary-400 rounded-lg",
              "hover:bg-primary-900/10 transition-all duration-200"
            )}
            aria-label="Open menu"
          >
            <HiMenu className="h-6 w-6" />
          </Button>
        </div>
      </nav>

      {/* Sidebar Menu */}
      {mobileMenuOpen && (
        <div className={cn(
          "fixed inset-0 z-[100] flex flex-col animate-fadeIn",
          "bg-black/95 backdrop-blur-lg"
        )}>
          <div className={cn(
            "flex items-center justify-end px-4 py-3",
            "border-b border-white/10"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "p-2 text-gray-400 hover:text-white",
                "hover:bg-white/10 rounded-lg transition-colors duration-200"
              )}
              aria-label="Close menu"
            >
              <HiX className="h-6 w-6" />
            </Button>
          </div>
          <div className="flex-1 flex flex-col gap-4 px-6 py-6 overflow-y-auto">
            {/* Main Content */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Content</h3>
              <div className="space-y-1">
                {["Home", "Hentai", "Anime", "Watchlist", "Manga", "ThePornDude"].map(itemName => {
                  const item = navItems.find(nav => nav.name === itemName);
                  if (!item) return null;
                  if (item.requireAuth && !isSignedIn) return null;
                  if (item.external) {
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel={item.name === "ThePornDude" ? "noopener noreferrer nofollow" : "noopener noreferrer"}
                        className={cn(
                          "flex items-center gap-3 text-white py-3 px-3 rounded-lg transition-colors",
                          item.name === "ThePornDude"
                            ? "hover:bg-white/5"
                            : "hover:bg-white/10"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className={cn("h-5 w-5", item.name === "ThePornDude" ? "text-pink-300" : "text-purple-400")} />
                        <span>{item.name}</span>
                      </a>
                    );
                  }
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 text-white py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 text-purple-400" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Community */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Community</h3>
              <div className="space-y-1">
                <Link
                  href="/staff"
                  className="flex items-center gap-3 text-white py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HiUserGroup className="h-5 w-5 text-purple-400" />
                  <span>Staff</span>
                </Link>
                <Link
                  href="/recruit"
                  className="flex items-center gap-3 text-white py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HiUserGroup className="h-5 w-5 text-purple-400" />
                  <span>Recruit</span>
                </Link>
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/SwvnaKc49N"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaDiscord className="h-5 w-5 text-purple-400" />
                  <span>Discord</span>
                </a>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Support</h3>
              <div className="space-y-1">
                <Link
                  href="/donate"
                  className="flex items-center gap-3 text-white py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HiHeart className="h-5 w-5 text-purple-400" />
                  <span>Donate</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 text-white py-3 px-3 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HiMail className="h-5 w-5 text-purple-400" />
                  <span>Contact</span>
                </Link>
              </div>
            </div>

            {/* Dashboard for staff */}
            {userRoles.includes("staff") && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Admin</h3>
                <div className="space-y-1">
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 text-purple-400 py-3 px-3 rounded-lg hover:bg-purple-900/20 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiShieldCheck className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navbar */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95vw] max-w-md mx-auto rounded-2xl bg-black/90 border border-white/10 shadow-2xl backdrop-blur-md px-2 py-2 flex items-center justify-around" style={{boxShadow: '0 4px 24px 0 rgba(0,0,0,0.4)'}}>
        {mobileNavItems.map((item) => {
          if (item.requireAuth && !isSignedIn) return null;
          const isActive = isActivePath(item.href);
          if (item.external) {
            return (
              <a
                key={item.name}
                href={item.href}
                target="_blank"
                rel={item.name === "ThePornDude" ? "noopener noreferrer nofollow" : "noopener noreferrer"}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  item.name === "ThePornDude"
                    ? "text-pink-300 hover:text-pink-400 hover:bg-white/5"
                    : isActive
                      ? "text-purple-400 bg-purple-900/20"
                      : "text-gray-400 hover:text-purple-400 hover:bg-white/5"
                }`}
                aria-label={item.ariaLabel}
              >
                <item.icon className="h-6 w-6" />
              </a>
            );
          }
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-purple-400 bg-purple-900/20"
                  : "text-gray-400 hover:text-purple-400 hover:bg-white/5"
              }`}
              aria-label={item.ariaLabel}
            >
              <item.icon className="h-6 w-6" />
            </Link>
          );
        })}
      </nav>

      {/* Desktop Navbar */}
      <nav
        className={cn(
          "hidden lg:flex fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full",
          desktopMaxWidth,
          "mx-auto rounded-full bg-black/60 border border-white/10 shadow-xl backdrop-blur-md",
          "px-2 py-1 items-center justify-between transition-[max-width] duration-300 ease-out"
        )}
      >
        <Link href="/home" className={cn(
          "flex items-center gap-2 font-bold text-lg ml-1 transition-colors duration-200",
          "text-white hover:text-primary-300"
        )}>
          <FaEarthEurope className={cn("w-6 h-6", "text-primary-500")} />
          <span className="tracking-wide">{process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}</span>
        </Link>
        <div className="flex-1 flex justify-center gap-0.5">
          {navItems.map((item) => {
            if (item.requireAuth && !isSignedIn) return null;
            const isActive = isActivePath(item.href);
            if (item.external) {
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel={item.name === "ThePornDude" ? "noopener noreferrer nofollow" : "noopener noreferrer"}
                  className={cn(
                    "flex items-center gap-2 py-1.5 rounded-full font-semibold transition-all duration-200",
                    item.name === "ThePornDude" ? "px-5 ring-1 ring-pink-300/20 text-gray-200 hover:bg-white/10" : (item.admin && item.name === 'Dashboard' ? 'px-6' : 'px-4'),
                    item.name === "ThePornDude"
                      ? ""
                      : isActive
                        ? "bg-white/20 shadow-lg text-white backdrop-blur-lg"
                        : item.admin
                          ? "text-primary-500 hover:bg-primary-900/30"
                          : "text-gray-200 hover:bg-white/10",
                    isActive && item.admin ? "text-white" : ""
                  )}
                  aria-label={item.ariaLabel}
                >
                  <item.icon className={cn("h-5 w-5", item.name === "ThePornDude" ? "text-pink-300" : "")} />
                  <span className="hidden md:inline">{item.name}</span>
                </a>
              );
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 py-1.5 rounded-full font-semibold transition-all duration-200",
                  item.admin && item.name === 'Dashboard' ? 'px-6' : 'px-4',
                  isActive
                    ? "bg-white/20 shadow-lg text-white backdrop-blur-lg"
                    : item.admin
                      ? "text-primary-500 hover:bg-primary-900/30"
                      : "text-gray-200 hover:bg-white/10",
                  isActive && item.admin ? "text-white" : ""
                )}
                aria-label={item.ariaLabel}
              >
                <item.icon className="h-5 w-5" />
                <span className="hidden md:inline">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Profile Section */}
      <div className="hidden lg:flex fixed top-6 right-[calc(2vw+8px)] z-[60] h-[56px] items-center">
        <div className="flex items-center gap-2">
          <SignedOut>
            <SignInButton>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "border-primary-700 bg-black/40 font-semibold shadow-sm",
                  colors.primary[500],
                  "hover:bg-primary-900/30 hover:text-white"
                )}
              >
                Sign in
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="relative flex items-center gap-2">
              <Link
                href={profileUrl}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-full font-semibold transition-all duration-200",
                  "text-gray-200 hover:bg-white/10 hover:text-white"
                )}
                aria-label="Profile"
              >
                <span className="hidden md:inline font-medium">Profile</span>
                {userRoles.includes("staff") &&
                  !["admin", "owner", "co-owner"].some((role) => userRoles.includes(role)) && (
                    <span className={cn(
                      "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs text-white font-bold",
                      "bg-primary-700/80"
                    )}>
                      <HiShieldCheck className="w-4 h-4 mr-0.5" /> Staff
                    </span>
                  )}
                {userRoles.some((role) => ["admin", "owner", "co-owner"].includes(role)) && (
                  <span className={cn(
                    "flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs text-white font-bold",
                    "bg-primary-700/80"
                  )}>
                    <HiShieldCheck className="w-4 h-4 mr-0.5" /> Admin
                  </span>
                )}
              </Link>
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>
    </>
  );
}
