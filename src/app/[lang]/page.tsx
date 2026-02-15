import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, HeartPulse, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { GoogleTranslator } from '@/components/google-translator';
import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';

const features = (dict: any) => [
  {
    icon: <Bot className="w-8 h-8 text-primary" />,
    title: dict.page.home.feature_1_title,
    description: dict.page.home.feature_1_description,
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    title: dict.page.home.feature_2_title,
    description: dict.page.home.feature_2_description,
  },
  {
    icon: <HeartPulse className="w-8 h-8 text-primary" />,
    title: dict.page.home.feature_3_title,
    description: dict.page.home.feature_3_description,
  },
];

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
  const { lang } = await params;
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image');
  const dict = await getDictionary(lang);
  const featureList = features(dict);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo lang={lang} />
          <GoogleTranslator />
        </div>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href={`/${lang}/login`}>{dict.navigation.login}</Link>
          </Button>
          <Button asChild>
            <Link href={`/${lang}/login`}>{dict.page.home.launch_dashboard} <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <Button variant="outline" size="sm" className="w-fit">
                <Bot className="w-4 h-4 mr-2" />
                <span>{dict.page.home.powered_by}</span>
              </Button>
              <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter">
                {dict.page.home.title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {dict.page.home.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href={`/${lang}/login`}>{dict.page.home.launch_dashboard} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href={`/${lang}/login`}>{dict.page.home.emergency_access}</Link>
                </Button>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={1000}
                  height={800}
                  data-ai-hint={heroImage.imageHint}
                  className="w-full h-auto object-cover"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 bg-muted/40 rounded-t-2xl">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">{dict.page.home.features_title}</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              {dict.page.home.features_description}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featureList.map((feature, index) => (
              <Card key={index} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center gap-4">
                  {feature.icon}
                  <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo lang={lang} />
          <p className="text-sm text-muted-foreground">{dict.page.home.footer_text.replace('{year}', new Date().getFullYear().toString())}</p>
        </div>
      </footer>
    </div>
  );
}
