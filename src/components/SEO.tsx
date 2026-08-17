import React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: 'website' | 'article';
  image?: string;
  noindex?: boolean;
}

export default function SEO({ title, description, canonical, type = 'website', image, noindex }: SEOProps) {
  const siteName = "Rajyavani - Maharashtra's No.1 Digital News Platform";
  const defaultImage = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  
  return (
    <HelmetProvider>
      <Helmet>
        <html lang="mr" />
        <title>{title} | {siteName}</title>
        <meta name="description" content={description} />
        {canonical && <link rel="canonical" href={canonical} />}
        {noindex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Open Graph */}
        <meta property="og:site_name" content={siteName} />
        <meta property="og:type" content={type} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image || defaultImage} />
        {canonical && <meta property="og:url" content={canonical} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image || defaultImage} />
        
        {/* Structured Data JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": type === 'article' ? "NewsArticle" : "WebSite",
            "name": siteName,
            "headline": title,
            "description": description,
            "image": [image || defaultImage],
            "url": canonical || "https://rajyavani.com/",
            "publisher": {
              "@type": "Organization",
              "name": siteName,
              "logo": {
                "@type": "ImageObject",
                "url": "https://rajyavani.com/logo.png"
              }
            }
          })}
        </script>
      </Helmet>
    </HelmetProvider>
  );
}
