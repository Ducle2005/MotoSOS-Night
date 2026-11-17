import type { IssueType } from '../types/rescue';
import { decryptPayload, encryptPayload } from '../utils/storageCrypto';
import {
  BATTERY_DIAGNOSIS, BELT_DIAGNOSIS, ENGINE_DIAGNOSIS,
  FUEL_DIAGNOSIS, GENERAL_DIAGNOSIS, TIRE_DIAGNOSIS,
} from './geminiMechanicFallbackData';

export type DiagnosticServiceId = 'battery' | 'tire' | 'engine' | 'fuel' | 'other';
export type AiReplyType = 'chat' | 'diagnosis';

export interface ProbableCause { name: string; probability: string; }
export interface MechanicDiagnosis {
  summary: string; probableCauses: ProbableCause[]; quickChecks: string[];
  safetyWarning: string; recommendedServiceId: DiagnosticServiceId;
  recommendedServiceName: string; estimatedPrice: string;
}
export interface AiAssistantResponse {
  replyType: AiReplyType; messageText: string; diagnosis?: MechanicDiagnosis; isLiveAi?: boolean;
}
export interface ChatHistoryEntry { role: 'user' | 'assistant'; text: string; }

const STORAGE_KEY = 'motosos_gemini_api_key';
const MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash'];

export function getStoredGeminiApiKey(): string {
  if (typeof window !== 'undefined') {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      const dec = decryptPayload(local)?.trim();
      if (dec) return dec;
    } catch {}
  }
  try {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (typeof envKey === 'string' && envKey.trim()) return envKey.trim();
  } catch {}
  return '';
}

export function setStoredGeminiApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  if (!apiKey || !apiKey.trim()) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, encryptPayload(apiKey.trim()));
}

export function maskApiKey(key: string): string {
  const k = key.trim();
  if (!k) return '';
  if (k.length <= 10) return `${k.slice(0, 3)}••••${k.slice(-2)}`;
  return `${k.slice(0, 6)}••••••••${k.slice(-4)}`;
}

export function mapDiagnosticToIssueType(serviceId: DiagnosticServiceId): IssueType {
  switch (serviceId) {
    case 'battery': return 'battery_jump';
    case 'tire': return 'flat_tire';
    case 'engine': return 'engine_dead';
    case 'fuel': return 'out_of_fuel';
    default: return 'other';
  }
}

export function fallbackDiagnose(query: string): MechanicDiagnosis {
  const q = query.toLowerCase();
  if (q.includes('curoa') || (q.includes('lên ga') && q.includes('không chạy')) || q.includes('nồi') || q.includes('xích') || q.includes('ga không đi')) return BELT_DIAGNOSIS;
  if (q.includes('đề') || q.includes('bình') || q.includes('ắc quy') || q.includes('tạch') || q.includes('hết điện') || q.includes('còi')) return BATTERY_DIAGNOSIS;
  if (q.includes('lốp') || q.includes('vỏ') || q.includes('xì') || q.includes('lủng') || q.includes('đinh') || q.includes('xẹp') || q.includes('bể bánh')) return TIRE_DIAGNOSIS;
  if (q.includes('ngập') || q.includes('nước') || q.includes('chết máy') || q.includes('bugi') || q.includes('tắt máy') || q.includes('giật')) return ENGINE_DIAGNOSIS;
  if (q.includes('xăng') || q.includes('cạn') || q.includes('kim xăng')) return FUEL_DIAGNOSIS;
  return GENERAL_DIAGNOSIS;
}

export function fallbackProcessMessage(query: string, errorReason?: string): AiAssistantResponse {
  const q = query.normalize('NFC').toLowerCase().trim();
  const hasDiag = q.includes('hỏng') || q.includes('đề') || q.includes('lốp') || q.includes('chết máy') || q.includes('xăng') || q.includes('curoa') || q.includes('tạch') || q.includes('ngập') || q.includes('kêu') || q.includes('bình');
  const hasGen = q.includes('bao nhiêu') || q.includes('bao nhieu') || q.includes('giá') || q.includes('gia') || q.includes('chi phí') || q.includes('dắt bộ') || q.includes('phụ phí') || q.includes('bảo hành');

  const prefix = errorReason ? `[Lưu ý kết nối: ${errorReason}]\n\n` : '';

  const isGreeting = (
    /^(xin chào|chào|chao|hello|hi|alo|chào bạn|chao ban|bro|hi bro|cảm ơn|cam on|ok|oke|thanks|bạn là ai|ban la ai)$/i.test(q) ||
    /(^|\s)(xin chào|chào bạn|hello|bạn là ai|cảm ơn|thanks)($|\s)/i.test(q)
  ) && !hasDiag && !hasGen;

  if (isGreeting) {
    return { replyType: 'chat', messageText: `${prefix}Chào bạn! Tôi là Kỹ sư trưởng MotoSOS trực đêm 24/7. Xe của bạn đang có biểu hiện gì lạ (đề khó nổ, chết máy, lủng lốp, hết xăng...)? Bạn hãy miêu tả cụ thể để tôi bắt bệnh nhé!` };
  }
  if (hasGen && !q.includes('đang bị') && !q.includes('cứu tôi') && !q.includes('tạch tạch')) {
    if (q.includes('bình') || q.includes('ắc quy')) return { replyType: 'chat', messageText: `${prefix}Bình ắc quy xe máy mới chính hãng giá 320.000đ – 450.000đ. Gói Kích bình tận nơi của MotoSOS giá niêm yết 90.000đ nhé!` };
    if (q.includes('lốp') || q.includes('dắt bộ')) return { replyType: 'chat', messageText: `${prefix}Không nên ráng chạy khi lốp xẹp vì sẽ móp mâm đúc. MotoSOS có thợ vá ép nấm lưu động giá niêm yết 85.000đ tận nơi.` };
    return { replyType: 'chat', messageText: `${prefix}Mọi dịch vụ của MotoSOS đều niêm yết giá cố định minh bạch (Vá lốp 85k, Kích bình 90k, Giao xăng 80k, Chết máy 120k) và bảo hiểm 50 triệu đồng.` };
  }

  const diag = fallbackDiagnose(q);
  return { replyType: 'diagnosis', messageText: `${prefix}${diag.summary}`, diagnosis: diag };
}

function buildEndpoints(model: string, apiKey: string): string[] {
  const enc = encodeURIComponent(apiKey);
  const vertex = `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:generateContent?key=${enc}`;
  const aiStudio = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${enc}`;
  return apiKey.startsWith('AQ.') ? [vertex, aiStudio] : [aiStudio, vertex];
}

export async function askAiMechanic(
  userMessage: string, chatHistory: ChatHistoryEntry[] = [], apiKey?: string
): Promise<AiAssistantResponse> {
  const key = (apiKey && apiKey.trim()) || getStoredGeminiApiKey();
  if (!key) return fallbackProcessMessage(userMessage);

  const sys = `Bạn là Kỹ sư trưởng chẩn đoán cứu hộ xe máy MotoSOS Việt Nam.
Trả về JSON thuần schema:
{
  "replyType": "chat" | "diagnosis",
  "messageText": "Câu trả lời thân thiện, chi tiết",
  "diagnosis": {
    "summary": "Tóm tắt tình trạng",
    "probableCauses": [{"name": "Tên nguyên nhân", "probability": "85%"}],
    "quickChecks": ["Bước 1", "Bước 2"],
    "safetyWarning": "Cảnh báo an toàn",
    "recommendedServiceId": "battery" | "tire" | "engine" | "fuel" | "other",
    "recommendedServiceName": "Kích bình & Đo dòng sạc" | "Vá lốp ép nấm tận nơi" | "Cứu hộ chết máy & Bugi" | "Giao 2L xăng RON 95 tận nơi" | "Thợ kiểm tra tại chỗ",
    "estimatedPrice": "90.000đ" | "85.000đ" | "120.000đ" | "80.000đ" | "50.000đ"
  }
}
Nếu chào hỏi, hỏi giá chung: replyType="chat", không gửi diagnosis. Chỉ gửi diagnosis khi khách tả sự cố xe.`;

  const payload = {
    systemInstruction: { parts: [{ text: sys }] },
    contents: [
      ...chatHistory.map((h) => ({
        role: h.role === 'assistant' ? ('model' as const) : ('user' as const),
        parts: [{ text: h.text }],
      })),
      { role: 'user' as const, parts: [{ text: userMessage }] },
    ],
    generationConfig: { responseMimeType: 'application/json', temperature: 0.4 },
  };

  let lastErrorMsg = '';

  for (const model of MODELS) {
    const urls = buildEndpoints(model, key);
    for (const url of urls) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleaned) as AiAssistantResponse;
            if (parsed.replyType && parsed.messageText) {
              return { ...parsed, isLiveAi: true };
            }
          }
        } else {
          const errData = await res.json().catch(() => null);
          const msg = errData?.error?.message || `HTTP ${res.status}`;
          lastErrorMsg = `${model}: ${msg}`;
        }
      } catch (e: any) {
        lastErrorMsg = e?.message || 'Lỗi mạng';
      }
    }
  }

  return fallbackProcessMessage(userMessage, lastErrorMsg);
}

export async function diagnoseMotorbikeIssue(
  userMessage: string, chatHistory: ChatHistoryEntry[] = [], apiKey?: string
): Promise<MechanicDiagnosis> {
  const resp = await askAiMechanic(userMessage, chatHistory, apiKey);
  return resp.diagnosis || fallbackDiagnose(userMessage);
}
