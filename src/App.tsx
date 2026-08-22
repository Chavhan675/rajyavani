import React, { useEffect, Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { Loader2 } from "lucide-react";
import HomePage from "./pages/HomePage";

// Code-split secondary pages for optimal Lighthouse performance and smaller bundles
const LegalPage = lazy(() => import("./pages/LegalPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const ArticlePage = lazy(() => import("./pages/ArticlePage"));
const ArchivePage = lazy(() => import("./pages/ArchivePage"));
const DistrictPage = lazy(() => import("./pages/DistrictPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

// Page Loading fallback
function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
    </div>
  );
}

// Component to track pageviews on route change in SPA
function GoogleAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("config", "G-0YZ3Q025WF", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <GoogleAnalyticsTracker />
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
