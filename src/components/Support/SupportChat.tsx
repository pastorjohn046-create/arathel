import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, MessageCircle, X, User, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SupportChat: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!user || !isOpen) return;
    try {
      const response = await fetch(`/api/support?userId=${user.uid}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          senderId: user.uid,
          text: message,
          isAdmin: isAdmin
        })
      });
      if (response.ok) {
        setMessage('');
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-border flex flex-col z-50 overflow-hidden"
          >
            <div className="p-4 bg-brand text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Live Support</h3>
                  <p className="text-[10px] text-white/70">Typically replies in minutes</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <a 
                  href="https://wa.me/13363247969" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold transition-colors"
                >
                  <Phone size={10} />
                  <span>WhatsApp</span>
                </a>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-surface/30">
              {messages.length === 0 && (
                <div className="text-center py-10">
                  <MessageCircle size={32} className="mx-auto text-brand/20 mb-2" />
                  <p className="text-xs text-ink-muted">How can we help you today?</p>
                </div>
              )}
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.senderId === user?.uid 
                      ? 'bg-brand text-white rounded-tr-none' 
                      : 'bg-white border border-border text-ink rounded-tl-none'
                  }`}>
                    {msg.text}
                    <p className={`text-[8px] mt-1 ${msg.senderId === user?.uid ? 'text-white/60' : 'text-ink-muted'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-border bg-white">
              <div className="relative">
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-surface border border-border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-brand"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand text-white rounded-lg flex items-center justify-center hover:bg-brand-hover transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
