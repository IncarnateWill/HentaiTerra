"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  HiHome, HiFilm, HiMenu, HiX, HiUserGroup, HiHeart,
  HiUser, HiShieldCheck, HiSearch,
} from "react-icons/hi";
import { FaDiscord, FaGhost } from "react-icons/fa";
import { FaEarthEurope } from "react-icons/fa6";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { isFullAdmin, canManageContent } from "@/lib/admin-permissions";
import { cn } from "@/components/ui";
import { useDebounce } from "@/hooks/use-debounce";
import Image from "next/image";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  ariaLabel: string;
  requireAuth?: boolean;
  external?: boolean;
  admin?: boolean;
}

interface SearchResult {
  _id: string;
  name: string;
  poster: string;
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMobileTop, setShowMobileTop] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isStaffOrAdmin, setIsStaffOrAdmin] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Scroll behavior
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setShowMobileTop(currentScrollY <= lastScrollY || currentScrollY <= 20);
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Sync Clerk user
  useEffect(() => {
    const syncUser = async () => {
      if (!user || !isSignedIn) return;
      try {
        const username = user.username || user.firstName || user.id;
        const res = await fetch("/api/user/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clerkId: user.id, email: user.primaryEmailAddress?.emailAddress, username, imageUrl: user.imageUrl }),
        });
        if (res.status === 409) {
          await fetch("/api/user/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clerkId: user.id, email: user.primaryEmailAddress?.emailAddress, username: `${username}_${user.id.slice(-6)}`, imageUrl: user.imageUrl }),
          });
        }
      } catch {}
    };
    syncUser();
  }, [user, isSignedIn]);

  // Fetch roles
  useEffect(() => {
    if (!isSignedIn) { setUserRoles([]); setIsStaffOrAdmin(false); return; }
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          const roles = data.user?.roles || [];
          setUserRoles(roles);
          setIsStaffOrAdmin(isFullAdmin({ roles }));
        } else if (res.status === 404) {
          setTimeout(fetchProfile, 500);
        }
      } catch {}
    };
    setTimeout(fetchProfile, 500);
  }, [isSignedIn]);

  // Search functionality
  useEffect(() => {
    if (debouncedQuery.length < 2) { setSearchResults([]); return; }
    const fetchSearch = async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };
    fetchSearch();
  }, [debouncedQuery]);

  // Close search on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Auto-focus when search opens
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const isActivePath = (path: string) => pathname === path;

  const handleSearchSubmit = useCallback(() => {
    if (searchQuery.trim()) {
      sessionStorage.setItem("animeFilters", JSON.stringify({ genres: [], sort: "latest", search: searchQuery }));
      router.push("/hentais");
      setSearchOpen(false);
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [searchQuery, router]);

  const navItems: NavItem[] = [
    { name: "Acasă", href: "/home", icon: HiHome, ariaLabel: "Acasă" },
    { name: "Hentai", href: "/hentais", icon: HiFilm, ariaLabel: "Hentai" },
    { name: "Anime", href: process.env.NEXT_PUBLIC_ANIME_URL || "https://anime-united.ro", icon: FaGhost, ariaLabel: "Anime", external: true },
    { name: "Watchlist", href: "/watchlist", icon: HiHeart, ariaLabel: "Watchlist", requireAuth: true },
    { name: "Echipă", href: "/staff", icon: HiShieldCheck, ariaLabel: "Echipă" },
  ];

  if (canManageContent({ roles: userRoles })) {
    navItems.push({ name: "Dashboard", href: "/admin", icon: HiUserGroup, ariaLabel: "Dashboard", admin: true });
  }

  const mobileNavItems = [...navItems];
  if (isSignedIn) {
    mobileNavItems.push({ name: "Profil", href: user?.username ? `/profile/${encodeURIComponent(user.username)}` : "/profile", icon: HiUser, ariaLabel: "Profil" });
  }

  const profileUrl = user?.username ? `/profile/${encodeURIComponent(user.username)}` : "/profile";

  const renderNavLink = (item: NavItem) => {
    const isActive = isActivePath(item.href);
    const classes = cn(
      "relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200",
      isActive
        ? "text-white bg-primary-500/15 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
        : item.admin
        ? "text-primary-400 hover:bg-primary-500/10"
        : "text-gray-300 hover:text-white hover:bg-white/8"
    );
    const content = (
      <>
        <item.icon className={cn("h-4 w-4", isActive ? "text-primary-400" : "")} />
        <span className="hidden md:inline">{item.name}</span>
        {isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400" />
        )}
      </>
    );
    if (item.external) {
      return (
        <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className={classes} aria-label={item.ariaLabel}>
          {content}
        </a>
      );
    }
    return (
      <Link key={item.name} href={item.href} className={classes} aria-label={item.ariaLabel}>
        {content}
      </Link>
    );
  };

  return (
    <>
      {/* ── MOBILE TOP BAR ── */}
      <nav className={cn(
        "lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5",
        "bg-[#0a0b0f]/90 backdrop-blur-xl border-b border-white/5",
        "transition-transform duration-300",
        showMobileTop ? "translate-y-0" : "-translate-y-full"
      )}>
        <Link href="/home" className="flex items-center gap-2 font-bold text-base text-white hover:text-primary-300 transition-colors">
          <FaEarthEurope className="w-5 h-5 text-primary-500" />
          <span className="tracking-wide">{process.env.NEXT_PUBLIC_SITE_NAME || "HentaiTerra"}</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(true)}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/8 transition-all"
            aria-label="Caută"
          >
            <HiSearch className="h-5 w-5" />
          </button>
          <SignedOut>
            <SignInButton>
              <button className="px-3 py-1.5 text-xs font-semibold rounded-full border border-primary-500/50 text-primary-400 hover:bg-primary-500/10 transition-all">
                Autentificare
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href={profileUrl} className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-white/8 transition-all">
              <HiUser className="h-5 w-5" />
            </Link>
          </SignedIn>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/8 transition-all"
            aria-label="Deschide meniu"
          >
            <HiMenu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      {/* ── MOBILE SIDE MENU ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex animate-fadeIn">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative ml-auto w-[280px] h-full bg-[#0d0e14] border-l border-white/5 flex flex-col animate-slideIn overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <span className="font-bold text-white text-sm">{process.env.NEXT_PUBLIC_SITE_NAME || "HentaiTerra"}</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/8 transition-all">
                <HiX className="h-5 w-5" />
              </button>
            </div>
            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-3 mb-2">Conținut</p>
              {navItems.map((item) => {
                if (item.requireAuth && !isSignedIn) return null;
                const isActive = isActivePath(item.href);
                const cls = cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive ? "text-primary-300 bg-primary-500/10" : "text-gray-300 hover:text-white hover:bg-white/5"
                );
                if (item.external) return (
                  <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className="h-4 w-4 text-primary-400" />
                    <span>{item.name}</span>
                  </a>
                );
                return (
                  <Link key={item.name} href={item.href} className={cls} onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className={cn("h-4 w-4", isActive ? "text-primary-400" : "text-gray-500")} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="my-3 border-t border-white/5" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-600 px-3 mb-2">Comunitate</p>
              {[
                { name: "Discord", href: process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/SwvnaKc49N", icon: FaDiscord, ext: true },
                { name: "Donează", href: "/donate", icon: HiHeart, ext: false },
                { name: "Recrutare", href: "/recruit", icon: HiUserGroup, ext: false },
              ].map((item) => {
                const cls = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all";
                if (item.ext) return (
                  <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className="h-4 w-4 text-primary-400" /><span>{item.name}</span>
                  </a>
                );
                return (
                  <Link key={item.name} href={item.href} className={cls} onClick={() => setMobileMenuOpen(false)}>
                    <item.icon className="h-4 w-4 text-gray-500" /><span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            {/* Bottom sign-in */}
            <div className="p-4 border-t border-white/5">
              <SignedOut>
                <SignInButton>
                  <button className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 transition-all">
                    Autentificare
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <Link href={profileUrl} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all">
                  <HiUser className="h-5 w-5 text-primary-400" />
                  <span className="text-sm font-medium text-gray-200">Profilul meu</span>
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-sm mx-auto">
        <div className="flex items-center justify-around px-2 py-1.5 rounded-2xl bg-[#0d0e14]/95 border border-white/8 shadow-2xl backdrop-blur-xl" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)" }}>
          {mobileNavItems.slice(0, 5).map((item) => {
            if (item.requireAuth && !isSignedIn) return null;
            const isActive = isActivePath(item.href);
            const cls = cn(
              "mobile-nav-item flex-1",
              isActive ? "active" : "text-gray-500 hover:text-gray-300"
            );
            if (item.external) return (
              <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={item.ariaLabel}>
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold mt-0.5">{item.name}</span>
              </a>
            );
            return (
              <Link key={item.name} href={item.href} className={cls} aria-label={item.ariaLabel}>
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold mt-0.5">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ── DESKTOP NAVBAR ── */}
      <nav className={cn(
        "hidden lg:flex fixed top-0 left-0 right-0 z-50 items-center",
        "transition-all duration-300",
        isScrolled
          ? "bg-[#0a0b0f]/95 backdrop-blur-xl border-b border-white/5 shadow-[0_1px_0_rgba(255,255,255,0.04)]"
          : "bg-[#0a0b0f]/80 backdrop-blur-lg border-b border-white/3"
      )}>
        <div className="w-full max-w-[1440px] mx-auto px-6 py-0 flex items-center h-[60px] gap-4">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 font-bold text-white hover:text-primary-300 transition-colors shrink-0 mr-2">
            <FaEarthEurope className="w-6 h-6 text-primary-500" />
            <span className="text-[15px] tracking-wide">{process.env.NEXT_PUBLIC_SITE_NAME || "HentaiTerra"}</span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5">
            {navItems.map((item) => {
              if (item.requireAuth && !isSignedIn) return null;
              return renderNavLink(item);
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Inline Search */}
          <div ref={searchRef} className="relative flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-2 animate-scaleIn">
                <div className="relative">
                  <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSearchSubmit(); if (e.key === "Escape") { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); } }}
                    placeholder="Caută hentai..."
                    className="w-[240px] pl-9 pr-4 py-1.5 text-sm rounded-full border text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500/60 focus:border-primary-500/50 transition-all"
                    style={{ backgroundColor: '#12141c', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}
                    aria-label="Caută"
                  />
                </div>
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }} className="p-1.5 text-gray-500 hover:text-white rounded-full hover:bg-white/8 transition-all">
                  <HiX className="h-4 w-4" />
                </button>
                {/* Dropdown */}
                {(searchResults.length > 0 || searchLoading) && (
                  <div className="absolute top-full right-0 mt-2 w-[320px] rounded-2xl bg-[#0d0e14]/98 border border-white/8 shadow-2xl backdrop-blur-xl overflow-hidden animate-slideIn z-50">
                    {searchLoading ? (
                      <div className="p-4 space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-14 bg-white/5 rounded-lg shrink-0" />
                            <div className="space-y-2 flex-1"><div className="h-3 bg-white/5 rounded w-3/4" /><div className="h-2.5 bg-white/5 rounded w-1/2" /></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchResults.map((result) => (
                          <Link key={result._id} href={`/hentai/${result._id}`} onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                            className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors group">
                            <div className="relative w-9 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5">
                              <Image src={result.poster || "/placeholder.jpg"} alt={result.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="36px" />
                            </div>
                            <span className="text-sm font-medium text-gray-200 group-hover:text-primary-300 transition-colors line-clamp-2">{result.name}</span>
                          </Link>
                        ))}
                        <div className="px-3 py-2 border-t border-white/5">
                          <button onClick={handleSearchSubmit} className="w-full text-center text-xs font-semibold text-primary-400 hover:text-primary-300 py-1 transition-colors">
                            Toate rezultatele pentru &quot;{searchQuery}&quot; →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white hover:bg-white/8 border border-transparent hover:border-white/8 transition-all group"
                aria-label="Caută"
              >
                <HiSearch className="h-4 w-4" />
                <span className="text-xs text-gray-600 hidden xl:inline">Caută...</span>
                <kbd className="hidden xl:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-gray-600 bg-white/5 rounded border border-white/8">/</kbd>
              </button>
            )}
          </div>

          {/* Auth */}
          <div className="flex items-center gap-2 shrink-0">
            <SignedOut>
              <SignInButton>
                <button className="px-4 py-1.5 text-sm font-semibold rounded-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white transition-all shadow-lg shadow-primary-500/20">
                  Autentificare
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2">
                <Link href={profileUrl} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/8 transition-all">
                  <HiUser className="h-4 w-4" />
                  <span className="hidden xl:inline">Profil</span>
                  {userRoles.some(r => ["admin","owner","co-owner"].includes(r)) && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/20">
                      <HiShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  )}
                  {userRoles.includes("staff") && !userRoles.some(r => ["admin","owner","co-owner"].includes(r)) && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary-500/15 text-primary-300 border border-primary-500/20">
                      <HiShieldCheck className="w-3 h-3" /> Staff
                    </span>
                  )}
                </Link>
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>
    </>
  );
}
