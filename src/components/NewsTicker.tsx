import { useState, useEffect } from 'react';
import { NewsItem } from '../types';
import { Volume2, Sparkles, Heart, Bell, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewsTickerProps {
  news: NewsItem[];
}

export default function NewsTicker({ news }: NewsTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (news.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [news.length]);

  if (!news || news.length === 0) return null;

  const safeIndex = currentIndex >= news.length ? 0 : currentIndex;
  const currentNews = news[safeIndex];

  const getNewsBadge = (type: NewsItem['type']) => {
    switch (type) {
      case 'welcome':
        return {
          label: 'ترحيب بعضو جديد',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: Sparkles
        };
      case 'baby':
        return {
          label: 'تهنئة بمولود',
          color: 'bg-sky-100 text-sky-800 border-sky-200',
          icon: Heart
        };
      case 'condolence':
        return {
          label: 'تعزية ومواساة',
          color: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: Bell
        };
      default:
        return {
          label: 'تنويه عام',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Volume2
        };
    }
  };

  const badgeInfo = getNewsBadge(currentNews.type);
  const BadgeIcon = badgeInfo.icon;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length);
  };

  return (
    <div id="news-ticker-container" className="bg-[#414141] border-b border-white/10 py-2.5 px-4 sticky top-0 z-40 shadow-sm dir-rtl text-right">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Ticker label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-extrabold tracking-wider text-[#414141] bg-white px-2 py-0.5 rounded-md">
            أخبار العائلة
          </span>
        </div>

        {/* Sliding text content */}
        <div className="flex-1 overflow-hidden min-w-0 h-6 flex items-center relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNews.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center gap-2.5 w-full md:gap-4"
            >
              {/* Type Badge */}
              <span className={`inline-flex items-center gap-1 text-[10px] md:text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${badgeInfo.color}`}>
                <BadgeIcon size={12} />
                {badgeInfo.label}
              </span>

              {/* News Text */}
              <p className="text-xs md:text-sm font-medium text-white truncate hover:text-white transition-colors flex-1 leading-relaxed">
                {currentNews.content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next/Prev buttons */}
        <div className="flex items-center gap-1.5 shrink-0 border-r border-white/10 pr-3 mr-1">
          <button
            onClick={handlePrev}
            className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-md"
            title="السابق"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={handleNext}
            className="text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-md"
            title="التالي"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
