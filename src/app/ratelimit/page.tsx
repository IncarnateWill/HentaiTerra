import React from 'react';
import Link from 'next/link';
import { HiExclamationCircle } from 'react-icons/hi';

export default function RateLimitPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <HiExclamationCircle className="text-purple-500 w-16 h-16 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Too Many Requests</h1>
      <p className="text-lg text-gray-400 mb-6">You have sent too many requests in a short period.<br />Please wait a moment and try again.</p>
      <Link href="/home" className="px-6 py-2 rounded-full bg-purple-600 text-white font-semibold hover:bg-purple-700 transition">Go Home</Link>
    </div>
  );
} 