'use client';

import { useEffect, useState } from 'react';
import { Languages } from 'lucide-react';

export function GoogleTranslator() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const initGoogleTranslate = () => {
            if ((window as any).google && (window as any).google.translate) {
                new (window as any).google.translate.TranslateElement(
                    {
                        pageLanguage: 'en',
                        includedLanguages: 'en,te,ta,hi,kn',
                        layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                        autoDisplay: false,
                    },
                    'google_translate_element'
                );
            }
        };

        (window as any).googleTranslateElementInit = initGoogleTranslate;

        if (document.getElementById('google-translate-script')) {
            // Script already loaded, manually init
            // Use a small timeout to ensure the div is ready
            setTimeout(initGoogleTranslate, 100);
            return;
        }

        const script = document.createElement('script');
        script.id = 'google-translate-script';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    }, []);

    if (!mounted) return null;

    return (
        <div className="relative flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer" title="Switch Language">
            <Languages className="w-4 h-4 text-primary shrink-0" />
            <div id="google_translate_element" className="google-custom-minimal"></div>
            <style jsx global>{`
                .google-custom-minimal {
                    height: 24px;
                    display: flex;
                    align-items: center;
                }
                .goog-te-gadget-simple {
                    background-color: transparent !important;
                    border: none !important;
                    padding: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    height: 100% !important;
                }
                .goog-te-gadget-simple span {
                    display: inline-block !important;
                    color: hsl(var(--foreground)) !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                    vertical-align: middle !important;
                }
                .goog-te-gadget-simple img {
                    display: none !important;
                }
                .goog-te-menu-value {
                    margin: 0 !important;
                    padding: 0 !important;
                }
                .goog-te-menu-value span:nth-child(3),
                .goog-te-menu-value span:nth-child(5) {
                    display: none !important;
                }
                .goog-te-gadget-icon {
                    display: none !important;
                }
                /* Minimal arrow indicator */
                .goog-te-menu-value:after {
                    content: '▼';
                    font-size: 8px;
                    color: hsl(var(--primary));
                    opacity: 0.6;
                    margin-left: 4px;
                }
                .goog-te-banner-frame.skiptranslate {
                    display: none !important;
                    visibility: hidden !important;
                }
                body {
                    top: 0px !important;
                }
                .goog-logo-link {
                    display: none !important;
                }
                .goog-te-gadget {
                    font-size: 0 !important;
                }
                /* Fix for menu positioning */
                .VIpgJd-Zvi9ab-OR9s-sn9K {
                    z-index: 10000 !important;
                }
            `}</style>
        </div>
    );
}
