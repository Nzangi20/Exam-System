import Image from 'next/image';
import Link from 'next/link';

interface CdamLogoProps {
  size?: number;
  showText?: boolean;
  href?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export default function CdamLogo({
  size = 40,
  showText = true,
  href,
  className = '',
  variant = 'dark',
}: CdamLogoProps) {
  const textColor = variant === 'light' ? 'text-white' : 'text-violet-900';
  const subColor = variant === 'light' ? 'text-violet-200' : 'text-violet-600';

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/images/cdam-logo.svg"
        alt="CDAM Logo"
        width={size}
        height={size}
        className="rounded-full shrink-0 shadow-sm"
        priority
      />
      {showText && (
        <div className="min-w-0 hidden sm:block">
          <p className={`font-bold text-sm leading-tight ${textColor}`}>
            Center for Data Analytics
          </p>
          <p className={`text-[10px] uppercase tracking-wide ${subColor}`}>
            &amp; Modeling · Examination System
          </p>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
