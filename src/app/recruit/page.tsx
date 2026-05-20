"use client"

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { logToDiscordWebhook } from '@/lib/discord-webhook';

const RecruitPage = () => {
    const { user, isSignedIn } = useUser();
    const [formData, setFormData] = useState({
        name: '',
        discordTag: '',
        applicationRoles: [] as string[],
        currentExperience: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showRedirectPopup, setShowRedirectPopup] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRoleToggle = (role: string) => {
        setFormData(prevState => ({
            ...prevState,
            applicationRoles: prevState.applicationRoles.includes(role)
                ? prevState.applicationRoles.filter(r => r !== role)
                : [...prevState.applicationRoles, role]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.applicationRoles.length === 0) {
            alert('Te rugăm să selectezi cel puțin un rol');
            return;
        }
        setIsSubmitting(true);
        try {
            // Prepare user data from Clerk if user is signed in
            let userInfo = '';
            if (isSignedIn && user) {
                userInfo = `\nUser Info (Clerk):\nEmail: ${user.primaryEmailAddress?.emailAddress || 'Not available'}\nUsername: ${user.username || 'Not available'}\nClerk ID: ${user.id}\n`;
                // Add site name to user info
                userInfo += `\nSite Name: ${process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra'}`;

                // Add social accounts if available
                if (user.externalAccounts && user.externalAccounts.length > 0) {
                    userInfo += '\nSocial Accounts:';
                    user.externalAccounts.forEach(account => {
                        userInfo += `\n- ${account.provider}: ${account.username || account.id}`;
                    });
                }
            }

            const response = await fetch('/api/recruit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: `@here Aplicație nouă primită:\nNume: ${formData.name}\nTag Discord: ${formData.discordTag}\nRoluri: ${formData.applicationRoles.join(', ')}\nExperiență: ${formData.currentExperience}${userInfo}`
                })
            });
            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    name: '',
                    discordTag: '',
                    applicationRoles: [],
                    currentExperience: ''
                });

                // Show popup and set timeout for redirect
                setShowRedirectPopup(true);
                setTimeout(() => {
                    window.location.href = 'https://discord.gg/SwvnaKc49N';
                }, 3000); // Redirect after 3 seconds
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            await logToDiscordWebhook(`Error submitting application: ${error}`);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
            if (submitStatus !== 'success') {
                setTimeout(() => setSubmitStatus('idle'), 3000);
            }
        }
    };

    const hentaiRoles = [
        "Traducător Hentai",
        "Encoder Hentai",
        "Verificator Hentai"
    ];


    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="container mx-auto px-4 py-12 min-h-screen"
            >
                <motion.h1
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-white via-gray-200 to-neutral-400 bg-clip-text text-transparent"
                >
                    Devino Parte din Aventura {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}! 🌟
                </motion.h1>

                <div className="flex flex-col md:flex-row gap-8 justify-center">
                    <motion.form
                        onSubmit={handleSubmit}
                        className="w-full md:w-1/2 max-w-lg bg-neutral-900/50 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-purple-500/20"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2" htmlFor="name">Numele Tău</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700 focus:border-purple-500 focus:outline-none transition-colors"
                                required
                                placeholder="Cum te numești?"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2" htmlFor="discordTag">Tag Discord</label>
                            <input
                                type="text"
                                id="discordTag"
                                name="discordTag"
                                value={formData.discordTag}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700 focus:border-purple-500 focus:outline-none transition-colors"
                                required
                                placeholder="ex: username#1234"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-300 mb-2">Pentru ce roluri aplici?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="text-center font-bold text-purple-400 mb-2">Hentai</div>
                                    {hentaiRoles.map((role) => (
                                        <div
                                            key={role}
                                            onClick={() => handleRoleToggle(role)}
                                            className={`p-2 rounded cursor-pointer border transition-colors ${formData.applicationRoles.includes(role)
                                                    ? 'bg-purple-600 border-purple-400'
                                                    : 'bg-neutral-800 border-neutral-700 hover:border-purple-500'
                                                }`}
                                        >
                                            {role}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                </div>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-300 mb-2" htmlFor="currentExperience">Experiența Ta</label>
                            <textarea
                                id="currentExperience"
                                name="currentExperience"
                                value={formData.currentExperience}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700 focus:border-purple-500 focus:outline-none transition-colors"
                                rows={4}
                                required
                                placeholder="Spune-ne despre experiența ta și de ce vrei să te alături echipei noastre..."
                            />
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-2 rounded transition-all duration-300 flex items-center justify-center
                                ${isSubmitting ? 'bg-purple-700 cursor-wait' : 'bg-purple-600 hover:bg-purple-700'}
                                ${submitStatus === 'success' ? 'bg-green-600' : ''}
                                ${submitStatus === 'error' ? 'bg-red-600' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Se trimite...' :
                                submitStatus === 'success' ? '✓ Trimis cu succes!' :
                                    submitStatus === 'error' ? '× Eroare la trimitere' : 'Trimite Aplicația'}
                        </button>
                    </motion.form>

                    <motion.div
                        className="w-full md:w-1/2 max-w-lg text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="space-y-4 bg-neutral-900/30 p-6 rounded-lg">
                            <div className="role-card p-4 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-colors">
                                <h3 className="font-bold text-purple-400 mb-2">Traducător Hentai</h3>
                                <p>Responsabil pentru traducerea hentai-urilor din engleză în română, asigurând acuratețea și fluența traducerii.</p>
                            </div>
                            <div className="role-card p-4 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-colors">
                                <h3 className="font-bold text-purple-400 mb-2">Verificator Hentai</h3>
                                <p>Verifică acuratețea și calitatea traducerilor, asigurând coerența și corectitudinea gramaticală.</p>
                            </div>
                            <div className="role-card p-4 border border-purple-500/20 rounded-lg hover:border-purple-500/40 transition-colors">
                                <h3 className="font-bold text-purple-400 mb-2">Encoder Hentai</h3>
                                <p>Se ocupă cu procesarea tehnică, incluzând subtitrările și încărcarea episoadelor pe platformă.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Redirect Popup */}
            {showRedirectPopup && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-neutral-900 border border-purple-500 p-8 rounded-lg max-w-md text-center"
                    >
                        <h2 className="text-2xl font-bold text-purple-400 mb-4">Aplicație Trimisă cu Succes! 🎉</h2>
                        <p className="text-white mb-6">Mulțumim pentru aplicație! Te vom redirecționa către serverul nostru Discord în câteva secunde...</p>
                        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-purple-500"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3 }}
                            />
                        </div>
                        <button
                            onClick={() => window.location.href = 'https://discord.gg/SwvnaKc49N'}
                            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded transition-colors"
                        >
                            Accesează Discord Acum
                        </button>
                    </motion.div>
                </div>
            )}
        </>
    );
};

export default RecruitPage;
