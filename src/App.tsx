import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import HomePage from "./pages/HomePage";
import { articleCache } from "./lib/cacheStore";

// Code-split secondary pages for optimal bundle sizes and fast initial loads
const LegalPage = lazy(() => import("./pages/LegalPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));
const DistrictPage = lazy(() => import("./pages/DistrictPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Ultra-fast slim top loader bar for instant perceived performance
function PageFallback() {
  return (
    <div className="min-h-screen bg-brand-gray/30 flex flex-col">
      <div className="w-full h-1 bg-red-100 overflow-hidden sticky top-0 z-50">
        <div className="h-full bg-brand-red animate-pulse w-2/3 transition-all duration-300" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6 flex-1">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Automatically scroll to top & track pageviews on route change in SPA
function RouteChangeHandler() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("config", "G-0YZ3Q025WF", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  // Warm up other page route bundles after initial mount during idle browser time
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        articleCache.preloadRoute('article');
        articleCache.preloadRoute('district');
        articleCache.preloadRoute('archive');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <RouteChangeHandler />
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Core News Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/category/:category" element={<ArchivePage />} />
            <Route path="/district/:slug" element={<DistrictPage />} />
            <Route path="/location/district/:name" element={<DistrictPage />} />
            <Route path="/location/:type/:name" element={<ArchivePage />} />
            <Route path="/tag/:tag" element={<ArchivePage />} />
            <Route path="/author/:authorId" element={<ArchivePage />} />
            <Route path="/search" element={<ArchivePage />} />

            {/* Admin & Desk */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Official Contact Page */}
            <Route path="/contact" element={<ContactPage />} />

            {/* Required Legal & Trust Pages */}
            <Route path="/about" element={<LegalPage pageKey="about" />} />
            <Route path="/privacy-policy" element={<LegalPage pageKey="privacy" />} />
            <Route path="/terms" element={<LegalPage pageKey="terms" />} />
            <Route path="/terms-and-conditions" element={<LegalPage pageKey="terms" />} />
            <Route path="/disclaimer" element={<LegalPage pageKey="disclaimer" />} />
            <Route path="/editorial-policy" element={<LegalPage pageKey="editorial" />} />
            <Route path="/correction-policy" element={<LegalPage pageKey="correction" />} />
            <Route path="/cookie-policy" element={<LegalPage pageKey="cookie" />} />
            <Route path="/fact-checking" element={<LegalPage pageKey="factchecking" />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
