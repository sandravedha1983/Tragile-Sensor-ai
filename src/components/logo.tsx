import Link from 'next/link';
import { Bot } from 'lucide-react';
import type { Locale } from '@/i18n-config';

export function Logo({ lang }: { lang?: Locale }) {
  const homePath = lang ? `/${lang}` : '/';
  return (
    <Link href={homePath} className="flex items-center gap-3 group transition-all" prefetch={false}>
      <div className="relative h-11 w-11 flex items-center justify-center overflow-hidden rounded-2xl border-2 border-white/5 bg-primary/10 shadow-[0_0_30px_rgba(30,64,175,0.3)] group-hover:scale-105 transition-transform duration-500">
        <Bot className="w-6 h-6 text-primary drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 group-hover:opacity-0 transition-opacity" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-[10px] font-black uppercase text-accent tracking-[0.4em] mb-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">TriageSense</span>
        <span className="text-2xl font-black text-foreground tracking-tighter uppercase whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">AI CLINICAL</span>
      </div>
    </Link>
  );
}
