import { Bot, Check, KeyRound, Send, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  askAiMechanic, getStoredGeminiApiKey, maskApiKey, setStoredGeminiApiKey,
  type AiReplyType, type ChatHistoryEntry, type DiagnosticServiceId, type MechanicDiagnosis,
} from '../services/geminiDiagnosticService';
import { loadUserProfile, type UserProfileData } from '../types/profile';
import { AiDiagnosisCard } from './AiDiagnosisCard';

export interface AiDiagnosticModalProps {
  isOpen: boolean; onClose: () => void; onSelectServiceAndOrder: (serviceId: DiagnosticServiceId) => void;
}
interface ChatItem {
  id: string; role: 'user' | 'assistant'; text: string;
  replyType?: AiReplyType; diagnosis?: MechanicDiagnosis; isLiveAi?: boolean;
}
const QUICK_CHIPS = ['Đề không nổ, tạch tạch', 'Xe ngập nước chết máy', 'Lủng lốp / xì hơi', 'Lên ga xe không chạy'];

export function AiDiagnosticModal({ isOpen, onClose, onSelectServiceAndOrder }: AiDiagnosticModalProps) {
  const [profile, setProfile] = useState<UserProfileData>(loadUserProfile);
  const [messages, setMessages] = useState<ChatItem[]>(() => {
    const p = loadUserProfile();
    return [{
      id: 'welcome', role: 'assistant', replyType: 'chat',
      text: `Chào ${p.fullName}! Tôi là Kỹ sư AI MotoSOS đã nhận diện xe ${p.bikeModel} (${p.licensePlate}). Xe đang có biểu hiện gì lạ? Hãy mô tả âm thanh, khói, cảm giác lái để tôi chẩn đoán nhé!`,
    }];
  });
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showKeyPrompt, setShowKeyPrompt] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [activeKey, setActiveKey] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setProfile(loadUserProfile());
      const key = getStoredGeminiApiKey();
      setActiveKey(key);
      setApiKeyInput(key ? maskApiKey(key) : '');
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: 'user', text: query }]);
    setInputText('');
    setIsThinking(true);

    try {
      const history: ChatHistoryEntry[] = messages.slice(-4).map((m) => ({ role: m.role, text: m.text }));
      const resp = await askAiMechanic(query, history, activeKey);
      setMessages((prev) => [
        ...prev,
        { id: `ai_${Date.now()}`, role: 'assistant', replyType: resp.replyType, text: resp.messageText, diagnosis: resp.diagnosis, isLiveAi: resp.isLiveAi },
      ]);
    } catch {
      setMessages((prev) => [...prev, { id: `err_${Date.now()}`, role: 'assistant', replyType: 'chat', text: 'Có lỗi tạm thời khi kết nối. Hãy thử lại hoặc chọn gói cứu hộ trực tiếp.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (!trimmed.includes('•')) {
      setStoredGeminiApiKey(trimmed);
      setActiveKey(trimmed);
      setApiKeyInput(trimmed ? maskApiKey(trimmed) : '');
    }
    setShowKeyPrompt(false);
  };

  const hasKey = Boolean(activeKey && activeKey.trim());

  return (
    <div className="fixed inset-0 z-[125] bg-slate-950/75 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[430px] h-[92dvh] sm:h-[820px] sm:max-h-[90vh] bg-[#F4F6F9] rounded-t-[30px] sm:rounded-[30px] overflow-hidden flex flex-col shadow-[0_24px_60px_rgba(0,0,0,0.45)] border border-white/15 animate-in slide-in-from-bottom duration-250">
        {/* Obsidian Dark Header */}
        <header className="bg-[#090D16] text-white px-4 pt-3 pb-3.5 shrink-0">
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-2.5 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[13.5px] font-extrabold tracking-tight text-white leading-tight">Kỹ Sư AI MotoSOS</h2>
                {hasKey ? (
                  <p className="flex items-center gap-1.5 text-[10.5px] font-bold text-emerald-400 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Gemini 2.5 Live
                  </p>
                ) : (
                  <p className="text-[10.5px] font-bold text-slate-400 mt-0.5">Chế độ chẩn đoán thông minh</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!showKeyPrompt && hasKey) setApiKeyInput(maskApiKey(activeKey));
                  setShowKeyPrompt(!showKeyPrompt);
                }}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold active:scale-95 transition-all flex items-center gap-1 ${
                  hasKey ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-amber-300 border border-amber-400/30'
                }`}
              >
                {hasKey ? <><Check className="h-3 w-3" /><span>Key: OK</span></> : <><KeyRound className="h-3 w-3" /><span>API Key</span></>}
              </button>
              <button
                type="button" aria-label="Đóng chat AI" onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

          {/* Đồng bộ thông tin xe chủ phương tiện */}
          <div className="bg-[#0e1422] border-b border-white/10 px-4 py-1.5 flex items-center justify-between text-[11px] shrink-0">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span>Chủ xe: <strong className="text-white font-bold">{profile.fullName}</strong></span>
            </span>
            <span className="font-bold text-emerald-400">{profile.bikeModel} • {profile.licensePlate}</span>
          </div>

        {/* API Key Drawer Accordion */}
        {showKeyPrompt && (
          <div className="border-b border-emerald-500/20 bg-slate-900 px-4 py-3 text-xs text-white shrink-0 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-slate-300 font-medium">Gemini API Key (Google AI Studio hoặc Vertex AI):</span>
              {hasKey && <span className="text-[10px] text-emerald-400 font-bold">Đang kích hoạt</span>}
            </div>
            <div className="flex gap-2">
              <input
                type="text" value={apiKeyInput}
                onFocus={() => { if (apiKeyInput.includes('•')) setApiKeyInput(''); }}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AQ.... hoặc AIzaSy..."
                className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:border-emerald-400 focus:outline-none"
              />
              <button type="button" onClick={handleSaveApiKey} className="rounded-lg bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 font-bold text-slate-950 transition-colors">
                Lưu
              </button>
            </div>
          </div>
        )}

        {/* Dải Chip Triệu Chứng Nhanh */}
        <div className="bg-white border-b border-slate-100 px-3.5 py-2 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip} type="button" onClick={() => handleSendMessage(chip)}
                className="shrink-0 whitespace-nowrap text-[11.5px] font-medium px-3 py-1.5 rounded-full bg-slate-100 hover:bg-[#090D16] hover:text-white text-slate-700 transition-colors active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Bong bóng Chat & Thẻ Chẩn Đoán */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3 [&::-webkit-scrollbar]:hidden">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              {m.role === 'user' ? (
                <div className="ml-auto max-w-[82%] bg-[#090D16] text-white rounded-2xl rounded-br-sm px-3.5 py-2.5 text-[13px] leading-snug shadow-sm">
                  {m.text}
                </div>
              ) : m.replyType === 'diagnosis' && m.diagnosis ? (
                <AiDiagnosisCard diagnosis={m.diagnosis} onSelectServiceAndOrder={onSelectServiceAndOrder} onClose={onClose} />
              ) : (
                <div className="max-w-[85%] bg-white rounded-2xl rounded-tl-sm p-3.5 border border-slate-200/75 shadow-[0_4px_18px_rgba(15,23,42,0.04)] text-[13px] text-slate-800 leading-relaxed font-medium">
                  {m.text}
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-2 py-1">
              <span className="flex h-2 w-2 animate-ping rounded-full bg-emerald-500" />
              <span>Kỹ sư AI đang phân tích dữ liệu...</span>
            </div>
          )}
        </div>

        {/* Thanh Nhập Liệu Đáy */}
        <footer className="bg-white border-t border-slate-100 px-3.5 py-2.5 shrink-0">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/30 rounded-full pl-4 pr-1.5 py-1.5 flex items-center gap-2 transition-all border border-transparent focus-within:border-emerald-300"
          >
            <input
              type="text" value={inputText} onChange={(e) => setInputText(e.target.value)}
              placeholder="Mô tả triệu chứng xe (vd: đề tạch tạch...)"
              className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit" disabled={!inputText.trim() || isThinking} aria-label="Gửi triệu chứng"
              className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 active:scale-95 transition-transform disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}

export const AiMechanicChatModal = AiDiagnosticModal;
