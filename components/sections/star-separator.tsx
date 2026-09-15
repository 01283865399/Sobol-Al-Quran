import { cn } from '@/lib/utils';

interface StarSeparatorProps {
  label?: string;
  className?: string;
}

export function StarSeparator({ label, className }: StarSeparatorProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2.5', className)}>
      <div className="h-px w-12 bg-gradient-to-l from-gold/40 to-transparent" />
      <div className="relative w-3.5 h-3.5">
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
          <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" fill="#C4A35A" opacity="0.6" />
        </svg>
      </div>
      {label && <span className="text-xs font-cairo text-gold px-1.5">{label}</span>}
      <div className="relative w-3.5 h-3.5">
        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none">
          <path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" fill="#C4A35A" opacity="0.6" />
        </svg>
      </div>
      <div className="h-px w-12 bg-gradient-to-r from-gold/40 to-transparent" />
    </div>
  );
}
