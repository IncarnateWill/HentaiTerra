"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HiHome, HiArrowLeft } from "react-icons/hi";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MovedPermanently() {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push('/home');
    }, 5000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#13111C] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <div className="mb-8 relative w-48 h-48 mx-auto">
          <Image
            src={imageError ? "https://media.tenor.com/xdxr6fMQMNsAAAAj/blush-anime.gif" : "https://media.tenor.com/xdxr6fMQMNsAAAAj/blush-anime.gif"}
            alt="401 Moved Permanently"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 192px"
            onError={(e) => {
              e.preventDefault();
              setImageError(true);
              e.currentTarget.src = "https://media.tenor.com/xdxr6fMQMNsAAAAj/blush-anime.gif";
            }}
          />
        </div>

        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          401 - Mutat Permanent
        </h1>
        
        <p className="text-gray-300 mb-8">
          Această pagină a fost mutată permanent la o nouă locație. Vei fi redirecționat către homepage locație în 5 secunde.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/home"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <HiHome className="w-5 h-5" />
            <span>Înapoi acasă</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Înapoi</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}