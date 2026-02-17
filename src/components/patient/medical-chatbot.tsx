'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Bot, User, AlertTriangle } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { runMedicalChatbot } from '@/ai/flows/medical-chatbot';

interface Message {
    role: 'user' | 'model';
    text: string;
    timestamp: any;
}

export function MedicalChatbot({ patientUserId }: { patientUserId: string }) {
    const firestore = useFirestore();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const chatRef = useMemoFirebase(() => {
        if (!firestore || !patientUserId) return null;
        return query(
            collection(firestore, 'patient_chats'),
            where('patientUserId', '==', patientUserId),
            orderBy('timestamp', 'asc'),
            limit(50)
        );
    }, [firestore, patientUserId]);

    const { data: messages } = useCollection<Message>(chatRef);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !firestore || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setIsLoading(true);

        try {
            // 1. Save user message to Firestore
            await addDocumentNonBlocking(collection(firestore, 'patient_chats'), {
                patientUserId,
                role: 'user',
                text: userMessage,
                timestamp: serverTimestamp(),
            });

            // 2. Call AI flow
            const history = messages?.map(m => ({ role: m.role, text: m.text })) || [];
            const result = await runMedicalChatbot({ symptoms: userMessage, history });

            // 3. Compose response text
            let responseText = `${result.analysis}\n\n**Suggestions:** ${result.suggestions.join(', ')}\n\n**Next Steps:** ${result.nextSteps.join(', ')}\n\n**Safety:** ${result.precautions.join('. ')}`;

            if (result.isEmergency) {
                responseText = `⚠️ **EMERGENCY:** Seek immediate medical attention!\n\n${responseText}`;
            }

            responseText += `\n\n*${result.disclaimer}*`;

            // 4. Save AI response to Firestore
            await addDocumentNonBlocking(collection(firestore, 'patient_chats'), {
                patientUserId,
                role: 'model',
                text: responseText,
                timestamp: serverTimestamp(),
                riskLevel: result.riskLevel,
                isEmergency: result.isEmergency
            });

        } catch (error) {
            console.error('Chatbot error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="flex flex-col h-[600px] border-primary/20 shadow-xl bg-card/50 backdrop-blur-md">
            <CardHeader className="border-b bg-primary/5 py-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Medical Assistant AI
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                    <div className="flex flex-col gap-4">
                        {messages?.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : 'bg-muted border rounded-tl-none'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1 opacity-70">
                                        {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                                        <span className="text-[10px] font-bold uppercase">
                                            {msg.role === 'user' ? 'You' : 'Assistant'}
                                        </span>
                                    </div>
                                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t bg-background/50">
                <form onSubmit={handleSend} className="flex w-full gap-2">
                    <Input
                        placeholder="Describe your symptoms..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
