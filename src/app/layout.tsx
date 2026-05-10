import type { Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "@/styles/globals.css";
import Navbar from "@/components/layout/navbar/navbar";
import Footer from "@/components/layout/footer/footer";
import { ClerkProvider } from "@clerk/nextjs";
import ContentWarning from "@/components/shared/content-warning";

// Font Optimization - Enhanced for performance
const inter = Inter({ 
  subsets: ["latin"], 
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: false, // Reduce layout shift
  variable: '--font-inter'
});

const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: false, // Reduce layout shift
  variable: '--font-poppins'
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1625",
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

// Theme configuration
const themeConfig = {
  colors: {
    primary: {
      light: '#6d28d9',
      dark: '#5b21b6',
      hover: '#7c3aed'
    },
    background: {
      main: '#13111C',
      card: 'rgba(255, 255, 255, 0.02)',
      hover: 'rgba(255, 255, 255, 0.05)'
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      muted: 'rgba(255, 255, 255, 0.5)'
    },
    border: {
      light: 'rgba(255, 255, 255, 0.1)',
      dark: 'rgba(255, 255, 255, 0.05)'
    },
    status: {
      watching: {
        color: '#34d399',
        bg: 'rgba(52, 211, 153, 0.1)'
      },
      'plan-to-watch': {
        color: '#60a5fa',
        bg: 'rgba(96, 165, 250, 0.1)'
      },
      'on-hold': {
        color: '#fbbf24',
        bg: 'rgba(251, 191, 36, 0.1)'
      },
      completed: {
        color: '#a78bfa',
        bg: 'rgba(167, 139, 250, 0.1)'
      },
      dropped: {
        color: '#f87171',
        bg: 'rgba(248, 113, 113, 0.1)'
      }
    }
  },
  gradients: {
    primary: 'from-indigo-600 to-purple-600',
    hover: 'from-indigo-700 to-purple-700',
    background: 'from-gray-900 via-gray-800 to-black'
  },
  shadows: {
    primary: 'shadow-lg hover:shadow-indigo-500/25',
    card: 'shadow-xl'
  }
};

// Configure image optimization
export const images = {
  domains: ['i.imgur.com', 'images2.alphacoders.com', 'media.tenor.com'],
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60,
  dangerouslyAllowSVG: true,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!} appearance={{
      layout: {
        shimmer: true,
        socialButtonsPlacement: "bottom",
        socialButtonsVariant: "iconButton",
      },
      variables: {
        colorPrimary: themeConfig.colors.primary.light,
      },
    }}>
      <html lang="ro" className="dark scroll-smooth" data-scroll-behavior="smooth" suppressHydrationWarning>
        <head>
          
          {/* Meta */}
          <meta name="theme-color" content="#1a1625" />
          <meta name="google-site-verification" content="SlA2WA7gXTHCy-lQ23feK7yA4HFnek-7NV4RBz1q7Yk" />
          <link rel="manifest" href="/site.webmanifest" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          
          {/* Preload critical CSS */}
          {/* Removed incorrect preload tag for CSS; Next.js handles CSS imports automatically */}
          
          {/* Preload LCP image */}
          <link rel="preload" href="/homebanner.webp" as="image" type="image/webp" fetchPriority="high" />
          
          {/* DNS prefetch for external domains */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* Preload critical fonts */}

          
          {/* DNS prefetch for image domains */}
          <link rel="dns-prefetch" href="https://i.imgur.com" />
          <link rel="dns-prefetch" href="https://imgur.com" />
          
          {/* Resource hints for Chatbro - improved performance */}
          <link rel="dns-prefetch" href="https://www.chatbro.com" />
          <link rel="preconnect" href="https://www.chatbro.com" />
          
          {/* Resource hints for better performance */}
          <meta name="format-detection" content="telephone=no" />
          
          {/* Service Worker Registration */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('SW registered: ', registration);
                      })
                      .catch(function(registrationError) {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
          
          {/* Optimized Chatbro Widget - Deferred Loading */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                /* Optimized Chatbro Widget - Non-blocking Load */
                function initChatbro() {
                  function ChatbroLoader(chats,async){
                      async=!1!==async;
                      var params={
                          embedChatsParameters:chats instanceof Array?chats:[chats],
                          lang:navigator.language||navigator.userLanguage,
                          needLoadCode:'undefined'==typeof Chatbro,
                          embedParamsVersion:localStorage.embedParamsVersion,
                          chatbroScriptVersion:localStorage.chatbroScriptVersion
                      },
                      xhr=new XMLHttpRequest;
                      xhr.withCredentials=!0,
                      xhr.onload=function(){eval(xhr.responseText)},
                      xhr.onerror=function(){console.error('Chatbro loading error')},
                      xhr.open('GET','https://www.chatbro.com/embed.js?'+btoa(unescape(encodeURIComponent(JSON.stringify(params)))),async),
                      xhr.send()
                  }
                  ChatbroLoader({encodedChatId: '4915d'});
                }
                
                // Defer Chatbro loading until after critical content
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', function() {
                    setTimeout(initChatbro, 100);
                  });
                } else {
                  setTimeout(initChatbro, 100);
                }
              `,
            }}
          />

        </head>
        <body className={`${poppins.className} antialiased min-h-screen bg-[#13111C] text-gray-100 transition-colors duration-300 flex flex-col`}> 
            <ContentWarning />
            <Navbar />
            <main className="container mx-auto px-4 py-6 max-w-8xl flex-grow lg:mt-[88px] transition-[margin] duration-300 ease-out">
              {children}
            </main>
            <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
