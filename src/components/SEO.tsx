import React, { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: 'website' | 'article';
  image?: string;
  noindex?: boolean;
  authorName?: string;
  datePublished?: string;
  dateModified?: string;
  category?: string;
}

export default function SEO({ 
  title, 
  description = "राज्यवाणी (Rajyavani): महाराष्ट्रातील सर्व ३६ जिल्हे, शहरे आणि ग्रामीण भागातील ताज्या, अचूक व विश्वासार्ह घडामोडींचे डिजिटल वृत्तपत्र.", 
  canonical, 
  type = 'website', 
  image, 
  noindex,
  authorName = "राज्यवाणी संपादकीय मंडळ",
  datePublished,
  dateModified,
  category = "महाराष्ट्र"
}: SEOProps) {
  const siteBrand = "राज्यवाणी (Rajyavani)";
  const fullTitle = title && title.trim() 
    ? (title.includes('राज्यवाणी') || title.includes('Rajyavani') ? title.trim() : `${title.trim()} | ${siteBrand}`)
    : "राज्यवाणी (Rajyavani) - महाराष्ट्राचे विश्वसनीय डिजिटल वृत्तपत्र";
    
  const defaultImage = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
  const canonicalUrl = canonical || "https://rajyavani.vercel.app/";

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = fullTitle;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', description);
      }
      
      // Update canonical link
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', canonicalUrl);
      }
    }
  }, [fullTitle, description, canonicalUrl]);

  // Schema.org structured data
  const jsonLd = type === 'article' ? {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "headline": title || fullTitle,
    "description": description,
    "image": [image || defaultImage],
    "datePublished": datePublished || new Date().toISOString(),
    "dateModified": dateModified || datePublished || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": "https://rajyavani.vercel.app/about"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": siteBrand,
      "url": "https://rajyavani.vercel.app/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://rajyavani.vercel.app/logo.png"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8459675917",
        "contactType": "editorial",
        "email": "chavhanakash675@gmail.com"
      }
    },
    "articleSection": category,
    "inLanguage": "mr"
  } : {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": siteBrand,
    "url": "https://rajyavani.vercel.app/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://rajyavani.vercel.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "NewsMediaOrganization",
      "name": siteBrand,
      "url": "https://rajyavani.vercel.app/",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8459675917",
        "contactType": "editorial",
        "email": "chavhanakash675@gmail.com"
      }
    }
  };
  
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:site_name" content={siteBrand} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />
      {canonical && <meta property="og:url" content={canonical} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      {/* Structured Data JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
