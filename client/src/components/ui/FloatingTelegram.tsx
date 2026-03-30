// client/src/components/ui/FloatingTelegram.tsx
import { SiTelegram } from 'react-icons/si';
import { useState } from 'react';

interface FloatingTelegramProps {
  telegramUrl?: string;
  username?: string;
}

export default function FloatingTelegram({ 
  telegramUrl = 'https://t.me/unchiudaan',
  username = '@unchiudaan'
}: FloatingTelegramProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-foreground text-background text-sm font-medium rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
          Join our Telegram
          <div className="absolute -bottom-1 right-4 w-2 h-2 bg-foreground rotate-45" />
        </div>
      )}

      {/* Floating Button */}
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Join Telegram Channel"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#0088cc] text-white shadow-lg hover:shadow-2xl hover:scale-110 transition-all duration-300"
      >
        <SiTelegram className="w-7 h-7" />
        
        {/* Pulse Effect */}
        <span className="absolute inset-0 rounded-full bg-[#0088cc] animate-ping opacity-75" />
      </a>
    </div>
  );
}
