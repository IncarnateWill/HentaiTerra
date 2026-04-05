'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

export default function ContentWarning() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  useEffect(() => {
    // Check if user has already accepted the warning
    const accepted = localStorage.getItem('hentaiterra-age-verified');
    if (!accepted) {
      setIsVisible(true);
    } else {
      setHasAccepted(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('hentaiterra-age-verified', 'true');
    setHasAccepted(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    // Redirect to a safe site or show alternative message
    window.location.href = 'https://www.google.com';
  };

  if (!isVisible || hasAccepted) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-red-500 rounded-lg max-w-md w-full p-6 text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="w-16 h-16 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          ⚠️ AVERTISMENT HENTAI 18+
        </h2>
        
        <div className="text-gray-300 mb-6 space-y-3">
          <p className="font-semibold text-red-400">
            HentaiTerra conține conținut hentai explicit pentru adulți (18+)
          </p>
          
          <p>
            Prin continuarea navigării pe HentaiTerra, confirmați că:
          </p>
          
          <ul className="text-left space-y-2 text-sm">
            <li>• Aveți cel puțin 18 ani</li>
            <li>• Înțelegeți că acest site conține material hentai pentru adulți</li>
            <li>• Accesați acest conținut în mod voluntar</li>
            <li>• Nu vă simțiți ofensat de conținutul explicit</li>
          </ul>
          
          <p className="text-xs text-gray-400 mt-4">
            Dacă nu aveți 18 ani sau nu doriți să vizualizați acest tip de conținut, 
            vă rugăm să părăsiți site-ul acum.
          </p>
        </div>
        
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDecline}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Nu am 18 ani / Ieșire
          </button>
          
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Am peste 18 ani / Intru
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4">
          Prin apăsarea butonului &quot;Am peste 18 ani&quot;, confirmați că respectați 
          toate condițiile de mai sus.
        </p>
      </div>
    </div>
  );
}
