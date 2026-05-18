import type { Viewport } from "next";
import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/navbar/navbar";
import Footer from "@/components/layout/footer/footer";
import { ClerkProvider } from "@clerk/nextjs";
import ContentWarning from "@/components/shared/content-warning";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: false,
  variable: '--font-poppins'
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0f",
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

const primaryColor = '#8b5cf6';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      appearance={{
        layout: {
          shimmer: true,
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
        },
        variables: {
          colorPrimary: primaryColor,
        },
      }}
    >
      <html lang="ro" className="dark scroll-smooth" suppressHydrationWarning>
        <head>
          <meta name="theme-color" content="#0a0b0f" />
          <meta name="google-site-verification" content="SlA2WA7gXTHCy-lQ23feK7yA4HFnek-7NV4RBz1q7Yk" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          <link rel="preload" href="/homebanner.webp" as="image" type="image/webp" fetchPriority="high" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://i.imgur.com" />
          <link rel="dns-prefetch" href="https://imgur.com" />
          <link rel="dns-prefetch" href="https://www.chatbro.com" />
          <link rel="preconnect" href="https://www.chatbro.com" />
          <meta name="format-detection" content="telephone=no" />

          {/* Service Worker */}
          <script dangerouslySetInnerHTML={{ __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function(e) { console.log('SW failed:', e); });
              });
            }
          ` }} />

          {/* Chatbro — deferred */}
          <script dangerouslySetInnerHTML={{ __html: `
            function initChatbro() {
              function ChatbroLoader(chats,async){
                async=!1!==async;
                var params={embedChatsParameters:chats instanceof Array?chats:[chats],lang:navigator.language||navigator.userLanguage,needLoadCode:'undefined'==typeof Chatbro,embedParamsVersion:localStorage.embedParamsVersion,chatbroScriptVersion:localStorage.chatbroScriptVersion},
                xhr=new XMLHttpRequest;
                xhr.withCredentials=!0,xhr.onload=function(){eval(xhr.responseText)},xhr.onerror=function(){console.error('Chatbro loading error')},
                xhr.open('GET','https://www.chatbro.com/embed.js?'+btoa(unescape(encodeURIComponent(JSON.stringify(params)))),async),xhr.send()
              }
              ChatbroLoader({encodedChatId: '4915d'});
            }
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', function() { setTimeout(initChatbro, 2000); });
            } else { setTimeout(initChatbro, 2000); }
          ` }} />
        </head>
        <body className={`${poppins.className} antialiased min-h-screen bg-[#0a0b0f] text-gray-100 flex flex-col`}>
          <ContentWarning />
          <Navbar />
          <main className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 flex-grow mt-[52px] lg:mt-[60px] pb-24 lg:pb-8">
            {children}
          </main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
