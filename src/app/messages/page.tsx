'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatTimeAgo, formatPrice } from '@/lib/utils';
import {
  MessageSquare,
  Send,
  Phone,
  ShieldCheck,
  Building2,
  Paperclip,
  CheckCheck,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

function MessagesContent() {
  const searchParams = useSearchParams();
  const queryConversationId = searchParams.get('conversationId');
  const { user } = useAuth();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(queryConversationId);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConvId) {
      loadActiveConversation(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/messages?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
        if (!activeConvId && data.data.length > 0) {
          setActiveConvId(data.data[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveConversation = async (convId: string) => {
    try {
      const res = await fetch(`/api/messages/${convId}`);
      const data = await res.json();
      if (data.success) {
        setActiveConversation(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConvId || !messageText.trim()) return;

    setSending(true);
    const content = messageText.trim();
    setMessageText('');

    try {
      const res = await fetch(`/api/messages/${activeConvId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: user.id,
          content,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveConversation((prev: any) => ({
          ...prev,
          messages: [...(prev?.messages || []), data.data],
        }));
        loadConversations();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleSharePhone = () => {
    setMessageText('Hey, here is my campus contact: +91 98765 43210 (WhatsApp available for quick pickup)');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <MessageSquare className="w-12 h-12 text-primary mx-auto" />
        <h2 className="text-xl font-bold">Sign In Required</h2>
        <p className="text-xs text-slate-500">
          In-app student messaging requires a verified campus student account.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-card overflow-hidden h-[78vh] flex flex-col md:flex-row">
        {/* Left Side: Conversation List (4 Cols) */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Campus Messages
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Encrypted In-App
            </span>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary mb-2" />
                <span className="text-xs">Loading conversations...</span>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <p className="text-xs">No conversations yet.</p>
                <p className="text-[11px] text-slate-400">
                  Message a seller on Marketplace or contact a Lost & Found poster.
                </p>
              </div>
            ) : (
              conversations.map((c) => {
                const otherParticipant = c.participants?.find((p: any) => p.userId !== user.id)?.user;
                const isSelected = c.id === activeConvId;
                const lastMsg = c.messages?.[0];

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full p-3.5 text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-l-primary'
                        : 'hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    {otherParticipant?.avatar ? (
                      <Image
                        src={otherParticipant.avatar}
                        alt=""
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover border shrink-0"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {otherParticipant?.name?.[0] || 'S'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                          {otherParticipant?.name || 'Student'}
                        </span>
                        {lastMsg && (
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {formatTimeAgo(lastMsg.createdAt)}
                          </span>
                        )}
                      </div>

                      {c.listing && (
                        <span className="text-[10px] font-mono text-primary truncate block font-medium">
                          Item: {c.listing.title} ({formatPrice(c.listing.price)})
                        </span>
                      )}

                      {c.lostFoundPost && (
                        <span className="text-[10px] font-mono text-rose-600 truncate block font-medium">
                          Recovery: {c.lostFoundPost.title}
                        </span>
                      )}

                      <p className="text-xs text-slate-500 truncate">
                        {lastMsg?.content || 'No messages yet.'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Chat Window */}
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900">
          {activeConversation ? (
            <>
              {/* Chat Header with Item Preview */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/40 dark:bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-primary flex items-center justify-center font-bold text-xs">
                    {activeConversation.participants?.find((p: any) => p.userId !== user.id)?.user?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                      {activeConversation.participants?.find((p: any) => p.userId !== user.id)?.user?.name || 'Student'}
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Campus Verified
                    </span>
                  </div>
                </div>

                {/* Linked Item Banner */}
                {activeConversation.listing && (
                  <Link
                    href={`/marketplace/${activeConversation.listing.id}`}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs hover:border-primary transition-colors"
                  >
                    <span className="font-mono text-xs font-bold text-primary">
                      {formatPrice(activeConversation.listing.price)}
                    </span>
                    <span className="text-slate-600 truncate max-w-[120px]">
                      {activeConversation.listing.title}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                )}
              </div>

              {/* Messages Feed */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf8ff]/40 dark:bg-slate-950/40">
                {activeConversation.messages?.map((msg: any) => {
                  const isMine = msg.senderId === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isMine
                            ? 'bg-primary text-white rounded-br-none shadow-subtle'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700 shadow-subtle'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">
                        {formatTimeAgo(msg.createdAt)}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Contact Share Suggestion */}
              <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Want to coordinate physical pickup faster?</span>
                <button
                  type="button"
                  onClick={handleSharePhone}
                  className="font-medium text-primary hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" /> Share contact info
                </button>
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
                <input
                  type="text"
                  placeholder="Type a message to agree on price or pickup location..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-40 transition-colors shadow-subtle"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <h3 className="font-semibold text-sm text-slate-600">Select a conversation</h3>
              <p className="text-xs">Chat safely with fellow campus buyers, sellers, and finders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-xs">Loading campus messaging...</span>
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
