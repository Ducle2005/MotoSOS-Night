import type { IssueType } from '../types/rescue';
import { decryptPayload, encryptPayload } from '../utils/storageCrypto';
import {
  BATTERY_DIAGNOSIS,
  BELT_DIAGNOSIS,
  ENGINE_DIAGNOSIS,
  FUEL_DIAGNOSIS,
  GENERAL_DIAGNOSIS,
  TIRE_DIAGNOSIS,
} from './geminiMechanicFallbackData';

export type DiagnosticServiceId = 'battery' | 'tire' | 'engine' | 'fuel' | 'other';
export type AiReplyType = 'chat' | 'diagnosis';

export interface ProbableCause {
  name: string;
  probability: string;
}

export interface MechanicDiagnosis {
  summary: string;
  probableCauses: ProbableCause[];
  quickChecks: string[];
  safetyWarning: string;
  recommendedServiceId: DiagnosticServiceId;
  recommendedServiceName: string;
  estimatedPrice: string;
}

export interface AiAssistantResponse {
  replyType: AiReplyType;
  messageText: string;
  diagnosis?: MechanicDiagnosis;
}

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  text: string;
}

const API_KEY_KEY = 'motosos_gemini_api_key';

export function getStoredGeminiApiKey(): string {
  try {
    const envKey = import.meta.env?.VITE_GEMINI_API_KEY;
    if (typeof envKey === 'string' && envKey.trim().length > 0) return envKey.trim();
  } catch {}
  if (typeof window === 'undefined') return '';
  return decryptPayload(localStorage.getItem(API_KEY_KEY));
}

export function setStoredGeminiApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  if (!apiKey || !apiKey.trim()) {
    localStorage.removeItem(API_KEY_KEY);
    return;
  }
  localStorage.setItem(API_KEY_KEY, encryptPayload(apiKey.trim()));
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
  if (q.includes('đề') || q.includes('bình') || q.includes('ắc quy') || q.includes('tạch') || q.includes('hết điện') || q.includes('còi')) {
    return BATTERY_DIAGNOSIS;
  }
  if (q.includes('lốp') || q.includes('vỏ') || q.includes('xì') || q.includes('lủng') || q.includes('đinh') || q.includes('xẹp') || q.includes('bể bánh')) {
    return TIRE_DIAGNOSIS;
  }
  if (q.includes('ngập') || q.includes('nước') || q.includes('chết máy') || q.includes('bugi') || q.includes('tắt máy') || q.includes('giật')) {
    return ENGINE_DIAGNOSIS;
  }
  if (q.includes('xăng') || q.includes('cạn') || q.includes('kim xăng')) {
    return FUEL_DIAGNOSIS;
  }
  if (q.includes('curoa') || q.includes('lên ga') || q.includes('không chạy') || q.includes('nồi') || q.includes('xích') || q.includes('ga không đi')) {
    return BELT_DIAGNOSIS;
  }
  return GENERAL_DIAGNOSIS;
}

export function fallbackProcessMessage(query: string): AiAssistantResponse {
  const q = query.normalize('NFC').toLowerCase().trim();

  // Nhóm 1: Chào hỏi & Xã giao
  const hasDiagnosticKeywords = q.includes('hỏng') || q.includes('đề') || q.includes('lốp') || q.includes('chết máy') || q.includes('xăng') || q.includes('curoa') || q.includes('tạch') || q.includes('ngập') || q.includes('kêu') || q.includes('bình');
  const hasGeneralKeywords = q.includes('bao nhiêu') || q.includes('bao nhieu') || q.includes('giá') || q.includes('gia') || q.includes('chi phí') || q.includes('dắt bộ') || q.includes('phụ phí') || q.includes('bảo hành') || q.includes('sao biết');

  const isGreeting = (
    /^(xin chào|chào|chao|hello|hi|alo|chào bạn|chao ban|bro|hi bro|cảm ơn|cam on|ok|oke|thanks|bạn là ai|ban la ai)$/i.test(q) ||
    /(^|\s)(xin chào|chào bạn|hello|bạn là ai|cảm ơn|thanks)($|\s)/i.test(q)
  ) && !hasDiagnosticKeywords && !hasGeneralKeywords;

  if (isGreeting) {
    return {
      replyType: 'chat',
      messageText: 'Chào bạn! Tôi là Kỹ sư trưởng MotoSOS trực đêm 24/7. Xe của bạn đang có biểu hiện gì lạ (đề khó nổ, chết máy, lủng lốp, hết xăng hay phát ra tiếng kêu bất thường)? Bạn hãy miêu tả cụ thể hoặc chọn nhanh các triệu chứng ở thanh phía trên để tôi bắt bệnh nhé!',
    };
  }

  // Nhóm 2: Hỏi giá / Tư vấn kỹ thuật chung
  const isGeneralQuestion = hasGeneralKeywords;
  if (isGeneralQuestion && !q.includes('đang bị') && !q.includes('cứu tôi') && !q.includes('tạch tạch')) {
    if (q.includes('bình') || q.includes('binh') || q.includes('ắc quy') || q.includes('ac quy')) {
      return {
        replyType: 'chat',
        messageText: 'Bình ắc quy xe máy mới chính hãng (GS, Globe cho Vision, Air Blade, Lead, SH, Wave...) giá khoảng 320.000đ – 450.000đ bảo hành 6 tháng. Nếu xe chỉ bị yếu điện do quên tắt khóa hoặc để lâu, bạn chỉ cần chọn gói Kích bình tận nơi của MotoSOS giá niêm yết 90.000đ là đi được ngay nhé!',
      };
    }
    if (q.includes('lốp') || q.includes('lop') || q.includes('dắt bộ') || q.includes('dat bo')) {
      return {
        replyType: 'chat',
        messageText: 'Nếu lốp bị xì hoặc dính đinh, dắt bộ đoạn ngắn vào Trạm An Toàn 24/7 có đèn sáng là an toàn. Tuyệt đối KHÔNG nên ráng chạy xe khi lốp đã xẹp vì sẽ nát ruột xe và móp méo mâm đúc. MotoSOS có thợ vá ép nấm lưu động giá niêm yết 85.000đ tận nơi bạn nhé!',
      };
    }
    if (q.includes('phụ phí') || q.includes('phu phi') || q.includes('đêm') || q.includes('dem')) {
      return {
        replyType: 'chat',
        messageText: 'Khung giờ đêm 22h - 5h sáng MotoSOS áp dụng phụ phí trực đêm +20.000đ bồi dưỡng cho thợ. Nếu bạn chọn điểm đón tại Trạm An Toàn 24/7 và áp mã ANTOAN20, bạn sẽ được giảm ngay 20.000đ bù trừ trực tiếp trên hóa đơn nhé!',
      };
    }
    return {
      replyType: 'chat',
      messageText: 'Mọi dịch vụ của MotoSOS đều niêm yết giá trọn gói cố định minh bạch trước khi gọi thợ (Vá lốp 85.000đ, Kích bình 90.000đ, Giao xăng 80.000đ, Chết máy 120.000đ), có bảo hành 7 ngày và bảo hiểm 50 triệu đồng.',
    };
  }

  // Nhóm 3: Chẩn đoán sự cố xe
  const diag = fallbackDiagnose(q);
  return {
    replyType: 'diagnosis',
    messageText: diag.summary,
    diagnosis: diag,
  };
}

export async function askAiMechanic(
  userMessage: string,
  chatHistory: ChatHistoryEntry[] = [],
  apiKey?: string,
): Promise<AiAssistantResponse> {
  const key = (apiKey && apiKey.trim()) || getStoredGeminiApiKey();
  if (!key) return fallbackProcessMessage(userMessage);

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`;
    const systemInstruction = `Bạn là Kỹ sư trưởng chẩn đoán cứu hộ xe máy MotoSOS tại Việt Nam.
Hãy phân tích ngữ cảnh tin nhắn khách và trả về kết quả JSON thuần theo schema:
{
  "replyType": "chat" | "diagnosis",
  "messageText": "Câu trả lời tự nhiên, chi tiết, thân thiện",
  "diagnosis": {
    "summary": "Tình trạng xe",
    "probableCauses": [{"name": "Tên nguyên nhân đầy đủ", "probability": "80%"}],
    "quickChecks": ["Bước 1", "Bước 2", "Bước 3"],
    "safetyWarning": "Cảnh báo an toàn",
    "recommendedServiceId": "battery" | "tire" | "engine" | "fuel" | "other",
    "recommendedServiceName": "Kích bình & Đo dòng sạc" | "Vá lốp ép nấm tận nơi" | "Cứu hộ chết máy & Bugi" | "Giao 2L xăng RON 95 tận nơi" | "Thợ kiểm tra & Báo giá tại chỗ",
    "estimatedPrice": "90.000đ" | "85.000đ" | "120.000đ" | "80.000đ" | "50.000đ"
  }
}
Quy tắc:
1. Nếu khách chào hỏi, cảm ơn, xã giao ("alo", "hi", "xin chào"): replyType="chat", không kèm diagnosis.
2. Nếu khách hỏi giá, tư vấn xe chung ("thay bình bao nhiêu", "dắt bộ có sao không"): replyType="chat", không kèm diagnosis.
3. Chỉ khi khách mô tả triệu chứng xe hỏng cụ thể (đề không nổ, lủng lốp, chết máy, curoa...): replyType="diagnosis" kèm diagnosis.`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [
          ...chatHistory.map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.text }],
          })),
          { role: 'user', parts: [{ text: userMessage }] },
        ],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      }),
    });

    if (!res.ok) return fallbackProcessMessage(userMessage);
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return fallbackProcessMessage(userMessage);

    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned) as AiAssistantResponse;
    if (!parsed.replyType || !parsed.messageText) return fallbackProcessMessage(userMessage);
    return parsed;
  } catch {
    return fallbackProcessMessage(userMessage);
  }
}

export async function diagnoseMotorbikeIssue(
  userMessage: string,
  chatHistory: ChatHistoryEntry[] = [],
  apiKey?: string,
): Promise<MechanicDiagnosis> {
  const resp = await askAiMechanic(userMessage, chatHistory, apiKey);
  return resp.diagnosis || fallbackDiagnose(userMessage);
}
