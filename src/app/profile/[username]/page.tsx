import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models";
import { auth } from "@clerk/nextjs/server";
import ProfileClient from "../ProfileClient";
import { Metadata } from "next";
import Image from "next/image";
import { logToDiscordWebhook } from "@/lib/discord-webhook";
import Script from "next/script";


// Import icons
import { 
  FaDiscord, 
  FaInstagram, 
  FaYoutube, 
  FaTwitch, 
  FaUserAlt, 
  FaLink,
  FaCrown,
  FaShieldAlt,
  FaHandsHelping,
  FaUser
} from "react-icons/fa";

const defaultSocial = {
  discord: '',
  instagram: '',
  youtube: '',
  twitch: '',
};

// Map social platforms to their respective icons
const socialIcons = {
  discord: FaDiscord,
  instagram: FaInstagram,
  youtube: FaYoutube,
  twitch: FaTwitch,
};

// Role grouping logic
const ADMIN_ROLES = ['owner', 'co-owner', 'admin'];
const STAFF_ROLES = ['staff', 'verificator', 'encoder', 'traducator', 'editormanga', 'verificatormanga', 'traducatormanga'];

function getRoleGroups(roles: string[]) {
  const admin: string[] = [];
  const staff: string[] = [];
  const other: string[] = [];
  for (const role of roles) {
    const r = role.toLowerCase();
    if (ADMIN_ROLES.includes(r)) admin.push(role);
    else if (STAFF_ROLES.includes(r)) staff.push(role);
    else other.push(role);
  }
  return { admin, staff, other };
}

type Props = {
  params: { username: string };
};

// Reusable connection
const dbConnection = connectToDatabase().catch(async (err) => {
  await logToDiscordWebhook(`Error connecting to database: ${err}`);
});

// For generateMetadata
export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  await dbConnection;
  const { username } = await params;
  const user = await User.findOne({ username }).select('username bio imageUrl role roles').lean() as any;

  if (!user) {
    return {
      title: "Profil Negăsit",
      description: "Profilul solicitat nu a putut fi găsit",
    };
  }

  const baseUrl = process.env.SITE_URL || 'https://HentaiUnited.ro';
  const canonicalUrl = `${baseUrl}/profile/${username}`;
  
  const title = `Profilul utilizatorului ${user.username}`;
  const description = user.bio || "Acest utilizator nu are un bio";
  const imageUrl = user.imageUrl || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTQBUvIrjWFCT_r4FhlT2T3vJLLdCRRV5WFA&s';
  const role = user.role || 'User';
  return {
    title,
    description,
    metadataBase: new URL(baseUrl as string),
    alternates: {
      canonical: `/profile/${username}`,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Poza de profil a utilizatorului ${user.username}`,
        },
      ],
      type: 'website',
      locale: 'ro_RO',
      siteName: 'HentaiUnited',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
      creator: '@HentaiUnited',
      site: '@HentaiUnited',
    },
    robots: {
      index: true,
      follow: true,
    },
    authors: [{ name: user.username }],
  };
}

// Component for profile not found
const ProfileNotFound = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="bg-[#1E1A2E]/80 rounded-xl p-8 text-center max-w-md shadow-lg border border-purple-900/30">
      <FaUserAlt className="text-red-400 text-5xl mx-auto mb-4 opacity-70" />
      <h2 className="text-2xl font-bold text-red-400 mb-2">Profil Negăsit</h2>
      <p className="text-gray-400">Profilul utilizatorului solicitat nu a putut fi găsit.</p>
    </div>
  </div>
);

// For PublicProfilePage
export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  // Await params and destructure username
  const { username } = await params;

  // Sanitize username parameter
  const sanitizedUsername = username
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  try {
    await dbConnection;
    
    const user = await User.findOne({ username: sanitizedUsername }).select('username clerkId imageUrl bio social role roles points').lean() as any;
    
    if (!user) {
      return <ProfileNotFound />;
    }
    
    const { userId } = await auth();
    const isOwner = userId && user.clerkId === userId;
    
    // Fetch economy data
    const { getProfileEconomyData } = await import("@/actions/economy.actions");
    const economyData = await getProfileEconomyData(sanitizedUsername);
    
    // Fix: Use JSON.parse(JSON.stringify()) to handle Date objects and other non-serializable values
    // Also add try/catch to handle potential JSON serialization errors
    let plainUser;
    try {
      plainUser = JSON.parse(JSON.stringify(user));
    } catch (error) {
      await logToDiscordWebhook(`Error serializing user data: ${error}`);
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-[#1E1A2E]/80 rounded-xl p-8 text-center max-w-md shadow-lg border border-purple-900/30">
            <FaUserAlt className="text-red-400 text-5xl mx-auto mb-4 opacity-70" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">Eroare de Sistem</h2>
            <p className="text-gray-400">A apărut o eroare la încărcarea profilului. Vă rugăm să încercați din nou.</p>
          </div>
        </div>
      );
    }
    
    // Helper function to safely display text
    const safeText = (text: string | undefined | null) => {
      if (!text) return '';
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiUnited';
    const siteUrl = process.env.SITE_URL || 'https://HentaiUnited.ro';
    const pageUrl = `${siteUrl}/profile/${sanitizedUsername}`;

    const profileSchema = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "name": `Profilul lui ${plainUser.username} | ${siteName}`,
      "description": plainUser.bio || `Profilul public al utilizatorului ${plainUser.username} pe ${siteName}.`,
      "url": pageUrl,
      "mainEntity": {
        "@type": "Person",
        "name": plainUser.username,
        "image": plainUser.imageUrl || `${siteUrl}/favicon.ico`,
        "jobTitle": plainUser.role || 'User',
        "knowsAbout": "Anime & Hentai"
      }
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Acasă",
          "item": siteUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Profil",
          "item": pageUrl
        }
      ]
    };

    const scriptsBlock = (
      <>
        <Script
          id={`profile-${plainUser.username}-structured-data`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema) }}
          strategy="afterInteractive"
        />
        <Script
          id={`profile-${plainUser.username}-breadcrumb`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          strategy="afterInteractive"
        />
      </>
    );

    if (isOwner) {
      return (
        <>
          {scriptsBlock}
          <ProfileClient user={plainUser} heading={plainUser.username} economyData={economyData} />
        </>
      );
    }
    
    const rank = economyData.rank;
    const watchHistory = economyData.watchHistory || [];
    const showcasedCards = economyData.userCards?.filter((c: any) => c.isShowcased) || [];

    // Enhanced public profile view - updated to match the preview UI
    return (
      <>
        {scriptsBlock}
        <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-b from-[#1E1A2E] to-[#272336] rounded-xl shadow-lg overflow-hidden">
          {/* Profile header with gradient background */}
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile image */}
              <div className="relative">
                <div className="w-32 h-32 border-4 border-purple-700/50 rounded-full p-1 bg-[#1E1A2E] shadow-xl">
                  <Image
                    src={plainUser.imageUrl || "/default-pfp.png"}
                    alt={`Poza de profil a utilizatorului ${safeText(plainUser.username)}`}
                    className="rounded-full object-cover w-full h-full"
                    width={128}
                    height={128}
                  />
                </div>
              </div>
              
              {/* User info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold text-white bg-clip-text bg-gradient-to-r from-white to-purple-300">
                  {safeText(plainUser.username)}
                </h1>
                
                <div className="flex flex-col gap-2 mt-2 justify-center md:justify-start items-start">
                  {(() => {
                    const userRoles = plainUser.roles && plainUser.roles.length > 0 ? plainUser.roles : plainUser.role ? [plainUser.role] : ['user'];
                    const { admin, staff, other } = getRoleGroups(userRoles);
                    
                    return (
                      <>
                        {admin.length > 0 && (
                          <div className="mb-1">
                            <div className="text-xs uppercase tracking-wider text-yellow-300/80 font-semibold mb-1 ml-1">Administrative roles:</div>
                            <div className="flex flex-wrap gap-2 items-center">
                              {admin.map((role, idx) => (
                                <span key={role + idx} className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 via-purple-500 to-pink-500 text-xs text-white font-bold border-2 border-yellow-400 shadow-md animate-pulse uppercase tracking-wide">
                                  {role.toLowerCase() === 'owner' ? <FaCrown className="w-4 h-4 mr-1 text-yellow-300" /> : <FaShieldAlt className="w-4 h-4 mr-1 text-purple-200" />} {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {staff.length > 0 && (
                          <div className="mb-1">
                            <div className="text-xs uppercase tracking-wider text-purple-300/80 font-semibold mb-1 ml-1">Staff roles:</div>
                            <div className="flex flex-wrap gap-2 items-center">
                              {staff.map((role, idx) => (
                                <span key={role + idx} className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-800/80 text-xs text-purple-100 font-bold border border-purple-500 shadow-sm uppercase tracking-wide">
                                  <FaHandsHelping className="w-4 h-4 mr-1 text-blue-300" /> {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {other.length > 0 && (
                          <div className="mb-1">
                            <div className="text-xs uppercase tracking-wider text-gray-400/80 font-semibold mb-1 ml-1">Other roles:</div>
                            <div className="flex flex-wrap gap-2 items-center">
                              {other.map((role, idx) => (
                                <span key={role + idx} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-800 text-xs text-gray-200 font-bold border border-gray-600 uppercase tracking-wide">
                                  <FaUser className="w-3 h-3 mr-1 text-gray-400" /> {role}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                <div className="mt-2 text-gray-400 text-sm">
                  Pasionat de anime
                </div>
                
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs">Puncte</span>
                    <span className="font-bold text-amber-400 text-lg">{plainUser.points || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-xs">Rank</span>
                    {rank ? (
                      <span className="font-bold text-lg" style={{ color: rank.color }}>{rank.name}</span>
                    ) : (
                      <span className="font-bold text-gray-300 text-lg">Incepător</span>
                    )}
                  </div>
                </div>
                
                {/* Bio with styled container */}
                {plainUser.bio ? (
                  <div className="mt-4 bg-purple-900/10 border border-purple-900/20 rounded-lg p-3">
                    <p className="text-gray-300 italic">&quot;{safeText(plainUser.bio)}&quot;</p>
                  </div>
                ) : (
                  <div className="mt-4 bg-neutral-900/50 border border-neutral-800 rounded-lg p-3">
                    <p className="text-gray-500 italic">Acest utilizator nu a adăugat încă o descriere</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Social links */}
          <div className="p-6">
            <div className="mt-2">
              <h3 className="text-gray-300 text-lg font-medium mb-3 flex items-center">
                <FaLink className="mr-2 text-purple-500" /> Rețele Sociale
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(defaultSocial).map((platform) => {
                  const Icon = socialIcons[platform as keyof typeof socialIcons] || FaLink;
                  const link = plainUser.social?.[platform];
                  
                  return (
                    <div 
                      key={platform} 
                      className={`flex items-center p-3 rounded-lg ${
                        link ? 'bg-purple-900/20' : 'bg-neutral-900/50'
                      }`}
                    >
                      <Icon className={`text-xl mr-3 ${link ? 'text-purple-400' : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <p className="text-gray-400 text-xs mb-1 capitalize">{platform}</p>
                        {link ? (
                          <a 
                            href={link.startsWith('http') ? safeText(link) : `https://${safeText(link)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-200 text-sm hover:text-purple-400 transition-colors break-all"
                          >
                            {safeText(link)}
                          </a>
                        ) : (
                          <span className="text-gray-500 text-sm">Nesetat</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Showcase section */}
            {showcasedCards.length > 0 && (
              <div className="mt-8 border-t border-purple-900/20 pt-6">
                <h3 className="text-gray-300 text-lg font-medium mb-4 flex items-center justify-between">
                  <span>Cartonașe Showcased</span>
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {showcasedCards.map((c: any) => (
                    <div key={c._id} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-purple-500/30">
                      <Image src={c.cardId.imageUrl} alt={c.cardId.name} fill className="object-cover" />
                      <div className="absolute bottom-0 w-full bg-black/80 text-center text-xs p-1 text-white font-bold">{c.cardId.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity section */}
            <div className="mt-8 border-t border-purple-900/20 pt-6">
              <h3 className="text-gray-300 text-lg font-medium mb-4">Activitate Recentă</h3>
              
              {watchHistory.length > 0 ? (
                <div className="space-y-3">
                  {watchHistory.map((w: any) => (
                    <div key={w._id} className="bg-neutral-900/50 p-3 rounded-lg border border-purple-900/20 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-bold text-gray-200">{w.episodeId?.animeId?.name}</div>
                        <div className="text-xs text-gray-400">{w.episodeId?.displayTitle}</div>
                      </div>
                      <div className="text-xs text-amber-400 font-bold">+{w.pointsEarned} pct</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-neutral-900/40 rounded-lg p-6 text-center">
                  <p className="text-gray-400">Nu există activitate recentă de afișat</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </>
    );
  } catch (error) {
    await logToDiscordWebhook(`Error loading profile page: ${error}`);
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-[#1E1A2E]/80 rounded-xl p-8 text-center max-w-md shadow-lg border border-purple-900/30">
          <FaUserAlt className="text-red-400 text-5xl mx-auto mb-4 opacity-70" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Eroare de Sistem</h2>
          <p className="text-gray-400">A apărut o eroare la încărcarea profilului. Vă rugăm să încercați din nou.</p>
        </div>
      </div>
    );
  }
}
