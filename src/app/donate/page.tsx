"use client"

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function DonatePage() {
  const [showThankYou, setShowThankYou] = useState(false);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className="container mx-auto px-4 py-12 min-h-screen"
      >
        <motion.h1 
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-bold mb-8 text-center bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent"
        >
          Susține Aventura HentaiTerra! 🌟
        </motion.h1>

        <div className="flex flex-col md:flex-row gap-8 justify-center">
          <motion.div 
            className="w-full md:w-1/2 max-w-lg"
            {...fadeInUp}
          >
            <div className="bg-neutral-900/70 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-purple-500/30 hover:border-purple-500/50 transition-all">
              <h2 className="text-3xl font-semibold mb-6 text-purple-300">De Ce Să Donezi?</h2>
              <div className="space-y-4 text-gray-200">
                <p className="text-lg"> {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')} este un proiect născut din pasiunea pentru hentai, dedicat comunității din România.</p>
                <p className="text-lg font-medium text-purple-200">Donațiile tale ne ajută să:</p>
                <ul className="list-none pl-5 space-y-3">
                  {[
                    "🖥️ Menținem serverele și infrastructura site-ului",
                    "📝 Îmbunătățim calitatea traducerilor și a conținutului",
                    "⚡ Dezvoltăm noi funcționalități pentru platformă",
                    "🎬 Aducem mai mult conținut hentai pe platformă",
                    "🎉 Organizăm evenimente pentru comunitate"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2 text-gray-300"
                    >
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <p className="pt-4 text-lg font-medium text-purple-200">Fiecare contribuție contează pentru viitorul {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}!</p>
              </div>

              <motion.div 
                className="mt-8"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-2xl font-semibold mb-4 text-purple-300">Beneficiile Donatorilor</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-neutral-800/70 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all">
                    <span className="font-bold text-white text-lg">⭐ Rol Special</span>
                    <p className="text-gray-300">Rol exclusiv pe serverul nostru de Discord</p>
                  </div>
                  <div className="bg-neutral-800/70 p-4 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition-all">
                    <span className="font-bold text-white text-lg">🎭 Badge Special</span>
                    <p className="text-gray-300">Badge distinctiv pe profilul tău {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="w-full md:w-1/2 max-w-lg"
            {...fadeInUp}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-neutral-900/70 backdrop-blur-lg rounded-xl p-8 shadow-xl border border-purple-500/30 hover:border-purple-500/50 transition-all h-full flex flex-col">
              <h2 className="text-3xl font-semibold mb-6 text-purple-300 text-center">Donează Acum</h2>
              
              <div className="flex-grow flex flex-col items-center justify-center space-y-8">
                <div className="relative w-full max-w-xs">
                  <Image 
                    src={`https://i.imgur.com/BhTbL9B.png`} 
                    alt={`${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')} Donation`} 
                    width={300} 
                    height={200}
                    className="mx-auto opacity-90 hover:opacity-100 transition-opacity"
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                
                <div className="w-full max-w-xs">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 p-1 rounded-lg shadow-lg hover:shadow-purple-500/30"
                  >
                    <a 
                      href="https://www.paypal.com/donate/?hosted_button_id=7W9NK8S9SG62W" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 transition-all p-4 rounded-md"
                      onClick={() => setShowThankYou(true)}
                    >
                      <span className="text-white font-semibold text-lg">Donează prin PayPal</span>
                    </a>
                  </motion.div>
                </div>
                
                <div className="text-center text-gray-300 text-sm">
                  <p>Donațiile sunt procesate securizat prin PayPal</p>
                  <p className="mt-2">Nu este necesar să ai cont PayPal pentru a dona</p>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-neutral-700">
                <h3 className="text-xl font-semibold mb-4 text-purple-300 text-center">Alte Modalități de a Ajuta</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link 
                    href="/recruit" 
                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    Alătură-te Echipei
                  </Link>
                  <Link 
                    href="https://discord.gg/SwvnaKc49N" 
                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-purple-500/10"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Intră pe Discord
                  </Link>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')} - Platforma Hentai din România`,
                          text: `Descoperă ${(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}, cea mai bună platformă de hentai din România!`,
                          url: window.location.origin,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.origin);
                        alert('Link copiat în clipboard!');
                      }
                    }}
                    className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm transition-all hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    Distribuie Site-ul
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-semibold mb-6 bg-gradient-to-r from-purple-300 via-pink-200 to-purple-300 bg-clip-text text-transparent">
            Mulțumim Donatorilor Noștri
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Suntem profund recunoscători tuturor celor care au contribuit la dezvoltarea {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}. 
            Fiecare donație ne ajută să continuăm să oferim conținut de calitate și să îmbunătățim experiența utilizatorilor.
          </p>
        </motion.div>

        <AnimatePresence>
          {showThankYou && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setShowThankYou(false)}
            >
              <div className="bg-neutral-900 p-8 rounded-xl border border-purple-500/30 max-w-md text-center">
                <h3 className="text-2xl font-bold text-purple-300 mb-4">Mulțumim pentru Suport! 💜</h3>
                <p className={`text-gray-300`}>Contribuția ta face diferența pentru comunitatea {(process.env.NEXT_PUBLIC_SITE_NAME || 'HentaiTerra')}.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
  );
}
