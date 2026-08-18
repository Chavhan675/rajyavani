import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  articleId: string;
  className?: string;
  showText?: boolean;
}

export default function BookmarkButton({ articleId, className = '', showText = false }: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark } = useAuth();
  const bookmarked = isBookmarked(articleId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark(articleId);
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center gap-1.5 transition-all cursor-pointer rounded-lg ${
        bookmarked 
          ? 'text-brand-red bg-red-50 hover:bg-red-100' 
          : 'text-gray-500 hover:text-brand-red hover:bg-gray-100'
      } ${className}`}
      title={bookmarked ? "सेव्ह केलेली बातमी काढून टाका" : "बातमी जतन करा (Bookmark)"}
      aria-label="Bookmark"
    >
      <Bookmark className={`w-4 h-4 transition-transform active:scale-125 ${bookmarked ? 'fill-brand-red stroke-brand-red' : 'stroke-current'}`} />
      {showText && (
        <span className="text-xs font-semibold">
          {bookmarked ? 'जतन केले' : 'जतन करा'}
        </span>
      )}
    </button>
  );
}
