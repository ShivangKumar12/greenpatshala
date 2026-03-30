// client/src/components/LogoPlaceholder.tsx
import { GraduationCap } from 'lucide-react';

interface LogoPlaceholderProps {
  className?: string;
  title?: string;
}

export default function LogoPlaceholder({ 
  className = '', 
  title 
}: LogoPlaceholderProps) {
  return (
    <div 
      className={`flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background ${className}`}
    >
      <GraduationCap className="w-16 h-16 text-primary mb-2" />
      <p className="text-sm font-semibold text-primary">Unchi Udaan</p>
      {title && (
        <p className="text-xs text-muted-foreground mt-1 text-center px-4 line-clamp-2">
          {title}
        </p>
      )}
    </div>
  );
}
