import { getStaffMembers } from '@/lib/db-utils';
import Image from 'next/image';
import Link from 'next/link';
import { FaDiscord, FaTwitter, FaInstagram, FaYoutube, FaTwitch, FaUsers, FaStar } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Script from 'next/script';

export const dynamic = 'force-dynamic';
// Caching disabled for Cloudflare conflict diagnosis
// export const revalidate = 360000;

export const metadata = {
    title: `Echipa ${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')} - Staff și Contributori`,
    description: `Cunoaște echipa din spatele ${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}. Traducători, encoderi, și staff-ul care face totul posibil.`,
    alternates: {
        canonical: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/staff`
    },
    openGraph: {
        title: `Echipa ${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')} - Staff și Contributori`,
        description: `Cunoaște echipa din spatele ${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}. Traducători, encoderi, și staff-ul care face totul posibil.`,
        url: `${process.env.SITE_URL || 'https://HentaiTerra.ro'}/staff`,
        type: 'profile',
        images: [
            {
                url: process.env.NEXT_PUBLIC_OG_IMAGE || 'https://images2.alphacoders.com/913/913209.jpg',
                width: 1200,
                height: 630,
                alt: `Echipa ${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}`
            }
        ]
    }
};

interface StaffMember {
    _id: string;
    username?: string;
    imageUrl?: string;
    roles?: string[];
    bio?: string;
    social?: {
        discord?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
        twitch?: string;
    };
}

const getRoleColor = (role: string): { bg: string; text: string; border: string; glow: string } => {
    const colors: Record<string, { bg: string; text: string; border: string; glow: string }> = {
        'owner': {
            bg: 'bg-gradient-to-r from-red-500 to-pink-500',
            text: 'text-white',
            border: 'border-red-400/30',
            glow: 'shadow-red-500/25'
        },
        'co-owner': {
            bg: 'bg-gradient-to-r from-red-400 to-rose-400',
            text: 'text-white',
            border: 'border-red-300/30',
            glow: 'shadow-red-400/25'
        },
        'admin': {
            bg: 'bg-gradient-to-r from-purple-500 to-indigo-500',
            text: 'text-white',
            border: 'border-purple-400/30',
            glow: 'shadow-purple-500/25'
        },
        'staff': {
            bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
            text: 'text-white',
            border: 'border-green-400/30',
            glow: 'shadow-green-500/25'
        },
        'encoder': {
            bg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
            text: 'text-white',
            border: 'border-emerald-400/30',
            glow: 'shadow-emerald-500/25'
        },
        'verificator': {
            bg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
            text: 'text-white',
            border: 'border-yellow-400/30',
            glow: 'shadow-yellow-500/25'
        },
        'traducator': {
            bg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
            text: 'text-white',
            border: 'border-blue-400/30',
            glow: 'shadow-blue-500/25'
        },
    };
    return colors[role] || {
        bg: 'bg-gradient-to-r from-gray-500 to-slate-500',
        text: 'text-white',
        border: 'border-gray-400/30',
        glow: 'shadow-gray-500/25'
    };
};

const getRoleDisplayName = (role: string): string => {
    const displayNames: Record<string, string> = {
        'owner': 'Owner',
        'co-owner': 'Co-Owner',
        'admin': 'Administrator',
        'staff': 'Staff',
        'encoder': 'Encoder',
        'verificator': 'Verificator',
        'traducator': 'Translator',
    };
    return displayNames[role] || role.charAt(0).toUpperCase() + role.slice(1);
};

const roleHierarchy = ['owner', 'co-owner', 'admin', 'encoder', 'verificator', 'traducator'];

export default async function StaffPage() {
    const staffMembers = await getStaffMembers() as StaffMember[];

    // Group members by their first role in hierarchy
    const membersByRole = roleHierarchy.reduce((acc, role) => {
        acc[role] = staffMembers.filter(member =>
            member.roles?.includes(role)
        );
        return acc;
    }, {} as Record<string, StaffMember[]>);

    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra';
    const siteUrl = process.env.SITE_URL || 'https://HentaiTerra.ro';
    const pageUrl = `${siteUrl}/staff`;

    const staffListSchema = {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": `Echipa ${siteName} - Staff și Contributori`,
        "description": `Cunoaște echipa din spatele ${siteName}. Traducători, encoderi, și staff-ul care face totul posibil.`,
        "url": pageUrl,
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": staffMembers.length,
            "itemListElement": staffMembers.map((member, idx) => ({
                "@type": "ListItem",
                "position": idx + 1,
                "item": {
                    "@type": "Person",
                    "name": member.username || 'Staff Member',
                    "image": member.imageUrl || `${siteUrl}/favicon.ico`,
                    "jobTitle": member.roles ? member.roles.map(r => getRoleDisplayName(r)).join(', ') : 'Contributor',
                    "description": member.bio || `Membru al echipei ${siteName}`
                }
            }))
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
                "name": "Echipa",
                "item": pageUrl
            }
        ]
    };

    return (
        <>
            <Script
                id="staff-structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(staffListSchema) }}
                strategy="afterInteractive"
            />
            <Script
                id="staff-breadcrumb-structured-data"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                strategy="afterInteractive"
            />
            <div className="min-h-screen">
                {/* Hero Section */}
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none" />
                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

                    <div className="relative container mx-auto px-4 py-20">
                        <div className="text-center mb-20">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
                                <HiSparkles className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-purple-300 font-medium">Meet Our Team</span>
                            </div>

                            <h1 className="text-6xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent leading-tight">
                                Echipa {process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}
                            </h1>

                            <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12 font-light">
                                Cunoaște persoanele dedicate care fac posibilă experiența ta de vizionare hentai.
                                <br className="hidden md:block" />
                                Fiecare membru contribuie la calitatea platformei prin rolul său unic.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <Link
                                    href="/recruit"
                                    className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:brightness-110"
                                >
                                    <FaUsers className="w-4 h-4" />
                                    Alătură-te echipei
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />
                                </Link>

                                <div className="flex items-center gap-2 text-gray-400">
                                    <FaStar className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm">{staffMembers.length} membri activi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 pb-20">

                    {/* Staff by Role */}
                    <div className="space-y-16">
                        {Object.entries(membersByRole).map(([role, members]) => {
                            const roleColors = getRoleColor(role);
                            return members.length > 0 && (
                                <div key={role} className="relative">
                                    {/* Role Section Header */}
                                    <div className="text-center mb-12">
                                        <div className={`inline-flex items-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl mb-4 ${members.length > 3 ? 'scale-110' : ''} transition-transform duration-300`}>
                                            <div className={`w-3 h-3 rounded-full ${roleColors.bg} ${roleColors.glow} shadow-lg ${members.length > 3 ? 'animate-pulse' : ''}`} />
                                            <span className={`text-2xl font-bold text-white tracking-wide ${members.length > 3 ? 'bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent' : ''}`}>
                                                {getRoleDisplayName(role)}
                                            </span>
                                            <div className={`px-3 py-1 bg-white/10 rounded-full ${members.length > 3 ? 'bg-opacity-20' : ''}`}>
                                                <span className={`text-sm ${members.length > 3 ? 'text-purple-300' : 'text-gray-300'}`}>
                                                    {members.length}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Cards */}
                                    <div className="flex flex-wrap justify-center items-start gap-12 max-w-7xl mx-auto">
                                        {members.map((member, index) => {
                                            const memberRoleColors = getRoleColor(member.roles?.[0] || 'staff');
                                            const hasMultipleRoles = member.roles && member.roles.length > 3;
                                            const hasLongBio = member.bio && member.bio.length > 150;
                                            const hasExcessiveRoles = member.roles && member.roles.length > 5;
                                            const cardHeight = hasExcessiveRoles ? 'h-[28rem]' : hasMultipleRoles ? 'h-96' : hasLongBio ? 'h-88' : 'h-80';

                                            return (
                                                <div
                                                    key={member._id}
                                                    className={`group relative bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 w-80 ${cardHeight} flex-shrink-0 flex flex-col overflow-hidden`}
                                                    style={{ animationDelay: `${index * 100}ms`, overflow: 'hidden' }}
                                                >
                                                    {/* Gradient Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

                                                    <div className="relative text-center flex-1 flex flex-col min-h-0 z-10 overflow-hidden gap-1">
                                                        {/* Profile Image */}
                                                        <div className="relative w-20 h-20 mx-auto mb-2 flex-shrink-0">
                                                            <div className={`absolute inset-0 ${memberRoleColors.bg} rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`} />
                                                            <Image
                                                                src={member.imageUrl || '/default-pfp.png'}
                                                                alt={member.username || 'Membru Staff'}
                                                                fill
                                                                sizes="80px"
                                                                className="relative rounded-full object-cover border-3 border-white/20 group-hover:border-white/30 transition-all duration-300"
                                                            />
                                                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white/20 shadow-lg" />
                                                        </div>

                                                        {/* Username */}
                                                        <div className="mb-2 flex-shrink-0">
                                                            <h3 className="text-lg font-bold">
                                                                {member.username ? (
                                                                    <Link
                                                                        href={`/profile/${member.username}`}
                                                                        className="text-white hover:text-purple-300 transition-colors duration-300 cursor-pointer group-hover:text-purple-200 truncate block"
                                                                    >
                                                                        {member.username}
                                                                    </Link>
                                                                ) : (
                                                                    <span className="text-gray-400">Unknown User</span>
                                                                )}
                                                            </h3>
                                                        </div>

                                                        {/* Roles - Always constrained with proper overflow handling */}
                                                        <div className="flex flex-wrap gap-1 justify-center mb-2 px-2 flex-shrink-0 max-h-20 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                                            {member.roles?.map((memberRole) => {
                                                                const roleStyle = getRoleColor(memberRole);
                                                                return (
                                                                    <span
                                                                        key={memberRole}
                                                                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${roleStyle.bg} ${roleStyle.text} border ${roleStyle.border} shadow-lg ${roleStyle.glow} transition-all duration-300 hover:brightness-110 truncate`}
                                                                    >
                                                                        {getRoleDisplayName(memberRole)}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>

                                                        {/* Bio - Fixed height with proper overflow handling */}
                                                        <div className="flex-1 min-h-0 px-2 mb-2">
                                                            <p className="text-xs text-gray-300 leading-relaxed p-2 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 overflow-y-auto max-h-[5rem] break-words hyphens-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                                                                {member.bio || "HentaiTerra.ro este cel mai bun site pentru vizionat hentai în România"}
                                                            </p>
                                                        </div>

                                                        {/* Social Links */}
                                                        <div className="flex justify-center gap-1.5 pt-3 border-t border-white/10 mt-auto flex-shrink-0">
                                                            {/* Discord Link */}
                                                            <a
                                                                href={member.social?.discord ?
                                                                    (member.social.discord.startsWith('http') ? member.social.discord : `https://discord.com/users/${member.social.discord}`) :
                                                                    "https://HentaiTerra.ro"
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 hover:text-indigo-300 rounded-lg transition-all duration-300 hover:brightness-110 border border-indigo-500/20 hover:border-indigo-500/40"
                                                                title={member.social?.discord ? "Discord" : "Visit HentaiTerra"}
                                                            >
                                                                <FaDiscord className="w-3 h-3" />
                                                            </a>

                                                            {/* Twitter Link */}
                                                            <a
                                                                href={member.social?.twitter ?
                                                                    (member.social.twitter.startsWith('http') ? member.social.twitter : `https://twitter.com/${member.social.twitter}`) :
                                                                    "https://HentaiTerra.ro"
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-300 hover:brightness-110 border border-blue-500/20 hover:border-blue-500/40"
                                                                title={member.social?.twitter ? "Twitter" : "Visit HentaiTerra Site"}
                                                            >
                                                                <FaTwitter className="w-3 h-3" />
                                                            </a>

                                                            {/* Instagram Link */}
                                                            <a
                                                                href={member.social?.instagram ?
                                                                    (member.social.instagram.startsWith('http') ? member.social.instagram : `https://instagram.com/${member.social.instagram}`) :
                                                                    "https://HentaiTerra.ro"
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 hover:text-pink-300 rounded-lg transition-all duration-300 hover:brightness-110 border border-pink-500/20 hover:border-pink-500/40"
                                                                title={member.social?.instagram ? "Instagram" : "Visit HentaiTerra"}
                                                            >
                                                                <FaInstagram className="w-3 h-3" />
                                                            </a>

                                                            {/* YouTube Link */}
                                                            <a
                                                                href={member.social?.youtube ?
                                                                    (member.social.youtube.startsWith('http') ? member.social.youtube : `https://youtube.com/${member.social.youtube}`) :
                                                                    "https://HentaiTerra.ro"
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-lg transition-all duration-300 hover:brightness-110 border border-red-500/20 hover:border-red-500/40"
                                                                title={member.social?.youtube ? "YouTube" : "Visit HentaiTerra"}
                                                            >
                                                                <FaYoutube className="w-3 h-3" />
                                                            </a>

                                                            {/* Twitch Link */}
                                                            <a
                                                                href={member.social?.twitch ?
                                                                    (member.social.twitch.startsWith('http') ? member.social.twitch : `https://twitch.tv/${member.social.twitch}`) :
                                                                    "https://HentaiTerra.ro"
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 hover:text-purple-300 rounded-lg transition-all duration-300 hover:brightness-110 border border-purple-500/20 hover:border-purple-500/40"
                                                                title={member.social?.twitch ? "Twitch" : "Visit HentaiTerra"}
                                                            >
                                                                <FaTwitch className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {staffMembers.length === 0 && (
                            <div className="text-center py-20">
                                <div className="max-w-md mx-auto">
                                    <div className="w-24 h-24 mx-auto mb-6 bg-white/5 rounded-full flex items-center justify-center">
                                        <FaUsers className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Nu există membri în echipă</h3>
                                    <p className="text-gray-400">Echipa noastră se pregătește să crească. Revino curând!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
