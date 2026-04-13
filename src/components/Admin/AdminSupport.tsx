import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Send, User, MessageCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SupportMessage {
  id: string;
  userId: string;
  senderId: string;
  text: string;
  timestamp: string;
  isAdmin: boolean;
}

export const AdminSupport: React.FC = () => {
  const { user: adminUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserList, setShowUserList] = useState(true);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedUserId) {
      setShowUserList(false);
    }
  }, [selectedUserId]);

  const fetchAllMessages = async () => {
    try {
      const response = await fetch('/api/support');
      const allMsgs = await response.json();
      
      // Get unique user IDs
      const uniqueUserIds = Array.from(new Set(allMsgs.map((m: any) => m.userId)));
      
      // For each user ID, get the last message and user info
      const usersWithLastMsg = uniqueUserIds.map(uid => {
        const userMsgs = allMsgs.filter((m: any) => m.userId === uid);
        const lastMsg = userMsgs.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
        
        return {
          userId: uid,
          lastMessage: lastMsg,
          displayName: lastMsg.senderId === uid ? 'User' : 'Support'
        };
      });

      setChatUsers(usersWithLastMsg.sort((a, b) => 
        new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
      ));

      if (selectedUserId) {
        const filtered = allMsgs.filter((m: any) => m.userId === selectedUserId);
        setMessages(filtered.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()));
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchAllMessages();
    const interval = setInterval(fetchAllMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !adminUser || !selectedUserId || isSending) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          senderId: adminUser.uid,
          text: reply,
          isAdmin: true
        })
      });
      if (response.ok) {
        setReply('');
        fetchAllMessages();
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[600px] bg-white rounded-3xl overflow-hidden border border-border shadow-sm relative">
      {/* Users List */}
      <div className={cn(
        "w-full lg:w-1/3 border-r border-border flex flex-col transition-all duration-300",
        !showUserList && "hidden lg:flex"
      )}>
        <div className="p-4 border-b border-border bg-surface/50">
          <h3 className="font-bold text-ink text-sm uppercase tracking-widest">Active Chats</h3>
        </div>
        <div className="flex-grow overflow-y-auto">
          {chatUsers.length === 0 ? (
            <div className="p-8 text-center text-ink-muted text-xs">
              No active support requests.
            </div>
          ) : (
            chatUsers.map((chatUser) => (
              <button
                key={chatUser.userId}
                onClick={() => {
                  setSelectedUserId(chatUser.userId);
                  setShowUserList(false);
                }}
                className={cn(
                  "w-full p-4 flex items-center space-x-3 hover:bg-surface transition-colors border-b border-border last:border-0 text-left",
                  selectedUserId === chatUser.userId && "bg-brand/5 border-l-4 border-l-brand"
                )}
              >
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center text-brand font-bold">
                  <User size={18} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-bold text-ink text-sm truncate">User #{chatUser.userId.slice(0, 8)}</p>
                    <span className="text-[8px] text-ink-muted font-bold">
                      {new Date(chatUser.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted truncate">{chatUser.lastMessage.text}</p>
                </div>
                <ChevronRight size={14} className="text-ink-muted" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-grow flex flex-col bg-surface/10 transition-all duration-300",
        showUserList && "hidden lg:flex"
      )}>
        {selectedUserId ? (
          <>
            <div className="p-4 border-b border-border bg-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowUserList(true)}
                  className="lg:hidden p-2 -ml-2 text-ink-muted hover:text-brand"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center text-brand">
                  <User size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-ink">Chatting with User #{selectedUserId.slice(0, 8)}</h3>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] p-4 rounded-2xl text-sm shadow-sm ${
                    msg.isAdmin 
                      ? 'bg-brand text-white rounded-tr-none' 
                      : 'bg-white border border-border text-ink rounded-tl-none'
                  }`}>
                    {msg.text}
                    <p className={`text-[8px] mt-2 font-bold uppercase tracking-widest ${msg.isAdmin ? 'text-white/60' : 'text-ink-muted'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-border">
              <div className="relative">
                <input 
                  type="text" 
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full bg-surface border border-border rounded-2xl pl-6 pr-14 py-4 text-sm focus:outline-none focus:border-brand transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-brand text-white rounded-xl flex items-center justify-center hover:bg-brand-hover transition-all shadow-lg shadow-brand/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-ink-muted">
            <MessageCircle size={64} className="mb-4 opacity-10" />
            <p className="font-bold">Select a chat to start responding</p>
            <p className="text-xs mt-1">Real-time support dashboard</p>
          </div>
        )}
      </div>
    </div>
  );
};
