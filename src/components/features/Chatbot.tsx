import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Bot } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Bonjour ! Je suis l'IA de Phoenix. Comment puis-je vous aider aujourd'hui ? Posez-moi une question sur nos projets, nos événements ou notre mission !\n\n⚠️ Mes réponses peuvent contenir des inexactitudes. Pour toute information officielle, contactez-nous via la page Contact.",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
    const [displayedText, setDisplayedText] = useState<{ [key: string]: string }>({});
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, displayedText]);

    // Typewriter effect for bot messages
    useEffect(() => {
        if (typingMessageId) {
            const message = messages.find(m => m.id === typingMessageId);
            if (!message || message.sender !== 'bot') {
                setTypingMessageId(null);
                return;
            }

            const fullText = message.text;
            let currentIndex = 0;

            const typingInterval = setInterval(() => {
                if (currentIndex < fullText.length) {
                    setDisplayedText(prev => ({
                        ...prev,
                        [typingMessageId]: fullText.substring(0, currentIndex + 1)
                    }));
                    currentIndex++;
                } else {
                    clearInterval(typingInterval);
                    setTypingMessageId(null);
                }
            }, 20); // 20ms per character for smooth typing

            return () => clearInterval(typingInterval);
        }
    }, [typingMessageId, messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Call Backend API
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: inputValue })
            });

            const data = await response.json();

            const botMessageId = (Date.now() + 1).toString();
            const botMessage: Message = {
                id: botMessageId,
                text: data.answer || "Désolé, je rencontre une erreur de connexion.",
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setTypingMessageId(botMessageId);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessageId = (Date.now() + 1).toString();
            const errorMessage: Message = {
                id: errorMessageId,
                text: "Désolé, je suis momentanément indisponible. Réessayez plus tard.",
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setTypingMessageId(errorMessageId);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-24 right-4 md:right-8 w-[90vw] md:w-[400px] h-[500px] md:h-[600px] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden z-[60] border border-gray-100 dark:border-white/10 flex flex-col font-sans"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-violet-600 to-orange-500 p-4 flex items-center justify-between text-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                    <Bot size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">TEYMOU</h3>
                                    <p className="text-xs text-white/80 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        En ligne
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleChat}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-zinc-900/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user'
                                            ? 'bg-violet-600 text-white rounded-br-sm'
                                            : 'bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/5 rounded-bl-sm shadow-sm'
                                            }`}
                                    >
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {msg.sender === 'bot' && typingMessageId === msg.id
                                                ? displayedText[msg.id] || ''
                                                : msg.sender === 'bot' && !displayedText[msg.id]
                                                    ? msg.text
                                                    : msg.text}
                                            {msg.sender === 'bot' && typingMessageId === msg.id && (
                                                <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
                                            )}
                                        </p>
                                        <span className="text-[10px] opacity-60 mt-1 block">
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-bl-sm border border-gray-200 dark:border-white/5 shadow-sm flex gap-1">
                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-white/5 shrink-0">
                            <form
                                onSubmit={handleSendMessage}
                                className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 p-2 rounded-full border border-gray-200 dark:border-white/5 focus-within:ring-2 focus-within:ring-violet-500/50 transition-all"
                            >
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Posez votre question..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 dark:text-white"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={toggleChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50 p-4 bg-gradient-to-r from-violet-600 to-orange-500 text-white rounded-full shadow-lg hover:shadow-violet-500/30 transition-shadow group"
            >
                <AnimatePresence mode='wait'>
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <Sparkles size={28} className="group-hover:animate-pulse" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </>
    );
}
