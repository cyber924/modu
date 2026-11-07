import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy Google GenAI Client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString() 
  });
});

// AI Smart Reply Draft Generation Endpoint
app.post("/api/ai/suggest-replies", async (req, res) => {
  try {
    const { title, content, category, subCategory, partnerName } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const ai = getGenAI();

    // Fallback template drafts if API key is not present or in case of external errors
    const fallbackDrafts = [
      {
        tone: "polite",
        label: "정중한 신뢰 안내형",
        badge: "가장 추천",
        content: `안녕하세요, ${partnerName || '공식 제휴처'}입니다.\n\n고객님께서 문의해 주신 [${title}] 건에 대하여 정밀 확인을 마쳤습니다. 제휴사 표준 운영 가이드 및 안전 규정에 따라 신속하고 만족스러운 조치가 진행될 예정입니다.\n\n추가로 궁금하신 사항이나 일정 조율이 필요하시면 언제든 편하게 회신해 주시기 바랍니다. 성심성의껏 도와드리겠습니다.`
      },
      {
        tone: "quick",
        label: "신속 견적 및 해결형",
        badge: "빠른 처리",
        content: `안녕하세요! ${partnerName || '제휴 담당팀'}입니다.\n\n문의하신 내용([${title}])을 즉시 접수하여 확인 완료하였습니다. 요청하신 일정 및 조건에 맞추어 최적의 가이드라인과 예상 견적 안내를 바로 준비하여 처리해 드리고자 합니다.\n\n요청하신 진행 사항에 대해 승인해 주시면 즉시 본 작업/예약 확정에 착수하겠습니다. 감사합니다.`
      },
      {
        tone: "detailed",
        label: "단계별 상세 절차형",
        badge: "상세 안내",
        content: `안녕하십니까, ${partnerName || '공식 파트너사'} 전담 안내센터입니다.\n\n고객님께서 접수해 주신 문의 사항([${title}])과 관련하여 향후 진행 절차를 상세히 안내해 드립니다.\n\n1. 1차 세부 확인 및 상태 점검\n2. 전담 실무자 배정 및 일정/비용 산정\n3. 최종 처리 완료 후 개별 보고\n\n원활한 진행을 위해 최선을 다하겠습니다. 추가 확인이 필요하신 서류나 사진이 있으시면 언제든 편하게 말씀해 주세요.`
      }
    ];

    if (!ai) {
      return res.json({
        success: true,
        source: "template",
        drafts: fallbackDrafts
      });
    }

    const prompt = `당신은 B2B/B2C 통합 문의 시스템의 전문 파트너사 및 CS 담당자입니다.
고객의 문의 내용을 바탕으로 제휴처가 고객에게 바로 전송할 수 있는 3가지 서로 다른 톤앤매너의 답변 초안을 작성해주세요.

[문의 정보]
- 분류: ${category} / ${subCategory}
- 제목: ${title}
- 고객 문의 내용: ${content}
- 답변자(제휴처 명칭): ${partnerName || '공식 제휴사'}

3가지 톤(정중한 안내형, 신속 견적 및 해결형, 단계별 상세 절차형)으로 작성하여 아래 JSON 형식으로만 응답해주세요:
{
  "drafts": [
    {
      "tone": "polite",
      "label": "정중한 신뢰 안내형",
      "badge": "가장 추천",
      "content": "공식적이고 정중하며 신뢰감을 주는 친절한 답변 본문"
    },
    {
      "tone": "quick",
      "label": "신속 견적 및 해결형",
      "badge": "빠른 처리",
      "content": "핵심 결론과 즉시 조치 가능한 액션을 강조한 명쾌한 답변 본문"
    },
    {
      "tone": "detailed",
      "label": "단계별 상세 절차형",
      "badge": "상세 안내",
      "content": "진행 단계(1, 2, 3) 및 주의사항, 다음 조치 방법을 친절히 설명한 답변 본문"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text?.trim() || "";
    let parsedData = null;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // JSON markdown cleanup if needed
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      parsedData = JSON.parse(cleaned);
    }

    if (parsedData && Array.isArray(parsedData.drafts) && parsedData.drafts.length > 0) {
      return res.json({
        success: true,
        source: "gemini",
        drafts: parsedData.drafts
      });
    }

    return res.json({
      success: true,
      source: "template",
      drafts: fallbackDrafts
    });

  } catch (error: any) {
    console.error("Gemini Smart Reply Error:", error);
    // Graceful fallback to guarantee UI stability
    return res.json({
      success: true,
      source: "fallback",
      error: error.message,
      drafts: [
        {
          tone: "polite",
          label: "정중한 신뢰 안내형",
          badge: "기본 추천",
          content: `안녕하세요! 공식 제휴처입니다. 고객님의 문의 사항을 확인하였으며, 즉시 검토 후 정성껏 처리해 드리겠습니다. 추가 전달사항이 있으시면 언제든 말씀해 주세요.`
        },
        {
          tone: "quick",
          label: "신속 해결형",
          badge: "빠른 처리",
          content: `안녕하세요! 문의하신 건에 대해 전담팀에서 즉각 확인에 착수하였습니다. 최단 시간 내에 결과를 조치하고 안내해 드리겠습니다.`
        },
        {
          tone: "detailed",
          label: "상세 안내형",
          badge: "상세 가이드",
          content: `고객님 안녕하십니까. 접수해 주신 문의에 대해 규정 및 관련 부서 협의를 거쳐 순차적으로 처리될 예정입니다. 편안한 이용 되시길 바랍니다.`
        }
      ]
    });
  }
});

// AI Smart Register Help Item Curation Endpoint
app.post("/api/ai/smart-register-help", async (req, res) => {
  try {
    const { prompt: userPrompt } = req.body;
    if (!userPrompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        success: true,
        source: "template",
        item: {
          category: "shopping",
          categoryLabel: "🛒 알뜰 생필품 최저가",
          title: `[AI추천] ${userPrompt} 실시간 최저가 특가 패키지`,
          subtitle: "무료배송 + 익일 도착 보장 · 당사 단독 특가",
          brand: "인기 브랜드",
          originalPrice: 28000,
          price: 18900,
          discountRate: "32%",
          badge: "🔥 AI 추천 핫딜",
          imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
          buyUrl: "https://coupang.com",
          seller: "공식 제휴몰",
          description: `${userPrompt} 관련 실시간 가격 비교 및 최저가 혜택이 적용된 엄선된 추천 상품입니다.`,
          tags: ["#최저가", "#AI추천", "#인기상품", "#특가할인"]
        }
      });
    }

    const systemPrompt = `당신은 대한민국 1위 큐레이션 쇼핑 및 생활 정보 플랫폼 '모두의도움'의 전문 MD입니다.
사용자가 입력한 상품/서비스 요청 내용을 바탕으로 소비자가 즉시 구매하고 싶도록 매력적인 쇼핑몰 상품 상세 정보를 생성해주세요.

[입력 요청 내용]
${userPrompt}

반드시 아래 JSON 형식으로만 응답해주세요:
{
  "category": "shopping" 또는 "insurance" 또는 "festival",
  "categoryLabel": "🛒 알뜰 생필품 최저가" 또는 "🛡️ 안심 보험 다이렉트" 또는 "🎪 전국 축제 & 특산물",
  "title": "눈에 띄는 매력적인 상품 타이틀",
  "subtitle": "핵심 혜택 서브타이틀 (예: 무료배송 + 익일 도착 보장)",
  "brand": "브랜드명",
  "originalPrice": 정가 숫자 (예: 30000),
  "price": 할인가 숫자 (예: 19800),
  "discountRate": "할인율 (예: 34%)",
  "badge": "인기 뱃지 (예: 🔥 역대급 최저가)",
  "imageUrl": "적절한 Unsplash 이미지 URL 또는 관련 고화질 이미지 주소",
  "buyUrl": "https://coupang.com",
  "seller": "판매처 명칭",
  "description": "상세한 큐레이션 추천 설명",
  "tags": ["#태그1", "#태그2", "#태그3"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text?.trim() || "";
    let parsedData = null;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      parsedData = JSON.parse(cleaned);
    }

    if (parsedData && parsedData.title) {
      return res.json({
        success: true,
        source: "gemini",
        item: parsedData
      });
    }

    throw new Error("Invalid AI JSON structure");
  } catch (error: any) {
    console.error("AI Smart Register Help Error:", error);
    return res.json({
      success: true,
      source: "fallback",
      item: {
        category: "shopping",
        categoryLabel: "🛒 알뜰 생필품 최저가",
        title: `[AI추천] 실시간 최저가 특가 패키지`,
        subtitle: "무료배송 + 익일 도착 보장 · 당사 단독 특가",
        brand: "인기 브랜드",
        originalPrice: 28000,
        price: 18900,
        discountRate: "32%",
        badge: "🔥 AI 추천 핫딜",
        imageUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
        buyUrl: "https://coupang.com",
        seller: "공식 제휴몰",
        description: "실시간 가격 비교 및 최저가 혜택이 적용된 엄선된 추천 상품입니다.",
        tags: ["#최저가", "#AI추천", "#인기상품", "#특가할인"]
      }
    });
  }
});

// Helper: Fetch and parse real-time Google News RSS articles
interface GoogleNewsArticle {
  title: string;
  link: string;
  pubDate: string;
  source: string;
}

async function fetchGoogleNewsFeed(keyword?: string): Promise<GoogleNewsArticle[]> {
  try {
    let url = "";
    if (keyword && keyword.trim()) {
      url = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword.trim())}&hl=ko&gl=KR&ceid=KR:ko`;
    } else {
      url = `https://news.google.com/rss/search?q=${encodeURIComponent("소비자 피해 OR 환불 OR 리콜 OR 지원금 OR 통신 사기")}&hl=ko&gl=KR&ceid=KR:ko`;
    }

    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!resp.ok) {
      console.warn("Google News RSS fetch failed status:", resp.status);
      return [];
    }

    const xml = await resp.text();
    const items: GoogleNewsArticle[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
    let match;

    const decodeHtml = (str: string) => {
      return str
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/<[^>]*>/g, "")
        .trim();
    };

    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const itemContent = match[1];
      const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(itemContent);
      const linkMatch = /<link>([\s\S]*?)<\/link>/i.exec(itemContent);
      const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/i.exec(itemContent);
      const sourceMatch = /<source[^>]*>([\s\S]*?)<\/source>/i.exec(itemContent);

      const rawTitle = titleMatch ? decodeHtml(titleMatch[1]) : "";
      const link = linkMatch ? linkMatch[1].trim() : "";
      const pubDate = pubDateMatch ? decodeHtml(pubDateMatch[1]) : "";
      let source = sourceMatch ? decodeHtml(sourceMatch[1]) : "";

      let title = rawTitle;
      if (!source && rawTitle.includes(" - ")) {
        const parts = rawTitle.split(" - ");
        source = parts.pop() || "";
        title = parts.join(" - ");
      } else if (source && rawTitle.endsWith(` - ${source}`)) {
        title = rawTitle.slice(0, -(source.length + 3)).trim();
      }

      if (title && link) {
        items.push({
          title,
          link,
          pubDate,
          source: source || "구글 뉴스"
        });
      }
    }

    return items;
  } catch (err) {
    console.error("fetchGoogleNewsFeed error:", err);
    return [];
  }
}

// AI Autonomous Trend Finder (Steps 1, 2, and 3)
app.post("/api/ai/scan-trends", async (req, res) => {
  // 1. Validate GEMINI_API_KEY is configured
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      success: false,
      error: "GEMINI_API_KEY_MISSING",
      message: "GEMINI_API_KEY 환경변수가 설정되지 않았습니다. 관리자 설정의 Secrets 패널에서 API 키를 설정해 주십시오."
    });
  }

  // 2. Parse and validate useGrounding (defaults to true if omitted)
  let useGrounding = req.body.useGrounding;
  if (useGrounding === undefined) {
    useGrounding = true;
  } else if (typeof useGrounding !== "boolean") {
    if (useGrounding === "true" || useGrounding === 1) {
      useGrounding = true;
    } else if (useGrounding === "false" || useGrounding === 0) {
      useGrounding = false;
    } else {
      return res.status(400).json({
        success: false,
        error: "INVALID_PARAMETER",
        message: "useGrounding 매개변수는 boolean 타입이어야 합니다."
      });
    }
  }

  const keyword = (req.body.keyword || "").trim();
  const modelName = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  // 3. Set up AbortController and 25-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 25000);

  try {
    let newsArticles: GoogleNewsArticle[] = [];
    let searchQueries: string[] = [];
    let sources: Array<{ title: string; url: string }> = [];

    // Real-time Google News RSS Feed Search
    if (useGrounding) {
      const searchQuery = keyword ? `구글 뉴스: "${keyword}"` : "구글 뉴스: 실시간 소비자 피해 및 트렌드";
      searchQueries.push(searchQuery);
      newsArticles = await fetchGoogleNewsFeed(keyword);
      
      if (newsArticles.length > 0) {
        sources = newsArticles.map(item => ({
          title: `[${item.source}] ${item.title}`,
          url: item.link
        }));
      } else {
        clearTimeout(timeoutId);
        return res.status(404).json({
          success: false,
          error: "NEWS_SEARCH_EMPTY",
          message: keyword 
            ? `'${keyword}' 관련 실시간 구글 뉴스 기사를 찾지 못했습니다. 다른 키워드로 검색하거나 일반 AI 추천 모드를 사용해 주십시오.`
            : "실시간 구글 뉴스 피드에서 최신 기사를 수집하지 못했습니다. 잠시 후 재시도해 주십시오."
        });
      }
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
        // @ts-ignore
        signal: controller.signal
      }
    });

    let prompt = "";
    if (useGrounding && newsArticles.length > 0) {
      const articlesContext = newsArticles
        .map((a, i) => `${i + 1}. [${a.source}] ${a.title}\n   일시: ${a.pubDate}\n   원문 링크: ${a.link}`)
        .join("\n\n");

      prompt = `다음은 방금 구글 뉴스 피드(Google News RSS)에서 실시간으로 직접 수집한 실제 최신 뉴스 기사 목록입니다:

---
${articlesContext}
---

위 실제 최신 뉴스 기사들의 실제 보도 내용과 사건을 정밀 분석하여, 대한민국 소비자를 위한 실시간 핫이슈 3건(긴급피해, 알짜혜택, 피해보상/리콜) 제안 카드를 생성해 주십시오.

[작성 요구사항]
1. 허위나 가상의 사건을 지어내지 마시고, 위 구글 뉴스에 실제로 보도된 사건, 기업명, 피해/혜택 내용을 있는 그대로 사실에 입각하여 작성하십시오.
2. 각 제안 카드의 explanation(제안 사유)에는 보도된 언론사 및 핵심 쟁점, 소비자가 즉시 취해야 할 행동 요령을 명확히 설명하십시오.
3. 3개 제안 카드는 각각 다음 범주에 맞게 균형 있게 구성하십시오:
   - 긴급피해 (예: 부당 결제, 일방적 요금 인상/환불 거부, 사기 피해 등)
   - 알짜혜택 (예: 신규 보상안, 정부/지자체 지원, 환급금 지급 등)
   - 피해보상/리콜 (예: 무상 리콜, 과징금 처분, 집단분쟁조정 등)`;
    } else {
      prompt = `대한민국(한국) 언론, 포털(네이버/다음), SNS에서 화제가 되고 있는 최신 소비자 이슈 중 다음 세 가지 범주에 해당하는 이슈 3개를 분석해 주십시오:
1. **긴급피해** (예: 부당 과금, 환불 거부, 위약금 분쟁)
2. **알짜혜택** (예: 정부/지자체 무상 지원금, 복지 할인, 환급 제도)
3. **피해보상/리콜** (예: 대기업 제품 결함 무상 리콜, 집단 보상)

(참고: 본 모드는 실시간 검색 미사용 모드이므로, 일반적인 소비자 정책 및 법률 구제 가이드라인을 중심으로 작성해 주십시오.)`;
    }

    const config: any = {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            title: { type: Type.STRING },
            badge: { type: Type.STRING },
            emoji: { type: Type.STRING },
            hotIndex: { type: Type.INTEGER },
            growthRate: { type: Type.INTEGER },
            lawBasis: { type: Type.STRING },
            actionType: { type: Type.STRING },
            actionTopic: { type: Type.STRING },
            parentCategory: { type: Type.STRING },
            subCategory: { type: Type.STRING },
            prefillTitle: { type: Type.STRING },
            prefillContent: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["type", "title", "badge", "emoji", "hotIndex", "growthRate", "lawBasis", "actionType", "actionTopic", "explanation"]
        }
      }
    };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config
    });

    clearTimeout(timeoutId); // Clean up timer!

    const text = response.text?.trim() || "";
    let proposals = null;
    try {
      proposals = JSON.parse(text);
    } catch {
      const clean = text.replace(/^```json\s*/i, "").replace(/\s*```$/i, "");
      proposals = JSON.parse(clean);
    }

    let finalSource = "AI 추천 — 실시간 검색 미사용";
    if (useGrounding && newsArticles.length > 0) {
      finalSource = "google_news_live";
    }

    if (Array.isArray(proposals) && proposals.length > 0) {
      return res.json({
        success: true,
        source: finalSource,
        searchQueries,
        sources,
        newsArticles,
        proposals
      });
    }

    return res.status(500).json({
      success: false,
      error: "PARSE_ERROR",
      message: "AI 응답 파싱에 실패하였거나 빈 결과가 반환되었습니다. 다시 시도해 주십시오."
    });

  } catch (error: any) {
    clearTimeout(timeoutId); // Ensure timer is cleaned up!
    console.error("AI Scan Trends Error:", error);

    const isTimeout = error.name === "AbortError" || (error.message && error.message.toLowerCase().includes("abort")) || error.message === "Timeout";

    return res.status(isTimeout ? 408 : 500).json({
      success: false,
      error: isTimeout ? "TIMEOUT" : "API_ERROR",
      message: isTimeout 
        ? "실시간 구글 뉴스 검색 분석 도중 대기 시간이 초과되었습니다. 잠시 후 재시도해 주십시오."
        : `AI 분석 호출 중 오류가 발생하였습니다: ${error.message}`
    });
  }
});

// AI Inquiry Hub Batch Generation with Strict Deduplication
app.post("/api/hub/generate-batch", async (req, res) => {
  const { 
    category = 'legal', 
    count = 3, 
    existingTitles = [], 
    customTopicPrompt = '' 
  } = req.body;

  const targetCount = Math.min(Math.max(Number(count) || 3, 1), 10);
  const timestamp = Date.now();
  const existingListSample = Array.isArray(existingTitles) 
    ? existingTitles.slice(-80).map((t: string, i: number) => `${i + 1}. ${t}`).join('\n') 
    : '';

  // Comprehensive Fallback generator for offline/quota environments
  const generateFallbacks = () => {
    const fallbackThemes: Array<{
      category: string;
      categoryLabel: string;
      iconName: string;
      subCategory: string;
      rankBadge: string;
      title: string;
      questionScenario: string;
      summary: string;
      steps: Array<{ stepNumber: number; title: string; desc: string }>;
      checklist: string[];
      proTip: string;
      tags: string[];
      requiredDocs: string[];
      parentCategory: string;
    }> = [
      {
        category: 'legal',
        categoryLabel: '법률/생활',
        iconName: 'Scale',
        subCategory: '임대차/주거',
        rankBadge: '생활 법률 핫이슈',
        title: '공동주택 세대 내 층간 흡연(간접흡연) 피해 시 관리사무소 조사권 및 분쟁조정 절차',
        questionScenario: '아파트 화장실 환풍기나 발코니에서 지속적으로 올라오는 담배 연기로 고통받고 있습니다. 관리사무소에 항의해도 권한이 없다며 소극적입니다. 법적 조사 요청 및 손해배상 청구가 가능한가요?',
        summary: '공동주택관리법 제20조의2에 따라 관리사무소는 흡연 세대에 직접 방문하여 간접흡연 중단 및 실내 흡연 금지를 권고할 법적 조사 권한을 가집니다. 지속적인 피해 시 환경분쟁조정위원회에 정신적 위자료(월 20~50만 원) 조정을 신청할 수 있습니다.',
        steps: [
          { stepNumber: 1, title: '피해 일지 및 시간대 기록', desc: '담배 냄새 유입 일시와 시간대, 환풍기 흡입구 사진 또는 간이 공기질 측정 수치를 1~2주간 일지로 기록합니다.' },
          { stepNumber: 2, title: '관리주체(관리사무소) 공식 조사 청구', desc: '공동주택관리법 제20조의2 제2항에 의거하여 관리사무소에 해당 라인 흡연 세대 방문 조사 및 방송 계도를 공식 서면 요청합니다.' },
          { stepNumber: 3, title: '중앙환경분쟁조정위 분쟁조정 신청', desc: '시정되지 않을 경우 지자체 분쟁조정위원회 또는 중앙환경분쟁조정위원회에 전자 신청(수수료 1~2만 원)으로 신속한 위자료 합의 조정을 이끌어냅니다.' }
        ],
        checklist: ['보복성 소음이나 폭언은 형사처벌 대상이 될 수 있으므로 직접 대면 방문은 지양하세요.', '화장실 전동 댐퍼(역류 방지기) 설치 영수증은 차후 손해배상 청구 시 구상권 인정 증빙이 됩니다.'],
        proTip: '관리사무소에 구두 요청 대신 ‘공동주택관리법 제20조의2에 따른 실태조사 요청서’ 서면 접수증을 남기면 관리소장이 법적 의무에 따라 즉시 방문 조사를 시행합니다.',
        tags: ['#층간흡연', '#간접흡연대처', '#공동주택관리법', '#환경분쟁조정'],
        requiredDocs: ['피해 일시 기록표', '관리사무소 민원 접수 내역', '역류방지댐퍼 시공 견적서'],
        parentCategory: 'other'
      },
      {
        category: 'legal',
        categoryLabel: '법률/생활',
        iconName: 'ShieldAlert',
        subCategory: '사기/거래보호',
        rankBadge: '소비자 긴급 구제',
        title: '무인 점포(아이스크림/빨래방) 결제 단말기 오류로 인한 절도범 오인 신고 대처 요령',
        questionScenario: '무인 아이스크림 매장에서 카드를 꽂고 결제 완료 음성을 듣고 나왔는데, 며칠 뒤 카드 승인이 누락되었다며 점주가 절도죄로 경찰에 고소하겠다고 연락이 왔습니다. 어떻게 소명해야 하나요?',
        summary: '절도죄 성립의 핵심 요건인 [불법영득의사]가 결여되었음을 카드 결제 시도 로그와 CCTV 영상으로 증명하면 무혐의 처리됩니다. 고의가 없는 단말기 통신 오류이므로 즉시 원금 계좌이체 및 확인서를 교부받으면 형사 고소가 성립하지 않습니다.',
        steps: [
          { stepNumber: 1, title: '결제 시도 및 이동 동선 소명', desc: '해당 일시의 카드사 승인 거절/취소 내역, 마이데이터 승인 시도 로그를 캡처하여 고의 결제 회피가 아님을 확보합니다.' },
          { stepNumber: 2, title: '점주에게 원금 즉시 변제 및 합의서 작성', desc: '과도한 합의금(원금의 10~50배) 요구는 공갈미수가 될 수 있으므로, 상품 원금 상당액을 계좌이체하고 입금증을 남깁니다.' },
          { stepNumber: 3, title: '경찰 조사 출석 시 진술 및 무혐의 종결', desc: '경찰 연락 시 CCTV 상 정상적으로 카드를 삽입하고 대기했던 행동을 진술하여 불법영득의사 없음을 입증하고 내사종결을 요청합니다.' }
        ],
        checklist: ['점주의 과도한 합의금 협박 문자나 통화 녹음은 반드시 보존하세요.', '결제 승인 알림톡을 평소 현장에서 확인하는 습관을 들이세요.'],
        proTip: '대법원 판례상 무인매장에서 결제 수단을 투입하거나 태그하는 외관상 행위를 한 경우 과실에 불과하여 형법상 절도죄로 처벌할 수 없습니다.',
        tags: ['#무인점포결제오류', '#절도오인소명', '#불법영득의사없음', '#합의금요구대처'],
        requiredDocs: ['카드사 통신 로그/결제시도내역', '원금 이체확인증', '점주 대화 녹취록'],
        parentCategory: 'other'
      },
      {
        category: 'shopping',
        categoryLabel: '쇼핑/결제',
        iconName: 'CreditCard',
        subCategory: '전자상거래/환불',
        rankBadge: '쇼핑 실무 TOP',
        title: '해외 온라인 쇼핑몰(알리/테무 등) 가품(모조품) 배송 시 전액 환불 및 세관 폐기 처리법',
        questionScenario: '유명 브랜드 운동화를 해외 직구로 구매했는데 받아보니 조잡한 짝퉁 모조품이었습니다. 판매자는 반품 배송비를 제가 내고 중국으로 보내야만 환불해 준다고 버티는데 어떻게 해야 하나요?',
        summary: '상표법 및 관세법상 지식재산권 침해 물품(위조품)은 국제 우편 반송 자체가 불법입니다. 플랫폼 가품 보상제(Dispute)를 열고 관세청 지식재산권 통관 규정을 제시하면 반품 없이 [100% 즉시 환불] 처리가 의무화되어 있습니다.',
        steps: [
          { stepNumber: 1, title: '정품 대비 가품 식별 증거 촬영', desc: '정품 폰트, 라벨 택, 마감 불량 부위, 바코드 조회 오류 화면을 정품 사진과 1:1 비교 캡처합니다.' },
          { stepNumber: 2, title: '플랫폼 이의제기(Dispute) 접수', desc: '반품 없는 환불(Refund Only)을 선택하고 ‘위조품은 관세법상 국제 반송이 금지된 품목’임을 명시하여 업로드합니다.' },
          { stepNumber: 3, title: '신용카드 차지백(Chargeback) 청구', desc: '플랫폼 거절 시 신용카드사에 ‘위조 상품 수령(Counterfeit)’ 사유로 120일 이내 차지백 서비스를 신청합니다.' }
        ],
        checklist: ['모조품을 재판매하거나 타인에게 양도하면 상표법 위반으로 처벌받을 수 있습니다.', '배송 라벨의 발송지 주소와 EMS 번호를 선명하게 보존하세요.'],
        proTip: '위조 상품의 경우 세관에서 폐기 확인서를 발급받거나 가품 소명서만 첨부하면 카드사 차지백 승인율이 99%에 달합니다.',
        tags: ['#해외직구가품', '#짝퉁환불', '#반품없는전액환불', '#카드차지백'],
        requiredDocs: ['상품 실물 및 정품 비교 사진', '주문 인보이스', '카드 결제 영수증'],
        parentCategory: 'shopping'
      },
      {
        category: 'leisure',
        categoryLabel: '여가/티켓',
        iconName: 'Plane',
        subCategory: '항공/여행',
        rankBadge: '여행객 필독',
        title: '국제선 항공권 영문 이름 철자(Spelling) 오기재 시 무료/소액 정정 및 탑승 거부 방지',
        questionScenario: '여권상 영문 성명이 HONG GILDONG인데 항공권 예약 시 철자 하나를 잘못 입력(HONG GILDUNG)했습니다. 항공사에서 취소 후 수수료 수십만 원을 내고 재구매해야 한다고 하는데 정정할 방법이 없나요?',
        summary: '탑승객 본인 동일성이 인정되는 경미한 철자 1~2자 오기, 성(Last Name)과 이름(First Name) 역전 입력은 국토교통부 항공교통이용자 보호기준 및 국제항공운송협회(IATA) 권고에 따라 재발행 수수료(약 1~3만 원) 또는 무료로 이름 정정이 가능합니다.',
        steps: [
          { stepNumber: 1, title: '여권 사본 준비 및 항공사 직접 연락', desc: '여행사 대행 예약이라도 탑승 당일 혼선을 방지하기 위해 실 운항 항공사 예약과에 직접 여권 스캔본을 제시합니다.' },
          { stepNumber: 2, title: 'Name Correction Policy(성명 정정 규정) 적용 요청', desc: '탑승자 전면 변경(양도)이 아닌 단순 스펠링 오타(Typo)임을 밝히고 항공사 내부 Name Correction 절차를 밟습니다.' },
          { stepNumber: 3, title: 'E-티켓 재발행 및 확인서 수령', desc: '정정된 영문 스펠링이 반영된 새 전자항공권(E-ticket)을 출력하여 공항 체크인 카운터에 제시합니다.' }
        ],
        checklist: ['발권 후 출발 24~48시간 전까지는 반드시 수정을 완료해야 공항 탑승 거부를 피할 수 있습니다.', '탑승자 자체가 바뀌는 것은 명의 변경으로 간주되어 전면 재구매 대상입니다.'],
        proTip: '공항 현장 카운터에 일찍 방문(출발 3시간 전)하여 여권 원본을 제시하면 카운터 슈퍼바이저 재량으로 현장 보정 승인 스탬프를 찍어주는 경우가 많습니다.',
        tags: ['#항공권영문철자', '#이름오타수정', '#여권철자정정', '#비행기탑승거부방지'],
        requiredDocs: ['여권 사본', '전자항공권(E-Ticket) 수취증'],
        parentCategory: 'travel'
      },
      {
        category: 'other',
        categoryLabel: '기타/B2B',
        iconName: 'Building2',
        subCategory: '계약/용역',
        rankBadge: '프리랜서/외주 보호',
        title: '프리랜서 외주 개발·디자인 용역 잔금 미지급 및 무제한 무상 수정 요구 차단법',
        questionScenario: '클라이언트가 계약서에 명시된 1차 시안 승인 후 잔금을 지급하지 않고, 계약 범위를 넘어선 추가 기능 개발과 수정을 무상으로 해줄 때까지 잔금을 못 준다고 합니다. 어떻게 대응해야 하나요?',
        summary: '하도급거래 공정화에 관한 법률 및 소프트웨어 표준계약서 규정에 따라, 검수 요청 후 10일 이내에 서면으로 구체적 하자를 지적하지 않으면 법적으로 검수 합격으로 간주되어 즉시 잔금 지급 의무가 발생합니다. 추가 수정은 별도 과업 변경 계약 대상입니다.',
        steps: [
          { stepNumber: 1, title: '과업 완료 증빙 및 검수 완료 간주 통보', desc: '최초 계약서 상의 요구사항 정의서와 납품 완료 확인서, 메일 전송 기록을 모아 서면 최고장을 발송합니다.' },
          { stepNumber: 2, title: '추가 과업에 대한 별도 견적서 송부', desc: '클라이언트의 추가 요구사항을 별도 과업(Scope Creep)으로 분류하고 추가 비용 청구 견적서를 공식 서면 회신합니다.' },
          { stepNumber: 3, title: '대한상사중재원 또는 법무부 지급명령 신청', desc: '잔금 미지급 시 계약서와 이메일 승인 내역을 근거로 법원에 전자 지급명령(비용 3~5만 원)을 신청하여 통장 압류를 집행합니다.' }
        ],
        checklist: ['수정 요청과 피드백은 구두 통화 대신 반드시 메일이나 슬랙 등 텍스트 기록으로 남기세요.', '최초 계약 시 무료 수정 횟수(예: 2회)와 검수 기한(10일)을 명시해야 안전합니다.'],
        proTip: '‘하도급법상 납품 후 10일 무응답 시 검수완료 간주 규정에 따라 잔금 청구 절차에 착수합니다’라는 문구를 담은 공문 하나만으로도 대부분의 미지급 잔금이 3일 내 결제됩니다.',
        tags: ['#외주용역비미지급', '#프리랜서잔금', '#검수합격간주', '#무제한수정방지'],
        requiredDocs: ['용역도급계약서', '과업 납품 이메일', '최초 과업명세서'],
        parentCategory: 'other'
      },
      {
        category: 'legal',
        categoryLabel: '법률/생활',
        iconName: 'CreditCard',
        subCategory: '소비자 분쟁',
        rankBadge: '추천 가이드',
        title: '신용카드 할부 결제 후 가맹점 폐업 시 남은 할부금 청구 거절(항변권 행사)',
        questionScenario: '피트니스 센터 1년 회원권을 120만 원 12개월 할부로 결제했는데 3개월 만에 폐업하고 잠적했습니다. 카드사에서는 남은 9개월 치 할부금을 계속 납부하라고 합니다.',
        summary: '할부거래에 관한 법률 제16조에 따라 20만 원 이상, 3개월 이상 할부 결제 건은 가맹점의 폐업이나 채무불이행 시 카드사에 즉시 [할부항변권]을 서면 행사하여 잔여 할부금 지급을 합법적으로 거절할 수 있습니다.',
        steps: [
          { stepNumber: 1, title: '가맹점 폐업 증명 확보', desc: '국세청 홈택스 사업자등록상태 조회 화면 또는 폐업 안내문 사진을 캡처합니다.' },
          { stepNumber: 2, title: '카드사에 할부항변권 서면/내용증명 통지', desc: '카드사 고객센터 및 우편으로 할부거래법 제16조에 따른 할부항변권 접수증을 제출합니다.' },
          { stepNumber: 3, title: '잔여 할부금 청구 중단 확인', desc: '접수일 이후 도래하는 할부금 청구가 전액 중단되었는지 명세서로 최종 확인합니다.' }
        ],
        checklist: ['일시불 결제나 체크카드 결제는 할부항변권 적용 대상이 아닙니다.', '피트니스나 고액 학원비는 반드시 3개월 이상 신용카드 할부로 결제하세요.'],
        proTip: '카드사 홈페이지 또는 앱의 [소비자 보호 - 할부항변권 신청] 메뉴를 통하면 내용증명 발송 없이도 온라인으로 1분 만에 접수 가능합니다.',
        tags: ['#할부항변권', '#헬스장폐업', '#할부금지급거절', '#할부거래법'],
        requiredDocs: ['카드 영수증', '홈택스 폐업사실조회서', '계약서'],
        parentCategory: 'other'
      }
    ];

    // Deduplicate themes against existing database titles to prevent any potential duplicated entries
    const availableThemes = fallbackThemes.filter(theme => 
      !existingTitles.some((existingTitle: string) => 
        existingTitle.trim().toLowerCase() === theme.title.trim().toLowerCase()
      )
    );

    // If all are already registered, return fallbackThemes as is to ensure we return something
    const themesToUse = availableThemes.length > 0 ? availableThemes : fallbackThemes;

    // Shuffle & pick unique ones
    const shuffled = [...themesToUse].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, targetCount);

    return selected.map((item, idx) => ({
      id: `hub_ai_${timestamp}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      category: item.category,
      categoryLabel: item.categoryLabel,
      iconName: item.iconName,
      subCategory: item.subCategory,
      rankBadge: item.rankBadge,
      resolutionRate: Number((98.0 + Math.random() * 1.8).toFixed(1)),
      avgResolutionTime: '즉시 가이드 (3분)',
      title: item.title,
      questionScenario: item.questionScenario,
      officialAnswer: {
        summary: item.summary,
        steps: item.steps,
        checklist: item.checklist,
        proTip: item.proTip
      },
      tags: item.tags,
      requiredDocs: item.requiredDocs,
      directInquiryPrefill: {
        parentCategory: item.parentCategory,
        subCategory: 'general',
        title: `[${item.subCategory}] ${item.title.slice(0, 30)}...`,
        contentTemplate: `1. 사실관계 및 상황 요약:\n2. 요청 사항:\n3. 첨부 서류 내역:`
      },
      status: 'published',
      isAIGenerated: true,
      viewCount: Math.floor(Math.random() * 80) + 15,
      helpfulCount: Math.floor(Math.random() * 40) + 8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  };

  try {
    const ai = getGenAI();
    if (!ai) {
      const fallbackItems = generateFallbacks();
      return res.json({
        success: true,
        source: "fallback",
        count: fallbackItems.length,
        items: fallbackItems
      });
    }

    const categoryNamesMap: Record<string, string> = {
      shopping: '쇼핑/배송/결제 분쟁',
      leisure: '여가/티켓/여행/항공 취소 분쟁',
      dining: '외식/다이닝/예약/노쇼 분쟁',
      general: '일반/계정/개인정보/보안 분쟁',
      legal: '법률/생활/임대차/노동/소비자 권익 분쟁',
      other: '기타/B2B/업무제휴/하도급/지식재산권 분쟁',
      all: '전 분야 균등 분쟁 및 CS 솔루션'
    };

    const categoryFocus = categoryNamesMap[category] || category;

    const prompt = `당신은 대한민국 최고의 소비자보호, 전자상거래법, 민법, 노동법 및 B2B 제휴 분쟁 조정 전문 수석 변호사이자 CS 총괄 디렉터입니다.
사용자들이 가장 빈번하게 겪지만 법령이나 약관을 몰라 억울하게 손해를 보는 **핵심 분쟁/질문 시나리오 ${targetCount}개**를 엄선하여 완벽한 실천 솔루션을 생성해주세요.

[중요 제약 조건: 엄격한 중복 방지 (Deduplication)]
아래 목록은 이미 데이터베이스에 등록된 질문들입니다. 아래 주제들과 **절대로 겹치거나 유사한 질문을 생성하지 마십시오**.
--- 이미 등록된 질문 목록 (중복 절대 금지) ---
${existingListSample || '(기존 등록 목록 없음)'}
---------------------------------------------
${customTopicPrompt ? `[관리자 특별 요청 주제 키워드]: "${customTopicPrompt}" - 이 키워드와 관련된 실무 분쟁을 반드시 포함하여 해결책을 구성하세요.` : ''}

[분야]: ${categoryFocus}
[생성 수량]: 정확히 ${targetCount}개

각 솔루션은 공허한 뻔한 말이 아니라, 실제 법령 조항(예: 전자상거래법 제17조, 민법 제5조, 하도급법, 방문판매법, 공동주택관리법 등)과 공정위 표준약관을 근거로 구체적 행동 지침(Step 1, 2, 3)을 제시해야 합니다.

반드시 아래 JSON 배열 포맷으로만 응답해주세요 (Markdown 코드블록 없이 순수 JSON):
[
  {
    "category": "${category === 'all' ? 'legal' : category}",
    "categoryLabel": "카테고리 표시명 (예: 법률/생활, 쇼핑/배송, 외식/예약 등)",
    "iconName": "Scale",
    "subCategory": "세부 분류 (예: 임대차, 계약해지, 부당위약금, 직구환불 등)",
    "rankBadge": "추천 뱃지 (예: 법률 필수 가이드, 소비자 긴급 구제 등)",
    "resolutionRate": 99.1,
    "avgResolutionTime": "즉시 해결 (3분)",
    "title": "명확하고 구체적인 문제 상황 제목 (20~45자 내외)",
    "questionScenario": "소비자가 실제로 겪는 억울하거나 혼란스러운 현실적 분쟁 시나리오 (액수, 일수, 구체적 상황 명시)",
    "officialAnswer": {
      "summary": "법령 및 표준약관에 근거한 명쾌하고 단호한 해결 결론 요약 (1~2문장)",
      "steps": [
        {
          "stepNumber": 1,
          "title": "1단계 조치명",
          "desc": "구체적인 행동 요령 및 증거 확보 방법"
        },
        {
          "stepNumber": 2,
          "title": "2단계 조치명",
          "desc": "공식 기관 신고, 내용증명, 카드사 차지백 등 공식 대처"
        },
        {
          "stepNumber": 3,
          "title": "3단계 조치명",
          "desc": "최종 환불/보상 또는 피해 구제 확정 절차"
        }
      ],
      "checklist": [
        "주의해야 할 금지 행위나 함정",
        "보존해야 할 핵심 증빙 자료"
      ],
      "proTip": "전문가만의 실전 꿀팁이나 상대방을 즉시 설득시키는 법적 한 줄 표현"
    },
    "tags": ["#태그1", "#태그2", "#태그3"],
    "requiredDocs": ["서류1", "서류2"],
    "directInquiryPrefill": {
      "parentCategory": "shopping",
      "subCategory": "general",
      "title": "[분쟁 유형] 문의 제목",
      "contentTemplate": "1. 피해 일시:\\n2. 상대방 정보:\\n3. 피해 금액 및 내용:"
    }
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text?.trim() || "";
    let rawItems: any[] = [];

    try {
      rawItems = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      rawItems = JSON.parse(cleaned);
    }

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new Error("AI returned invalid array format");
    }

    const formattedItems = rawItems.slice(0, targetCount).map((item, idx) => ({
      id: `hub_ai_${timestamp}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
      category: ['shopping', 'leisure', 'dining', 'general', 'legal', 'other'].includes(item.category) ? item.category : 'legal',
      categoryLabel: item.categoryLabel || '전문 지식',
      iconName: item.iconName || 'Scale',
      subCategory: item.subCategory || '생활/소비자',
      rankBadge: item.rankBadge || 'AI 신규 추천',
      resolutionRate: Number(item.resolutionRate) || 98.5,
      avgResolutionTime: item.avgResolutionTime || '즉시 해결 (3분)',
      title: item.title,
      questionScenario: item.questionScenario,
      officialAnswer: {
        summary: item.officialAnswer?.summary || '',
        steps: Array.isArray(item.officialAnswer?.steps) ? item.officialAnswer.steps : [],
        checklist: Array.isArray(item.officialAnswer?.checklist) ? item.officialAnswer.checklist : [],
        proTip: item.officialAnswer?.proTip || ''
      },
      tags: Array.isArray(item.tags) ? item.tags : ['#CS솔루션'],
      requiredDocs: Array.isArray(item.requiredDocs) ? item.requiredDocs : [],
      directInquiryPrefill: item.directInquiryPrefill || {
        parentCategory: 'other',
        subCategory: 'general',
        title: `[문의] ${item.title?.slice(0, 30)}`,
        contentTemplate: '상세 정황을 기재해 주세요.'
      },
      status: 'published',
      isAIGenerated: true,
      viewCount: Math.floor(Math.random() * 60) + 10,
      helpfulCount: Math.floor(Math.random() * 30) + 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    return res.json({
      success: true,
      source: "gemini",
      count: formattedItems.length,
      items: formattedItems
    });

  } catch (error: any) {
    console.error("Hub AI Generation Error, fallback_recovery triggered:", error);
    const fallbackItems = generateFallbacks();
    return res.json({
      success: true,
      source: "fallback_recovery",
      count: fallbackItems.length,
      items: fallbackItems
    });
  }
});

// Endpoint to enrich/autofill sparse CSV row using AI
app.post("/api/hub/expand-item", async (req, res) => {
  try {
    const { category, title, questionScenario } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Return a basic mock/fallback if API Key is not configured
      return res.json({
        summary: "관계 법령에 근거하여 신속하고 원만한 합의가 가능하며 피해구제 절차를 적극 권장합니다.",
        steps: [
          { stepNumber: 1, title: "하자 및 증거 자료 수집", desc: "분쟁 발생 일시가 적힌 대화 내용 및 결제 증명서를 영구 보존 처리합니다." },
          { stepNumber: 2, title: "공식 이의제기 및 공정위 표준 약관 송부", desc: "관련 법률 위반을 고지하며 합리적 배상을 강력 최고 조치합니다." },
          { stepNumber: 3, title: "소비자구제 신청 종결", desc: "한국소비자원이나 적격 조정위원회를 통해 최종 합의 조정 절차를 마무리합니다." }
        ],
        checklist: ["상대방과의 구두 약속은 무효이므로 반드시 서면이나 텍스트 증거를 남겨둘 것", "카드 결제 건인 경우 철회권 및 항변권 청구 여부를 조속히 조회할 것"],
        proTip: "법 조항을 언급하며 정중하고 명확한 서면을 보내면 합의율이 90% 이상 대폭 향상됩니다.",
        tags: ["#소비자권익", "#분쟁해결", "#정식솔루션"],
        requiredDocs: ["계약서 및 영수증", "상대방과의 대화 캡처"]
      });
    }

    const prompt = `당신은 소비자 권익보호 및 공정거래 표준 약관 분석 최고의 법률 전문가입니다.
다음 단 하나의 제목 및 시나리오(설명)를 분석하여 완벽한 '공식 3단계 솔루션 및 부가 가이드'를 JSON 형식으로 작성해 주십시오.

입력 내용:
- 카테고리: \${category || "legal"}
- 제목: \${title}
- 시나리오: \${questionScenario || "해당 사항 없음"}

반환은 반드시 아래 예시 양식과 완전히 동일한 싱글 JSON 객체여야 합니다. (어떠한 마크다운 백틱 문장도 붙이지 말고 순수한 JSON 텍스트로만 출력하세요)
{
  "summary": "법령과 표준약관에 근거하여 명쾌하게 한줄로 요약한 해결 방법 (1~2문장 이내)",
  "steps": [
    {
      "stepNumber": 1,
      "title": "1단계 조치명",
      "desc": "구체적인 증거 확보 및 행동 지침 설명"
    },
    {
      "stepNumber": 2,
      "title": "2단계 조치명",
      "desc": "공식 최고, 서면 고지, 소관 부서 접수 요령"
    },
    {
      "stepNumber": 3,
      "title": "3단계 조치명",
      "desc": "최종 합의 및 구제 처리 종결 단계"
    }
  ],
  "checklist": [
    "주의해야 할 함정이나 핵심 행동 지침 1",
    "준비해야 할 행동 지침 2"
  ],
  "proTip": "실전 전문가 꿀팁이나 협상력을 극대화하는 법적 소명용 핵심 한 줄 문구",
  "tags": ["태그1", "태그2"],
  "requiredDocs": ["필요서류1", "필요서류2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text?.trim() || "";
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/^```json\\s*/i, '').replace(/\\s*```\$/i, '');
      data = JSON.parse(cleaned);
    }

    res.json(data);
  } catch (err: any) {
    console.error("Expand item error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to enrich/autofill sparse CSV notices row using AI
app.post("/api/notices/expand-item", async (req, res) => {
  try {
    const { category, title, summary } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Return a basic fallback if API Key is not configured
      return res.json({
        summary: summary || "기관 고시에 근거하여 권익을 보장하고 불이행 시 단호한 법적 구제 절차를 권고합니다.",
        keyPoints: [
          "기관 공식 고시 기준 위반 사실 주의",
          "피해 발생 즉시 7일 이내 공식 대화록 및 영수증 증거 확보",
          "공정거래위원회 고시에 따른 신속한 취소 및 보상 요구"
        ],
        actionGuide: [
          "1단계: 제공업체 또는 쇼핑몰에 약관 위배 사실 고지 및 서면 청구",
          "2단계: 결제 카드사(PG사) 이의신청 및 입금 대금 반환 보류 청구",
          "3단계: 소관 피해구제 전담팀 및 한국소비자원 공식 접수 종결"
        ],
        lawBasis: "전자상거래법 및 소비자기본법",
        contactNumber: "1372"
      });
    }

    const prompt = `당신은 대한민국 공정거래위원회, 한국소비자원 소관 소비자 권익 보호 분야 최고 권위자입니다.
다음 단 하나의 제목 및 요약을 분석하여, 전국민이 꼭 숙지해야 할 피해주의보 '핵심 항목(Key Points) 3개'와 '행동 수칙(Action Guide) 3단계'를 JSON 형식으로 완성해 주십시오.

입력 내용:
- 카테고리: \${category || "urgent"}
- 제목: \${title}
- 요약: \${summary || "해당 사항 없음"}

반환은 반드시 아래 예시 양식과 완전히 동일한 싱글 JSON 객체여야 합니다. (어떠한 마크다운 백틱 문장도 붙이지 말고 순수한 JSON 텍스트로만 출력하세요)
{
  "summary": "법령과 지침에 기반한 명쾌하고 정교한 전국민 가이드 요약 (1~2문장)",
  "keyPoints": [
    "핵심 주의 또는 확인 사항 1 (20~40자 내외)",
    "핵심 주의 또는 확인 사항 2 (20~40자 내외)",
    "핵심 주의 또는 확인 사항 3 (20~40자 내외)"
  ],
  "actionGuide": [
    "1단계: 구체적인 증거 확보 및 대외 통지 지침",
    "2단계: 공식 중재 요청 및 서면 이의제기 방법",
    "3단계: 최종 소비자 구제 접수 및 종결 절차"
  ],
  "lawBasis": "관련 핵심 법령 조항 (예: 전자상거래법 제17조, 약관법)",
  "contactNumber": "권장 해결 및 제보 연락처 (예: 1372)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text?.trim() || "";
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      data = JSON.parse(cleaned);
    }

    res.json(data);
  } catch (err: any) {
    console.error("Expand notice error:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI Partner Brands Generation Endpoint
app.post("/api/partners/generate", async (req, res) => {
  const { category = 'restaurant', count = 1, customTopicPrompt = '' } = req.body;
  const targetCount = Math.min(Math.max(Number(count) || 1, 1), 5);

  const generatePartnerFallbacks = () => {
    const timestamp = Date.now();
    const fallbacks = [
        {
          id: `p_fb_${timestamp}_1`,
          name: "배달의민족 (우아한형제들)",
          logoEmoji: "🛵",
          intro: "대한민국 1등 배달 플랫폼, 신속하고 책임감 있는 중개 정산 및 위생 CS 연동망을 제공합니다.",
          phone: "1600-0987",
          chatUrl: "https://baemin.example.com/chat",
          avgResponse: "평균 10분 내 해결",
          color: "emerald",
          popularInquiry: "배달 지연 및 오배송 전액 환불 요청",
          category: "restaurant"
        },
        {
          id: `p_fb_${timestamp}_2`,
          name: "쿠팡이츠",
          logoEmoji: "🚀",
          intro: "한 번에 한 집 빠른 배달, 배달 오배송 및 위생 이물질 즉시 이의제기 관문을 제공합니다.",
          phone: "1577-7011",
          chatUrl: "https://coupangeats.example.com/chat",
          avgResponse: "평균 15분 내 답변 완료",
          color: "sky",
          popularInquiry: "배달 음식 이물질 환불 및 치료비 실손 청구",
          category: "restaurant"
        },
        {
          id: `p_fb_${timestamp}_3`,
          name: "쿠팡 (Coupang)",
          logoEmoji: "📦",
          intro: "로켓배송 파손 및 단순 변심 반품 처리를 1초 만에 승인 및 자동 수거 처리하는 파트너입니다.",
          phone: "1577-7011",
          chatUrl: "https://coupang.example.com/chat",
          avgResponse: "평균 5분 내 승인",
          color: "red",
          popularInquiry: "로켓배송 상품 파손 및 30일 내 반품 신청",
          category: "shopping"
        },
        {
          id: `p_fb_${timestamp}_4`,
          name: "무신사 (MUSINSA)",
          logoEmoji: "👟",
          intro: "국내 최대 패션 전문 몰, 가품 판정 시 200% 보상 및 무료 반품 안심 심사 솔루션을 제공합니다.",
          phone: "1544-7199",
          chatUrl: "https://musinsa.example.com/chat",
          avgResponse: "평균 30분 내 답변 완료",
          color: "slate",
          popularInquiry: "디자이너 브랜드 가품 의심 정밀 판정 의뢰",
          category: "shopping"
        },
        {
          id: `p_fb_${timestamp}_5`,
          name: "야놀자 (Yanolja)",
          logoEmoji: "🏨",
          intro: "국내 1위 여가 플랫폼, 안심 예약 보장 및 투숙 불가 상황 시 대체 객실/배상 연동망을 제공합니다.",
          phone: "1644-1346",
          chatUrl: "https://yanolja.example.com/chat",
          avgResponse: "평균 20분 내 해결",
          color: "pink",
          popularInquiry: "당일 오버부킹에 의한 숙소 취소 및 대체 객실 제공 요구",
          category: "travel"
        }
      ];
      const filtered = fallbacks.filter(f => f.category === category);
      return (filtered.length > 0 ? filtered : fallbacks).slice(0, targetCount);
    };

    try {
      const ai = getGenAI();

      if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        items: generatePartnerFallbacks()
      });
    }

    const prompt = `당신은 대기업 B2B 제휴 제안 전문 어드바이저입니다.
대한민국의 실제 존재하거나 유명한 프랜차이즈, 배달 브랜드, 이커머스 쇼핑몰, 패션 편집몰, 숙박/여가 예약 플랫폼 중 하나를 선정하여 "모두의문의" 안심 제휴처 CS 직통 정보로 등록하기 위한 JSON 데이터를 생성해주세요.

[입력 요청 요건]:
- 타겟 카테고리: ${category} (restaurant: 외식/요식업, shopping: 쇼핑/결제, travel: 여가/예약/항공, other: 기타)
- 수량: ${targetCount}개
${customTopicPrompt ? `- 중요 타켓 브랜드 키워드: "${customTopicPrompt}" (주의: 이 키워드가 제공된 경우 다른 추천 예시 브랜드를 만들면 절대로 안 되며, 반드시 이 키워드인 "${customTopicPrompt}" 자체의 실재하는 브랜드를 가장 첫 번째 타겟으로 무조건 생성해야 합니다. 예를 들어 "무신사"가 오면 반드시 '무신사'의 실제 정보를 가공해 만드셔야 합니다.)` : ''}

[중요 제약사항]:
- 응답 스키마의 안내용 예시(예: 스타벅스 코리아)를 그대로 출력하는 바보 같은 실수를 하지 마십시오.
- 무조건 ${customTopicPrompt ? `"${customTopicPrompt}" 브랜드 자체 또는 관련 브랜드` : `${category} 카테고리에 적합한 실제 유명 국내 브랜드`}의 유용한 실존 고객센터 전화번호 및 상세 CS 정책에 어울리게 세부 정보를 완성하여 반환하십시오.

반드시 아래 JSON 배열 포맷으로만 응답해주세요 (Markdown 코드블록 없이 순수 JSON):
[
  {
    "id": "partner_brand_고유문자",
    "name": "실제 브랜드명 공식 명칭",
    "logoEmoji": "브랜드와 어울리는 대표 이모지",
    "intro": "모두의문의와 협업하여 즉각 해결을 약속하는 가상의 CS 제휴 소개글 (1-2문장)",
    "phone": "본사 공식 CS 콜센터 실제 번호",
    "chatUrl": "실시간 상담 링크 또는 모두의문의 전용 가상 챗봇 상담 경로 URL",
    "avgResponse": "평균 CS 피드백 해결 속도 설명",
    "color": "브랜드 색상과 어울리는 1개 키워드 (emerald, red, green, amber, indigo, slate, pink, teal, violet, sky 중 택일)",
    "popularInquiry": "해당 브랜드에서 소비자들이 자주 겪는 핵심 민원 카테고리 (예: 가품 판정 무료반품 심사, 주문 배달 오배송 환불 등)",
    "category": "${category}"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text?.trim() || "";
    let rawItems: any[] = [];
    try {
      rawItems = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      rawItems = JSON.parse(cleaned);
    }

    if (!Array.isArray(rawItems)) {
      throw new Error("Invalid response array from AI");
    }

    const timestamp = Date.now();
    const formatted = rawItems.map((item, idx) => ({
      id: item.id || `partner_gen_${timestamp}_${idx}`,
      name: item.name || "안심 제휴 브랜드",
      logoEmoji: item.logoEmoji || "🏢",
      intro: item.intro || "모두의문의 공식 안심 해결 제휴사입니다.",
      phone: item.phone || "1577-0000",
      chatUrl: item.chatUrl || "https://example.com/chat",
      avgResponse: item.avgResponse || "평균 15분 내 완료",
      color: item.color || "indigo",
      popularInquiry: item.popularInquiry || "오배송 및 반품 환불 접수",
      category: item.category || category,
      createdAt: new Date().toISOString()
    }));

    return res.json({
      success: true,
      source: "gemini",
      items: formatted
    });

  } catch (error: any) {
    console.error("Generate partner error:", error);
    return res.json({
      success: true,
      source: "fallback",
      error: error?.message,
      items: generatePartnerFallbacks()
    });
  }
});

// AI Consumer Insights Generation Endpoint
app.post("/api/insights/generate", async (req, res) => {
  const { count = 1, customTopicPrompt = '' } = req.body;
  const targetCount = Math.min(Math.max(Number(count) || 1, 1), 5);

  const generateInsightFallbacks = () => {
    const timestamp = Date.now();
    const fallbacks = [
      {
        id: `ins_gen_${timestamp}_1`,
        title: "장기 필라테스/헬스장 회원권 환불 시 과다 위약금 꼼수 차단",
        emoji: "🧘",
        summary: "방문판매법에 근거, 중도 해지 수수료는 총 계약금액의 10% 이내여야 하며 사업자가 무리하게 산정한 '정가 적용 이용 일수'는 법적 무효입니다.",
        lawBasis: "방문판매법 제31조",
        fullTip: "헬스장이나 필라테스 계약서에 '양도 불가, 중도 해지 불가'라고 자필 서명했더라도, 방문판매법은 강행법규이므로 소비자의 해지 권리가 항시 우선합니다.\n\n1. 공식 위약금 기준 제시: 법적 계약 해지 통보서(문자, 메일, 내용증명)를 매장에 발송하여 일자 기준을 정립하세요.\n2. 위약금 공제액 산출: 총 지불액 기준으로 실제 이용 횟수만큼을 정상가 대신 계약 단가로 비례 공제하거나 법적 한도를 넘지 않도록 조정 요구하세요.\n3. 분쟁 조정 신청: 불응 시 1372 소비자포털 또는 한국소비자원 피해구제 접수를 거치면 99% 정상 반환 판결을 받을 수 있습니다.",
        badge: "부당 위약금 대응"
      },
      {
        id: `ins_gen_${timestamp}_2`,
        title: "유튜브 프리미엄 / OTT 중도 해지 시 잔여 일수 전액 일할 환불법",
        emoji: "📱",
        summary: "콘텐츠이용보호지침 및 공정위 고지에 따라, 사용하지 않은 일수에 대한 중도 해지 시 일할 계산 환불을 전면 요구할 권리가 보장됩니다.",
        lawBasis: "전자상거래법 및 콘텐츠이용보호법",
        fullTip: "일부 해외 플랫폼은 중도 해지 시 다음 결제일까지 서비스가 유지될 뿐 중도 환불이 불가능하다고 약관을 속이는 경우가 있습니다.\n\n1. 당월 환불 옵션 선택: 일반 '해지' 대신 '즉시 환불 해지'를 요구하고, 채팅 상담으로 불응 시 법령 위반임을 명시하세요.\n2. 무사용 확인서 첨부: 지난 결제일 이후 전혀 영상을 보지 않았다면 100% 미사용 전액 환불, 이용 이력이 있다면 잔여일 비례 환불이 당연 보장됩니다.\n3. 카드사 해외 민원 이의제기: 플랫폼이 시스템상 거절 시 카드사 해외 이의제기 서비스(차지백)를 신청해 강제 환불을 완료하세요.",
        badge: "OTT 정산 룰"
      }
    ];
    return fallbacks.slice(0, targetCount);
  };

  try {
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        source: "fallback",
        items: generateInsightFallbacks()
      });
    }

    const prompt = `당신은 대한민국 최고의 소비자 권익 보호 및 법률 상식 전문 컨설턴트입니다.
소비자가 실생활(배달음식, 공동구매, 헬스장, 미용실, 항공권, 중고거래 등)에서 무조건 손해를 보지 않기 위해 필수적으로 상식화되어야 할 **최신 AI 트렌드 소비자 법률 상식** 데이터를 생성해주세요.

[생성 수량]: 정확히 ${targetCount}개
${customTopicPrompt ? `[특별 초점 주제]: "${customTopicPrompt}" - 이 주제를 최우선으로 깊이 다룬 법률 상식으로 작성해주세요.` : ''}

반드시 아래 JSON 배열 포맷으로만 응답해주세요 (Markdown 코드블록 없이 순수 JSON):
[
  {
    "id": "insight_고유문자",
    "title": "눈길을 사로잡고 유익한 상식 제목",
    "emoji": "해당 주제를 암시하는 직관적 이모지",
    "summary": "법조항을 포함하여 명쾌하게 요약한 1-2문장 소비자 보호 결론",
    "lawBasis": "근거가 되는 실제 대한민국 법률 명칭",
    "fullTip": "소비자가 실제로 취해야 할 3단계 요령을 포함한 상세 줄글 가이드라인",
    "badge": "상황 카테고리 뱃지 (위약금 보호, 신속 구제, 전자상거래, 식품 위생 등)"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response.text?.trim() || "";
    let rawItems: any[] = [];
    try {
      rawItems = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      rawItems = JSON.parse(cleaned);
    }

    if (!Array.isArray(rawItems)) {
      throw new Error("Invalid response array from AI");
    }

    const timestamp = Date.now();
    const formatted = rawItems.map((item, idx) => ({
      id: item.id || `insight_gen_${timestamp}_${idx}`,
      title: item.title || "유용한 소비자 상식",
      emoji: item.emoji || "💡",
      summary: item.summary || "대한민국 소비자 보호 법령이 보호하는 정당한 소비자 권익 수칙입니다.",
      lawBasis: item.lawBasis || "소비자기본법 제16조",
      fullTip: item.fullTip || "1단계: 증거 수집\n2단계: 공식 중개소 조율 신청\n3단계: 지자체 위생과 또는 소비자원 구제 접수",
      badge: item.badge || "소비자 안심",
      createdAt: new Date().toISOString()
    }));

    return res.json({
      success: true,
      source: "gemini",
      items: formatted
    });

  } catch (error: any) {
    console.error("Generate insight error:", error);
    return res.json({
      success: true,
      source: "fallback",
      error: error?.message,
      items: generateInsightFallbacks()
    });
  }
});

// "Modu Assistant" (모두의비서) Real-Time AI Chat Agent Endpoint
app.post("/api/assistant/chat", async (req, res) => {
  try {
    const { messages, context, userProfile, isContinuousVoiceMode } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const currentInquiries = context?.inquiries || [];
    const currentNotices = context?.notices || [];
    const currentPartners = context?.partners || [];
    const currentInsights = context?.insights || [];

    let promptExtension = "";
    if (isContinuousVoiceMode) {
      promptExtension = `
---
**[특별 중요 행동 지침: 2인조 대화형 AI 팟캐스트 (Podcast Script) 동시 생성]**
사용자가 현재 모바일 '양방향 실시간 보이스' 대화 모드를 활성화한 상태입니다. 
따라서 답변 내용 맨 마지막에 **답변 핵심 정보를 아주 재치 있고 명쾌하게 15초 내외로 요약한 남녀 2인조 대화형 AI 팟캐스트 대본**을 반드시 다음 특수 태그 포맷으로 생성해서 채워주세요.
이 대본은 남성 호스트 '민우'와 여성 호스트 '지원' 두 사람이 실생활 대화를 하듯이 아주 가볍고, 위트 있고, 친근하게 만담을 하듯이 대화해야 합니다.

포맷 규칙 (반드시 JSON 배열 형식이어야 하며 마크다운 코드블럭 없이 순수 JSON이어야 합니다):
[PODCAST_TRIGGER_START]
[
  {"speaker": "민우", "text": "와, 성배님 배달 상한 건 진짜 화나셨겠어요!"},
  {"speaker": "지원", "text": "맞아요! 식품위생법에 따라 100% 환불받을 권리가 있으니, 망설이지 말고 아래 1:1 접수 버튼을 터치해 보세요!"}
]
[PODCAST_TRIGGER_END]

대본은 총 2~3개의 대사 이내로 구성하여 전체 낭독 시간이 15초를 절대 넘기지 않도록 극도로 명쾌하고 짧게 요약해 주십시오. 다른 설명 문구나 일반 텍스트와 섞이지 않도록 대화체 대사 JSON만 깔끔히 들어있어야 합니다.`;
    }

    const systemInstruction = `당신은 소비자와 제휴처를 연결하는 소비자 권익구제 및 분쟁조정 플랫폼 '모두의문의'의 공식 AI 지능형 에이전트인 **"모두의비서"**입니다.
당신은 매우 지혜롭고, 정중하며, 해결책 중심적인 친절한 비서입니다.

당신은 플랫폼의 실시간 데이터베이스 정보를 아래와 같이 완벽하게 알고 있습니다:

1. [최신 국민 알림 및 공고지 (Alert Notices)]
${JSON.stringify(currentNotices.map((n: any) => ({
  id: n.id,
  title: n.title,
  category: n.categoryLabel,
  summary: n.summary,
  institution: n.institution,
  contact: n.contactNumber,
  keyPoints: n.keyPoints,
  actionGuide: n.actionGuide
})), null, 2)}

2. [안심 제휴 브랜드망 및 핫라인 (Partner Brands)]
${JSON.stringify(currentPartners.map((p: any) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  intro: p.intro,
  phone: p.phone,
  avgResponse: p.avgResponse,
  popularInquiry: p.popularInquiry
})), null, 2)}

3. [최신 소비자 법률 상식 및 가이드 (Legal Insights)]
${JSON.stringify(currentInsights.map((i: any) => ({
  id: i.id,
  title: i.title,
  lawBasis: i.lawBasis,
  summary: i.summary,
  fullTip: i.fullTip
})), null, 2)}

4. [현재 로그인 사용자의 문의 내역 및 상태 (User Inquiries)]
- 로그인 사용자 이메일: ${userProfile?.email || '비로그인 사용자'}
- 문의 리스트:
${JSON.stringify(currentInquiries.map((inq: any) => ({
  id: inq.id,
  title: inq.title,
  category: inq.parentCategory,
  status: inq.status,
  createdAt: inq.createdAt,
  reply: inq.reply ? { content: inq.reply.content, creator: inq.reply.repliedByName } : "답변 없음"
})), null, 2)}

---

**[중요 행동 지침 및 절대 금지 사항]**
1. **정확한 정보 그라운딩:** 질문이 플랫폼 내 정보(제휴사 연락처, 국민 주의보, 법률 상식, 사용자의 문의 현황 등)에 관련되어 있다면, 위 제공된 실시간 정보 데이터를 분석하여 구체적이고 일목요연하게 안내해 주세요.
2. **트리거 및 JSON 절대 마크다운 적용 금지 (CRITICAL):**
   - 모든 특수 트리거 태그(\`[SOURCES_TRIGGER_START]\`, \`[AUTOFILL_TRIGGER_START]\`, \`[PARTNER_CARD_TRIGGER_START]\`, \`[PODCAST_TRIGGER_START]\` 및 그 닫는 태그들)와 그 내부의 JSON 문자열에는 **절대로** 마크다운 굵게 표시(\`**\`)나 코드 블록(\`\`\`json\`\`\`)을 입히지 마세요. 
   - 예: \`**[PARTNER_CARD_TRIGGER_START]**\` 나 \`**{ "name": ... }**\` 와 같이 별표(\`**\`)로 감싸는 행위는 **절대 금지**이며, 무조건 순수한 문자열로만 노출해야 시스템 파싱 에러가 발생하지 않습니다.
3. **근거 출처 표시 (Grounding Sources Citation):**
   - 답변 작성 시 위 플랫폼 데이터베이스(알림 공고지, 안심 제휴처, 소비자 법률 상식, 내 문의 내역) 중 실제로 참고하거나 인용한 문서가 있다면, 답변 맨 끝(트리거 태그들의 맨 마지막)에 아래와 같이 해당 문서의 컬렉션명, 문서 ID(docId), 제목(title)을 JSON 배열로 담은 특수 트리거 태그를 **반드시** 포함해 주세요. (절대 굵게 표기 금지):
     \`[SOURCES_TRIGGER_START]\`
     [
       {
         "collection": "public_alerts" | "partners" | "consumer_insights" | "inquiries",
         "collectionName": "모두의알림" | "안심제휴처" | "소비자법률상식" | "나의문의내역",
         "docId": "해당 문서의 실제 id (예: alert_1, partner_baemin 등)",
         "title": "해당 문서의 title 또는 name",
         "snippet": "참조한 핵심 법률/안내/번호 등 1줄 요약"
       }
     ]
     \`[SOURCES_TRIGGER_END]\`
   - 만약 특정 데이터가 전혀 인용되지 않은 단순한 일상 인사("안녕하세요", "반갑습니다") 등일 때에만 빈 배열 \`[]\`을 넣거나 생략해 주세요.
4. **1:1 문의 대리 접수 기능:** 
   - 만약 사용자가 피해 사례나 억울한 점을 이야기하며 문의를 넣고 싶어 하거나, 분쟁 조정을 요청하는 고충을 늘어놓는다면, 위 데이터베이스에 있는 제휴 브랜드 정보와 연결 지어 **자동 접수용 구조화된 정보**를 임태해 주세요.
   - 답변 끝부분에 아래와 같은 특수 트리거 태그를 포함시켜 주세요. (절대 굵게 표기 금지):
     \`[AUTOFILL_TRIGGER_START]\`
     { "title": "추천 문의 제목", "parentCategory": "shopping 또는 travel 또는 restaurant 또는 other", "subCategory": "추천 소분류명", "content": "대화 내용을 기반으로 상세 요약 서술한 접수 본문" }
     \`[AUTOFILL_TRIGGER_END]\`
     *단, 단순 잡담이나 이미 명쾌한 질문일 때는 이 태그를 출력하지 마세요.*
5. **가상 카드 임베딩 트리거:**
   - 답변 내에 특정 제휴사(예: 배달의민족, 야놀자, 도미노피자, BBQ 등)를 구체적으로 안내할 경우, 답변 하단에 아래와 같이 해당 파트너사 정보를 카드 포맷으로 임베딩하는 트리거 태그를 포함시킬 수 있습니다. (절대 굵게 표기 금지):
     \`[PARTNER_CARD_TRIGGER_START]\`
     { "name": "제휴사명", "phone": "전화번호", "avgResponse": "평균 응답시간", "category": "분야" }
     \`[PARTNER_CARD_TRIGGER_END]\`
6. **어조:** 전문적이고 매우 따뜻하며 신뢰를 주는 극존칭을 써주세요. 마크다운 형식을 사용하여 중요한 키워드는 **굵게** 표기하고 번호 매기기를 활용해 가독성을 높여주세요.${promptExtension}`;

    const assistantMessages = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: assistantMessages,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return res.json({
      success: true,
      reply: response.text || ""
    });

  } catch (error: any) {
    console.error("Assistant chat error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// On-Demand Premium Gemini-Powered Podcast Generation Endpoint
app.post("/api/assistant/podcast/generate", async (req, res) => {
  try {
    const { text } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    const systemInstruction = `당신은 대한민국 대표 소비자 피해 구제 및 분쟁 해결 조정을 돕는 인기 라디오 팟캐스트 **"모두의문의 보이스쇼"**의 전문 작가 및 고음질 대본 기획자입니다.
제시된 소비자의 피해 해결 가이드 텍스트를 분석하여, 남성 호스트 **'민우'**와 여성 호스트 **'지원'**이 라디오 스튜디오에서 아주 기발하고, 재치 있으며, 청중(소비자)에게 100% 공감하면서 실질적인 환불/교환/조정 팁을 속 시원하게 중계해주는 고품격 팟캐스트 방송 대본을 짜주세요.

**[작성 조건]**
1. 총 3~4개의 대사로 아주 명쾌하게 구성하며, 낭독 시 15초가 넘지 않는 함축성 있는 만담 대화체로 작성하세요.
2. 사용자의 억울함(예: 배달 음식 누락, 계약 위반 등)을 대변하여 공감해 주어야 합니다.
3. 무조건 아래 JSON 배열 포맷을 따라 리턴해야 하며, 어떠한 마크다운 백틱(\`\`\`json)이나 설명글 없이 오직 순수한 JSON만 리턴해야 합니다.

포맷 예시:
[
  {"speaker": "민우", "text": "아니, 성배님 햄버거 고기 양이 부실하다니 이거 정말 심각한 사안이네요!"},
  {"speaker": "지원", "text": "맞아요, 사진 증거 확보하시고 저희 배달 제휴망으로 바로 대리 접수하시면 100% 환불 가능성이 급상승합니다!"},
  {"speaker": "민우", "text": "역시 '모두의비서'가 곁에 있으니 든든합니다. 성배님, 주저 마시고 아래 접수하기를 탭하세요!"}
]`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: `아래 가이드 텍스트를 기반으로 2인조 고음질 팟캐스트 대본을 만들어줘:\n\n${text}` }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    let scriptText = response.text || "[]";
    if (scriptText.includes("```")) {
      scriptText = scriptText.replace(/```json|```/g, "").trim();
    }

    const parsedScript = JSON.parse(scriptText);

    return res.json({
      success: true,
      podcastScript: parsedScript
    });

  } catch (error: any) {
    console.error("Podcast generation error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// On-Demand Premium Gemini-Powered TTS Audio Synthesis Endpoint
app.post("/api/assistant/podcast/synthesize", async (req, res) => {
  try {
    const { script } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    if (!script || !Array.isArray(script)) {
      return res.status(400).json({ error: "Invalid script payload." });
    }

    // Call Gemini 2.5 Flash using the user's correct audio/mp3 responseMimeType configuration!
    const synthesisPromises = script.map(async (line: any) => {
      const isMale = line.speaker === '민우' || line.speaker === 'Host A' || line.speaker === 'A';
      const voiceName = isMale ? "Puck" : "Aoede";

      try {
        const cleanText = line.text
          .replace(/\(([^)]+)\)/g, '') // Remove parenthesis/emotions
          .trim();

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: "user", parts: [{ text: `다음 라디오 대사 한 줄을 다정하고 대화형 감정이 생생하게 드러나도록 한국어로 낭독해 주세요. 대사 속의 괄호나 특수 기호는 소리내어 읽지 마세요:\n\n"${cleanText}"` }] }],
          config: {
            responseMimeType: "audio/mp3",
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName
                }
              }
            }
          }
        });

        const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        return {
          ...line,
          audioData: audioPart?.inlineData?.data || null,
          mimeType: audioPart?.inlineData?.mimeType || "audio/mp3"
        };
      } catch (err: any) {
        console.error(`Failed to synthesize line for ${line.speaker}:`, err.message);
        return {
          ...line,
          audioData: null,
          mimeType: null,
          error: err.message
        };
      }
    });

    const enrichedScript = await Promise.all(synthesisPromises);

    return res.json({
      success: true,
      script: enrichedScript
    });

  } catch (error: any) {
    console.error("Podcast synthesis error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// On-Demand Main Assistant Message TTS Endpoint using the correct Gemini audio/mp3 configuration
app.post("/api/assistant/tts", async (req, res) => {
  try {
    const { text } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Text is required." });
    }

    // Clean up markdown/emoji markers before reading to make speech sound beautifully natural!
    const cleanSpeechText = text
      .replace(/\*\*/g, '')
      .replace(/🔮/g, '')
      .replace(/💡/g, '')
      .replace(/🎉/g, '')
      .replace(/⭐/g, '')
      .replace(/•/g, '')
      .replace(/- \*"|"\*/g, '');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: `다음 안내글을 소비자를 돕는 따뜻하고 상냥한 여성 성우 목소리로 한국어로 차분하고 조리 있게 낭독해 주세요:\n\n"${cleanSpeechText}"` }] }],
      config: {
        responseMimeType: "audio/mp3",
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Aoede" // Premium natural female voice
            }
          }
        }
      }
    });

    const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (audioPart && audioPart.inlineData) {
      return res.json({
        success: true,
        audioData: audioPart.inlineData.data,
        mimeType: audioPart.inlineData.mimeType || "audio/mp3"
      });
    } else {
      throw new Error("No audio data returned from Gemini TTS model config");
    }

  } catch (error: any) {
    console.error("Gemini TTS synthesis error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Admin Triple Alerts Bulk Generator Endpoint using Structured Gemini Output
app.post("/api/admin/generate-triple-alerts", async (req, res) => {
  try {
    const { topic } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: "Topic is required." });
    }

    const systemInstruction = `당신은 대한민국 국민을 구제하고 생활 편의 및 경제적 이익을 극대화하는 공정거래위원회, 한국소비자원, 보건복지부, 국토교통부, 행정안전부 소속의 대한민국 국가대표 수석 행정 서기관이자 지능형 알림고지 기획 마스터입니다.

제시된 주제 키워드(예: "${topic}")의 의도와 성격(긍정적 복지/혜택/환급 vs 부정적 사기/피해/리콜 vs 중립적 법률 개정)을 최우선적으로 정밀 판별한 후, 그에 어울리는 최적의 안심 공고 고지문 **3종 세트**를 단 한 번에 일괄 생성해 주세요.

**[🚨 중요: 주제 성격별 대전제 필터링 규칙]**

1. **혜택/복지/지원금/정부 환급 등 긍정적 혜택 주제인 경우 (예: "알짜 혜택", "지원금", "여행 환급", "청년 복지", "농어촌 환급" 등):**
   - **절대로 스미싱, 허위 광고, 사기 피해, 위법 행위 등의 자극적이고 위협적인 피해경고 내용으로 왜곡하여 작명하지 마세요!**
   - 진짜 국민들이 가슴 뛰고 환호할 수 있는 **유익하고 실제 가치가 높은 리얼 복지 정책, 정부 세제 혜택, 실질 환급 제도(예: 농어촌 소멸지역 여행비 50% 현금/지역화폐 환급, 대중교통 환급 패스, 청년 도약 지원금 등)의 가이드와 신청 방법**으로 3장의 알림판 카드를 가득 채우세요.
   - **카테고리 구성:**
     * **카드 1:** "💡 전국민 알짜 혜택" (대표 알림) - 혜택 명칭, 환급율(예: 50% 환급), 수혜 금액, 시행 요강 핵심 요약.
     * **카드 2:** "⚖️ 법률 고지 / 수혜 자격 기준" (법적 조건) - 소득 수준, 연령, 지역 주민 등 구체적인 신청 자격 요건과 근거 특별법 및 규칙 제시.
     * **카드 3:** "💼 비서 솔루션 / 원스톱 신청 가이드" (대응 수칙) - '모두의비서' 앱이나 정부 24를 통해 온라인으로 원클릭으로 필요한 서식과 첨부 서류를 자동 연동 제출하는 3단계 행동 요령 안내.

2. **사기/피해/스미싱/위약금/제품 리콜 등 부정적 주의보 주제인 경우:**
   - 경각심을 고취하고 조속히 환불 및 권리 구제를 받을 수 있는 **피해 예방 경보 및 긴급 수칙**으로 3종 카드를 채워주세요. (category: 'urgent', 'safety' 위주)

3. **중립적 법 개정/행정 제도 개정형 주제인 경우:**
   - 개정된 법률 기준, 달라진 시민의 권리 의무 사항, 규제 기준 및 위반 사업자 단속 지침 중심으로 3종 카드를 채워주세요. (category: 'law' 위주)

**[반드시 반환해야 하는 JSON 구조]**
반드시 다음 JSON 형식이어야 하며, 어떠한 마크다운 백틱(\`\`\`json)이나 부연 설명 없이 오직 순수한 JSON만 리턴해야 합니다:
{
  "alerts": [
    {
      "category": "urgent | law | benefit | safety | partner",
      "categoryLabel": "긴급 피해주의보 | 법 개정/의무 시행 | 전국민 알짜 혜택 | 식품/제품 안전 리콜 | 공식 제휴처 기업 알림",
      "badgeText": "🚨 긴급 경보 | ⚖️ 법률 고지 | 💡 알짜 혜택 | 🛡️ 제품 리콜 등 테마에 부합하는 한글 4~5자 이내 뱃지 문구",
      "urgency": "high | medium | normal",
      "title": "[카테고리 및 혜택/주의사항 성격에 딱 맞게 정밀 작명한 타이틀]",
      "summary": "핵심 내용 요약 (2-3줄, 복지 혜택의 경우 정확한 수혜액 및 핵심 조건 명시)",
      "targetAudience": "주요 혜택 또는 위험 방지 대상층 명시 (예: 독립 무주택 청년, 국내 여행 예정인 온 국민 등)",
      "institution": "소관 정부 부처 및 공공 구제 기관 (예: 국토교통부, 행정안전부, 보건복지부, 한국소비자원 대책본부 등)",
      "effectiveDate": "발효 일자 또는 신청 접수 개시 일정",
      "keyPoints": [
        "1. ...",
        "2. ...",
        "3. ..."
      ],
      "actionGuide": [
        "1단계: ...",
        "2단계: ...",
        "3단계: ..."
      ],
      "lawBasis": "구체적인 지원 특별법, 조례 또는 관련 공정 고시 이름 (예: 국가균형발전특별법 제8조, 소비자기본법 등)",
      "contactNumber": "대표 직통 상담 문의 연락처"
    },
    ... (총 3개 생산)
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: `주제 키워드: "${topic}"` }] }],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json"
      }
    });

    let resultText = response.text || "{}";
    if (resultText.includes("```")) {
      resultText = resultText.replace(/```json|```/g, "").trim();
    }

    const parsedResult = JSON.parse(resultText);

    return res.json({
      success: true,
      alerts: parsedResult.alerts || []
    });

  } catch (error: any) {
    console.error("Triple alerts generation error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Vite Middleware for SPA serving in development and static in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
