import { Send, Star, Wrench, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { ChatMessage, MechanicInfo } from '../../types/rescue';

interface MechanicChatDrawerProps {
  isOpen: boolean;
  mechanic: MechanicInfo;
  messages: ChatMessage[];
  quickSuggestions: string[];
  isMechanicTyping: boolean;
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export function MechanicChatDrawer({
  isOpen,
  mechanic,
  messages,
  quickSuggestions,
  isMechanicTyping,
  onSendMessage,
  onClose,
}: MechanicChatDrawerProps) {
  const [draft, setDraft] = useState('');
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages.length, isMechanicTyping]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onSendMessage(draft);
    setDraft('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={`Nhắn tin với thợ ${mechanic.name}`}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 flex h-[78%] flex-col rounded-t-3xl bg-[#F8FAFC] shadow-2xl"
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 rounded-t-3xl">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
                  <Wrench className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-extrabold text-slate-900">
                    {mechanic.name}
                  </h2>
                  <p className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden="true" />
                    <span className="font-sans font-semibold tabular-nums text-slate-700">
                      {mechanic.rating}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-sans tabular-nums text-emerald-700 font-semibold">
                      {mechanic.licensePlate}
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng khung nhắn tin"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Messages list */}
            <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'rounded-br-md bg-emerald-500 font-medium text-white'
                          : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-slate-400">
                      {msg.timestampLabel}
                    </span>
                  </div>
                );
              })}

              {isMechanicTyping && (
                <div className="flex items-start">
                  <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-500 shadow-xs">
                    Thợ đang soạn tin nhắn...
                  </div>
                </div>
              )}
              <div ref={listEndRef} />
            </div>

            {/* 3 Quick-reply chips + input bar */}
            <div className="shrink-0 border-t border-slate-200/80 bg-white px-4 pt-2.5 pb-3">
              <div
                className="flex flex-wrap gap-1.5 pb-2.5"
                aria-label="Tin nhắn gợi ý gửi nhanh"
              >
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onSendMessage(suggestion)}
                    className="rounded-full border border-emerald-200 bg-emerald-50/70 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-95"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Nhập tin nhắn cho thợ..."
                  aria-label="Nội dung tin nhắn cho thợ"
                  className="min-h-[42px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  aria-label="Gửi tin nhắn"
                  disabled={!draft.trim()}
                  className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
