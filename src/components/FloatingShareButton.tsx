import React, { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, Download, Image as ImageIcon, ExternalLink, X } from 'lucide-react';

interface FloatingShareButtonProps {
  title: string;
  url: string;
  summary?: string;
  imageUrl?: string;
  category?: string;
  authorName?: string;
  publishedDate?: string;
}

export const FloatingShareButton: React.FC<FloatingShareButtonProps> = ({
  title,
  url,
  summary = '',
  imageUrl,
  category = 'महाराष्ट्र',
  authorName = 'राज्यवाणी संपादकीय मंडळ',
  publishedDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [generatedCardUrl, setGeneratedCardUrl] = useState<string | null>(null);
  const [hasScrolled, setHasScrolled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Monitor scrolling to subtly adjust button or reveal helper pill (unblocked with requestAnimationFrame)
  useEffect(() => {
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(() => {
          setHasScrolled(window.scrollY > 200);
          rafId = null;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Format WhatsApp message with article title, summary teaser, clickable URL and branding
  const getWhatsAppMessage = () => {
    const cleanSummary = summary ? summary.trim().slice(0, 140) + (summary.length > 140 ? '...' : '') : '';
    return `📢 *${title}*\n\n${cleanSummary ? `${cleanSummary}\n\n` : ''}🔗 *सविस्तर बातमी वाचण्यासाठी खालील लिंकवर क्लिक करा:* 👇\n${url}\n\n📰 *राज्यवाणी (Rajyavani)* - महाराष्ट्राचे विश्वसनीय डिजिटल वृत्तपत्र`;
  };

  // Direct WhatsApp Deep Link
  const handleDirectWhatsAppShare = () => {
    const text = getWhatsAppMessage();
    const encodedText = encodeURIComponent(text);
    
    // WhatsApp Universal Deep Link (works on Mobile App and Web)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    
    // Try opening deep link
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Native Web Share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: summary ? `${summary.slice(0, 100)}...` : title,
          url: url,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleDirectWhatsAppShare();
        }
      }
    } else {
      handleDirectWhatsAppShare();
    }
  };

  // Copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Generate a high-resolution news graphic card on Canvas
  const generateNewsCard = async () => {
    setIsGeneratingCard(true);
    setCardModalOpen(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // 1200 x 675 (16:9 standard social share / WhatsApp card ratio)
      const width = 1200;
      const height = 675;
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Top Brand Bar (Royal Crimson with Gold Border)
      const grad = ctx.createLinearGradient(0, 0, width, 0);
      grad.addColorStop(0, '#991B1B');
      grad.addColorStop(0.3, '#DC2626');
      grad.addColorStop(0.7, '#EA580C');
      grad.addColorStop(1, '#D97706');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, 76);

      // Gold Accent Line
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(0, 72, width, 4);

      // Draw Logo Emblem Badge on Header
      ctx.fillStyle = '#7F1D1D';
      ctx.beginPath();
      ctx.arc(68, 38, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FDE68A';
      ctx.stroke();

      // Devanagari 'रा' inside Emblem
      ctx.fillStyle = '#FEF3C7';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('रा', 68, 45);
      ctx.textAlign = 'left';

      // Header Brand Text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText('राज्यवाणी', 105, 48);

      ctx.fillStyle = '#FEF3C7';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('DIGITAL NEWS NETWORK | महाराष्ट्राचा बुलंद आवाज', 255, 46);

      // Date / Category Badge in header
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(category.toUpperCase(), width - 40, 46);
      ctx.textAlign = 'left';

      // Left Column: Headline and Summary
      const contentX = 50;
      const contentWidth = 520;

      // Category Pill
      ctx.fillStyle = '#FFF1F2';
      ctx.fillRect(contentX, 105, 120, 32);
      ctx.strokeStyle = '#FECDD3';
      ctx.lineWidth = 1;
      ctx.strokeRect(contentX, 105, 120, 32);

      ctx.fillStyle = '#E63946';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(category, contentX + 15, 127);

      // Headline (Multi-line wrap)
      ctx.fillStyle = '#111827';
      ctx.font = 'bold 36px sans-serif';
      
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 4) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        let lineCount = 0;

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            lineCount++;
            if (lineCount >= maxLines) {
              ctx.fillText(line.trim() + '...', x, currentY);
              return currentY;
            }
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
        return currentY;
      };

      const headlineEndY = wrapText(title, contentX, 185, contentWidth, 46, 4);

      // Summary
      if (summary) {
        ctx.fillStyle = '#4B5563';
        ctx.font = '20px sans-serif';
        wrapText(summary, contentX, headlineEndY + 45, contentWidth, 30, 3);
      }

      // Bottom Call-To-Action Box
      const ctaY = height - 100;
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(contentX, ctaY, contentWidth, 65);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(contentX, ctaY, contentWidth, 65);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('🔗 सविस्तर बातमी वाचण्यासाठी भेट द्या:', contentX + 20, ctaY + 28);

      ctx.fillStyle = '#E63946';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(url.length > 50 ? url.slice(0, 48) + '...' : url, contentX + 20, ctaY + 52);

      // Right Column: Article Image
      const imgX = 610;
      const imgY = 105;
      const imgWidth = 540;
      const imgHeight = 460;

      // Draw placeholder frame first
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(imgX, imgY, imgWidth, imgHeight);

      // Load Image
      const img = new Image();
      img.crossOrigin = 'anonymous';

      const finalImgSrc = imageUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&q=80';
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            // Draw image with cover aspect ratio
            const imgAspect = img.width / img.height;
            const targetAspect = imgWidth / imgHeight;
            let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

            if (imgAspect > targetAspect) {
              sWidth = img.height * targetAspect;
              sx = (img.width - sWidth) / 2;
            } else {
              sHeight = img.width / targetAspect;
              sy = (img.height - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, imgX, imgY, imgWidth, imgHeight);

            // Beautiful Pill Watermark on image corner
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.beginPath();
            ctx.roundRect(imgX + imgWidth - 170, imgY + imgHeight - 44, 155, 34, 17);
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#F59E0B';
            ctx.stroke();

            // Small red circle with gold dot
            ctx.fillStyle = '#DC2626';
            ctx.beginPath();
            ctx.arc(imgX + imgWidth - 152, imgY + imgHeight - 27, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FEF3C7';
            ctx.beginPath();
            ctx.arc(imgX + imgWidth - 152, imgY + imgHeight - 27, 3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 13px sans-serif';
            ctx.fillText('राज्यवाणी', imgX + imgWidth - 138, imgY + imgHeight - 23);
            ctx.fillStyle = '#FBBF24';
            ctx.font = '9px sans-serif';
            ctx.fillText('• VERIFIED', imgX + imgWidth - 85, imgY + imgHeight - 23);
          } catch (e) {
            console.warn('Canvas draw image error', e);
          }
          resolve();
        };
        img.onerror = () => {
          // Draw fallback title card inside image area
          ctx.fillStyle = '#1E293B';
          ctx.fillRect(imgX, imgY, imgWidth, imgHeight);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('राज्यवाणी डिजिटल वृत्तपत्र', imgX + imgWidth / 2, imgY + imgHeight / 2);
          ctx.textAlign = 'left';
          resolve();
        };
        img.src = finalImgSrc;
      });

      // Bottom Footer Bar
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, height - 35, width, 35);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '14px sans-serif';
      ctx.fillText(`प्रसिद्धी: ${publishedDate || 'राज्यवाणी'} | सर्व हक्क सुरक्षित © Rajyavani`, 40, height - 12);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setGeneratedCardUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate card:', err);
    } finally {
      setIsGeneratingCard(false);
    }
  };

  // Download generated card
  const handleDownloadCard = () => {
    if (!generatedCardUrl) return;
    const a = document.createElement('a');
    a.href = generatedCardUrl;
    a.download = `rajyavani-news-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Share Card via Web Share API with File
  const handleShareCard = async () => {
    if (!generatedCardUrl) return;
    
    try {
      const blob = await (await fetch(generatedCardUrl)).blob();
      const file = new File([blob], 'rajyavani-news.jpg', { type: 'image/jpeg' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: getWhatsAppMessage(),
        });
      } else {
        handleDirectWhatsAppShare();
      }
    } catch (e) {
      console.warn('Share card fallback', e);
      handleDirectWhatsAppShare();
    }
  };

  return (
    <>
      {/* Floating Container */}
      <div 
        id="persistent-floating-share-container"
        className="fixed bottom-6 right-5 sm:right-8 z-50 flex flex-col items-end gap-3 print:hidden"
      >
        {/* Expanded Quick Share Menu */}
        {isOpen && (
          <div 
            id="floating-share-menu"
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-3.5 mb-2 w-72 sm:w-80 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-5 duration-200 transition-all"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 px-1">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-brand-red" /> बातमी शेअर करा
              </span>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* WhatsApp Direct Share Button */}
            <button
              id="whatsapp-direct-share-btn"
              onClick={handleDirectWhatsAppShare}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-98 group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {/* WhatsApp SVG Icon */}
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.203.043.072.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.058a8.018 8.018 0 01-4.326-1.258l-.31-.184-2.924.825.836-2.852-.202-.32A8.026 8.026 0 013.942 12c0-4.443 3.615-8.058 8.058-8.058 4.444 0 8.058 3.615 8.058 8.058 0 4.443-3.614 8.058-8.058 8.058z"/>
                </svg>
                <div className="text-left">
                  <div>WhatsApp वर पाठवा</div>
                  <div className="text-[11px] font-normal text-emerald-100">शीर्षक व लिंकसह शेअर करा</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-75 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* News Card Graphic Option */}
            <button
              id="generate-news-card-btn"
              onClick={generateNewsCard}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-brand-saffron/20 text-brand-saffron rounded-lg">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-gray-900">न्यूज कार्ड फोटो तयार करा</div>
                  <div className="text-[10px] text-gray-600">फोटोसह बातमी इमेज शेअर करा</div>
                </div>
              </div>
              <span className="text-[10px] bg-brand-red text-white px-2 py-0.5 rounded font-bold">नवीन</span>
            </button>

            {/* Copy Link Action */}
            <button
              id="copy-article-link-btn"
              onClick={handleCopyLink}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-500" />
                )}
                <span>{copied ? 'लिंक कॉपी झाली!' : 'बातमीची लिंक कॉपी करा'}</span>
              </div>
              {copied && <span className="text-[10px] text-emerald-600 font-bold">Copied</span>}
            </button>
          </div>
        )}

        {/* Main Floating Trigger Button */}
        <div className="flex items-center gap-2 group">
          {/* Informational Tooltip Pill on Scroll */}
          <span 
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full shadow-lg transition-all duration-300 pointer-events-none ${
              hasScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            WhatsApp वर शेअर करा
          </span>

          <div className="relative">
            {/* Pulsing ring indicator */}
            <span className="absolute -inset-1 rounded-full bg-emerald-500/40 animate-ping pointer-events-none"></span>

            <button
              id="floating-whatsapp-share-trigger"
              onClick={() => {
                // If closed, open menu AND trigger direct share option
                if (!isOpen) {
                  setIsOpen(true);
                } else {
                  setIsOpen(false);
                }
              }}
              onDoubleClick={handleDirectWhatsAppShare}
              title="WhatsApp वर शेअर करा (डबल क्लिकने थेट पाठवा)"
              className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-600 via-emerald-500 to-green-400 text-white rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white focus:outline-none focus:ring-4 focus:ring-emerald-400/40 cursor-pointer"
              aria-label="Share on WhatsApp"
            >
              {isOpen ? (
                <X className="w-6 h-6 sm:w-7 sm:h-7" />
              ) : (
                <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current drop-shadow-sm" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.203.043.072.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.058a8.018 8.018 0 01-4.326-1.258l-.31-.184-2.924.825.836-2.852-.202-.32A8.026 8.026 0 013.942 12c0-4.443 3.615-8.058 8.058-8.058 4.444 0 8.058 3.615 8.058 8.058 0 4.443-3.614 8.058-8.058 8.058z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* News Card Generator / Image Share Modal */}
      {cardModalOpen && (
        <div 
          id="news-card-share-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setCardModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-brand-red" />
                  राज्यवाणी न्यूज कार्ड इमेज (Clickable Image)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  ही इमेज WhatsApp किंवा सोशल मीडियावर शेअर करा
                </p>
              </div>
              <button 
                onClick={() => setCardModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Box */}
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[220px]">
              {isGeneratingCard ? (
                <div className="flex flex-col items-center gap-3 p-8">
                  <div className="w-8 h-8 border-3 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-semibold text-gray-600">बातमी इमेज तयार होत आहे...</p>
                </div>
              ) : generatedCardUrl ? (
                <img 
                  src={generatedCardUrl} 
                  alt={title || "बातमी शेअर कार्ड"}
                  decoding="async"
                  className="w-full h-auto object-contain rounded-lg shadow-sm" 
                />
              ) : (
                <p className="text-xs text-red-500">इमेज लोड करण्यात त्रुटी आली.</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap sm:flex-nowrap gap-2.5 pt-2">
              <button
                onClick={handleDirectWhatsAppShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.174.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086.159.058 1.011.477 1.184.564.173.087.289.13.332.203.043.072.043.419-.101.824zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.435 5.176L2 22l4.954-1.396A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.058a8.018 8.018 0 01-4.326-1.258l-.31-.184-2.924.825.836-2.852-.202-.32A8.026 8.026 0 013.942 12c0-4.443 3.615-8.058 8.058-8.058 4.444 0 8.058 3.615 8.058 8.058 0 4.443-3.614 8.058-8.058 8.058z"/>
                </svg>
                <span>WhatsApp वर पाठवा</span>
              </button>

              <button
                onClick={handleDownloadCard}
                disabled={!generatedCardUrl}
                className="flex items-center justify-center gap-1.5 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>इमेज सेव्ह करा</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingShareButton;
