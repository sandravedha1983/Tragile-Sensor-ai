'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { i18n } from '@/i18n-config'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const pathName = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const redirectedPathName = (locale: string) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }

  if (!mounted) return (
    <Button variant="ghost" size="icon">
      <Globe className="h-[1.2rem] w-[1.2rem]" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {i18n.locales.map((locale) => (
          <DropdownMenuItem key={locale} onClick={() => router.push(redirectedPathName(locale))}>
            {locale === 'en' ? 'English' :
              locale === 'es' ? 'Español' :
                locale === 'hi' ? 'हिन्दी' :
                  locale === 'te' ? 'తెలుగు' :
                    locale === 'ta' ? 'தமிழ்' : (locale as string).toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
