import Link from "next/link";
import { FaLock } from "react-icons/fa";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forbidden - 403 Access Denied',
  robots: {
    index: false,
    follow: false
  }
};

export default function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-950 p-10 rounded-2xl shadow-2xl text-center text-white border border-red-500/40 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border-4 border-red-500/30 shadow-lg">
            <FaLock className="text-red-400 text-4xl" />
          </span>
        </div>
        <h2 className="text-3xl font-extrabold mb-2 tracking-tight text-red-300 drop-shadow">403 Forbidden</h2>
        <p className="mb-4 text-lg text-neutral-300">
          Sorry, you do not have permission to access this page or the resource you requested.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block px-6 py-2 rounded-lg bg-purple-700/80 hover:bg-purple-600 text-white font-semibold shadow transition-all duration-150"
        >
          ⬅ Go to Home
        </Link>
        <div className="mt-6 text-xs text-neutral-500">
          If you believe this is a mistake, please contact an administrator or support team.
        </div>
      </div>
    </div>
  );
}