import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import { getLeaderboardData } from '@/actions/leaderboard.actions';
import { HiStar, HiRectangleStack, HiFilm } from 'react-icons/hi2';
import { FaCrown, FaMedal } from 'react-icons/fa';

export const metadata: Metadata = {
    title: `Clasament | ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}`,
    description: `Descoperă clasamentul utilizatorilor cu cele mai multe puncte, cartonașe și episoade vizionate pe ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}.`,
};

export const revalidate = 300; // Cache for 5 minutes

export default async function LeaderboardPage() {
    const data = await getLeaderboardData();

    if ('error' in data) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center text-semantic-error">
                    <p className="text-xl font-bold">Eroare la încărcarea clasamentului</p>
                    <p className="text-sm mt-2 opacity-80">{data.error}</p>
                </div>
            </div>
        );
    }

    const { points, cards, episodes } = data as {
        points: any[];
        cards: any[];
        episodes: any[];
    };

    const getRankIcon = (index: number) => {
        if (index === 0) return <FaCrown className="w-6 h-6 text-yellow-400 drop-shadow-md" />;
        if (index === 1) return <FaMedal className="w-6 h-6 text-gray-300 drop-shadow-md" />;
        if (index === 2) return <FaMedal className="w-6 h-6 text-amber-600 drop-shadow-md" />;
        return <span className="font-bold text-gray-500 text-lg">#{index + 1}</span>;
    };

    const getItemStyles = (index: number) => {
        const base = "flex items-center gap-4 p-3.5 rounded-2xl border";
        if (index === 0) return `${base} bg-dark-400/30 border-yellow-500/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]`;
        if (index === 1) return `${base} bg-dark-400/30 border-gray-400/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`;
        if (index === 2) return `${base} bg-dark-400/30 border-amber-700/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]`;

        return `${base}  border-white/5`;
    };

    return (
        <main className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20  pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Clasamentul Comunității
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Cei mai activi și dedicați membri ai comunității {process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                    {/* Top by Points */}
                    <div className="bg-dark-300/40 backdrop-blur-md rounded-3xl p-6 border border-amber-500/20 shadow-[0_8px_32px_rgba(245,158,11,0.05)]">
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center text-amber-400 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]">
                                <HiStar className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Top Puncte</h2>
                                <p className="text-sm text-gray-400">Cei mai bogați utilizatori</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {points.map((user, index) => (
                                <div key={user._id} className={getItemStyles(index)}>
                                    <div className="w-8 flex justify-center shrink-0">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-dark-100 shadow-sm">
                                        <Image
                                            src={user.imageUrl || '/default-avatar.png'}
                                            alt={user.username || 'User'}
                                            fill
                                            className="object-cover"
                                            sizes="44px"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-200 font-semibold truncate text-sm">{user.username || 'Anonim'}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="font-bold text-amber-400 text-lg leading-none">{user.points?.toLocaleString() || 0}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-amber-500/70 font-semibold block mt-0.5">pct</span>
                                    </div>
                                </div>
                            ))}
                            {points.length === 0 && <p className="text-center text-gray-500 py-4 font-medium">Nu există date</p>}
                        </div>
                    </div>

                    {/* Top by Cards */}
                    <div className="bg-dark-300/40 backdrop-blur-md rounded-3xl p-6 border border-primary-500/20 shadow-[0_8px_32px_rgba(139,92,246,0.05)]">
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400/20 to-primary-600/20 flex items-center justify-center text-primary-400 shadow-[inset_0_0_20px_rgba(139,92,246,0.2)]">
                                <HiRectangleStack className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Top Colecționari</h2>
                                <p className="text-sm text-gray-400">Cele mai multe cartonașe</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {cards.map((item, index) => (
                                <div key={item.user?._id || index} className={getItemStyles(index)}>
                                    <div className="w-8 flex justify-center shrink-0">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-dark-100 shadow-sm">
                                        <Image
                                            src={item.user?.imageUrl || '/default-avatar.png'}
                                            alt={item.user?.username || 'User'}
                                            fill
                                            className="object-cover"
                                            sizes="44px"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-200 font-semibold truncate text-sm">{item.user?.username || 'Anonim'}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="font-bold text-primary-400 text-lg leading-none">{item.count?.toLocaleString() || 0}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-primary-500/70 font-semibold block mt-0.5">cărți</span>
                                    </div>
                                </div>
                            ))}
                            {cards.length === 0 && <p className="text-center text-gray-500 py-4 font-medium">Nu există date</p>}
                        </div>
                    </div>

                    {/* Top by Episodes */}
                    <div className="bg-dark-300/40 backdrop-blur-md rounded-3xl p-6 border border-pink-500/20 shadow-[0_8px_32px_rgba(236,72,153,0.05)]">
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400/20 to-pink-600/20 flex items-center justify-center text-pink-400 shadow-[inset_0_0_20px_rgba(236,72,153,0.2)]">
                                <HiFilm className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">Top Vizionări</h2>
                                <p className="text-sm text-gray-400">Cele mai multe episoade</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {episodes.map((item, index) => (
                                <div key={item.user?._id || index} className={getItemStyles(index)}>
                                    <div className="w-8 flex justify-center shrink-0">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-dark-100 shadow-sm">
                                        <Image
                                            src={item.user?.imageUrl || '/default-avatar.png'}
                                            alt={item.user?.username || 'User'}
                                            fill
                                            className="object-cover"
                                            sizes="44px"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-200 font-semibold truncate text-sm">{item.user?.username || 'Anonim'}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="font-bold text-pink-400 text-lg leading-none">{item.count?.toLocaleString() || 0}</span>
                                        <span className="text-[10px] uppercase tracking-wider text-pink-500/70 font-semibold block mt-0.5">episoade</span>
                                    </div>
                                </div>
                            ))}
                            {episodes.length === 0 && <p className="text-center text-gray-500 py-4 font-medium">Nu există date</p>}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
