import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./lib/AuthContext";
import HomePage from "./pages/HomePage";
import LegalPage from "./pages/LegalPage";
import ContactPage from "./pages/ContactPage";
import AdminPage from "./pages/AdminPage";
import ArticlePage from "./pages/ArticlePage";
import ArchivePage from "./pages/ArchivePage";
import DistrictPage from "./pages/DistrictPage";
import NotFoundPage from "./pages/NotFoundPage";
import JobsPortalPage from "./pages/JobsPortalPage";

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
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <GoogleAnalyticsTracker />
          <Routes>
            {/* Core News Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/category/:category" element={<ArchivePage />} />
            <Route path="/district/:slug" element={<DistrictPage />} />
            <Route path="/location/district/:name" element={<DistrictPage />} />
            <Route path="/location/:type/:name" element={<ArchivePage />} />
            <Route path="/tag/:tag" element={<ArchivePage />} />
            <Route path="/author/:authorId" element={<ArchivePage />} />
            <Route path="/search" element={<ArchivePage />} />

            {/* Dedicated Maharashtra Students & Jobs Portal */}
            <Route path="/jobs" element={<JobsPortalPage />} />
            <Route path="/students-jobs" element={<JobsPortalPage />} />
            <Route path="/careers" element={<JobsPortalPage />} />
            
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
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  );
}
