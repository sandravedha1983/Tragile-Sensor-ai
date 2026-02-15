'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export function VoiceAssistant() {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState('');
    const { toast } = useToast();

    const handleListen = useCallback(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast({
                title: 'Not Supported',
                description: 'Voice recognition is not supported in this browser.',
                variant: 'destructive',
            });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const result = event.results[current][0].transcript;
            setTranscript(result);

            // Basic AI logic or response
            const response = `I heard you say: ${result}. How can I assist you with your health today?`;
            speak(response);
        };

        recognition.start();
    }, [toast]);

    const speak = (text: string) => {
        if (!window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <Card className="rounded-2xl shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    Voice Buddy
                </CardTitle>
                <CardDescription>Speak to your AI healthcare assistant.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <div className="flex justify-center flex-col items-center gap-4">
                    <Button
                        size="lg"
                        variant={isListening ? 'destructive' : 'default'}
                        className="w-20 h-20 rounded-full shadow-lg transition-all hover:scale-105"
                        onClick={handleListen}
                        disabled={isSpeaking}
                    >
                        {isListening ? <MicOff className="w-8 h-8 animate-pulse" /> : <Mic className="w-8 h-8" />}
                    </Button>

                    <div className="text-center">
                        <p className="text-sm font-medium">
                            {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap Mic to Start'}
                        </p>
                        {transcript && (
                            <p className="text-xs text-muted-foreground mt-2 italic">"{transcript}"</p>
                        )}
                    </div>
                </div>

                {isSpeaking && (
                    <div className="flex items-center gap-2 justify-center text-primary animate-bounce">
                        <Volume2 className="w-4 h-4" />
                        <div className="flex gap-1">
                            <span className="w-1 h-3 bg-primary rounded-full animate-[stretch_1s_infinite_0s]"></span>
                            <span className="w-1 h-3 bg-primary rounded-full animate-[stretch_1s_infinite_0.1s]"></span>
                            <span className="w-1 h-3 bg-primary rounded-full animate-[stretch_1s_infinite_0.2s]"></span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
