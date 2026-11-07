import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  ArrowRight, 
  Check,
  CheckCircle2, 
  Building2, 
  Phone, 
  Clock, 
  HelpCircle,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  MessageSquare,
  Database,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap
} from 'lucide-react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Inquiry, CATEGORY_MAP } from '../types';

interface ModuAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshParentInquiries?: () => void;
}

export interface GroundingSource {
  collection: 'public_alerts' | 'partners' | 'consumer_insights' | 'inquiries' | string;
  collectionName: string;
  docId: string;
  title: string;
  snippet?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  autofillForm?: {
    title: string;
    parentCategory: 'shopping' | 'travel' | 'restaurant' | 'other';
    subCategory: string;
    content: string;
  };
  partnerCard?: {
    name: string;
    phone: string;
    avgResponse: string;
    category: string;
  };
  sources?: GroundingSource[];
  podcastScript?: Array<{ speaker: string; text: string }>;
  documentBuilderType?: 'content-certification' | 'phone-cancel' | 'gov-wallet';
  documentBuilderStep?: number;
  documentBuilderData?: any;
}

export const ModuAssistantDrawer: React.FC<ModuAssistantDrawerProps> = ({ 
  isOpen, 
  onClose,
  onRefreshParentInquiries
}) => {
  const { user, userProfile } = useAuth();
  
  // Real-time Database Snapshot State for Grounding Context
  const [notices, setNotices] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [userInquiries, setUserInquiries] = useState<Inquiry[]>([]);
  
  // Chat Interface State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `안녕하세요, **박성배**님! 스마트 권익구제 지능형 어시스턴트 **🔮 모두의비서**입니다.
      
저희 플랫폼의 **실시간 안전 고지(공고)**, **법률 지식 상식**, **제휴사 핫라인**과 회원님의 **1:1 해결 문의 상태**를 실시간으로 파악하여 친절하게 답변해 드릴 준비가 되어 있습니다!

💡 아래와 같은 질문이나 요청을 해보시면 저의 똑똑한 가치를 바로 확인하실 수 있습니다:
- *"배민 음식 배달 파손됐는데 대응 가이드 알려줘"*
- *"최근 등록된 긴급 주의보 상황이 뭐야?"*
- *"내가 예전에 접수한 민원 처리 상황 추적해줘"*`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentTab, setCurrentTab] = useState<'chat' | 'tracker'>('chat');
  const [submitSuccessId, setSubmitSuccessId] = useState<string | null>(null);
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState<string | null>(null);

  // Voice Interaction State Variables
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [isContinuousVoiceMode, setIsContinuousVoiceMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Real-time Podcast Speaking Tracking States
  const [activePodcastMsgId, setActivePodcastMsgId] = useState<string | null>(null);
  const [currentPodcastLineIdx, setCurrentPodcastLineIdx] = useState<number>(-1);
  const [generatingPodcastMsgId, setGeneratingPodcastMsgId] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [generatingTtsMsgId, setGeneratingTtsMsgId] = useState<string | null>(null);
  const [isMicBlocked, setIsMicBlocked] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const podcastIntervalRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'ko-KR';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          showToast(`음성 인식 완료: "${transcript}"`);
          
          if (isContinuousVoiceMode) {
            // In hands-free mode, trigger automatic sending!
            setTimeout(() => {
              handleSendMessage(transcript);
            }, 1000);
          }
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setIsMicBlocked(true);
        } else {
          showToast(`음성 인식 오류: ${event.error}`);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [isContinuousVoiceMode]);

  // Clean up audio speech synthesis when drawer is closed or unmounted
  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (podcastIntervalRef.current) {
        clearInterval(podcastIntervalRef.current);
        podcastIntervalRef.current = null;
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setSpeakingMsgId(null);
      setActivePodcastMsgId(null);
      setCurrentPodcastLineIdx(-1);
      setGeneratingPodcastMsgId(null);
      setGeneratingTtsMsgId(null);
      setIsListening(false);
      if (recognition) {
        try {
          recognition.stop();
        } catch {}
      }
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (podcastIntervalRef.current) {
        clearInterval(podcastIntervalRef.current);
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, [isOpen, recognition]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Load live DB snapshots for grounding
  useEffect(() => {
    if (!isOpen) return;

    // 1. Load alerts/notices
    const unsubscribeNotices = onSnapshot(collection(db, 'public_alerts'), (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setNotices(list);
    });

    // 2. Load partner brands
    const unsubscribePartners = onSnapshot(collection(db, 'partners'), (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setPartners(list);
    });

    // 3. Load legal insights
    const unsubscribeInsights = onSnapshot(collection(db, 'consumer_insights'), (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setInsights(list);
    });

    // 4. Load logged-in user's active inquiries
    if (user?.uid) {
      const qInq = query(
        collection(db, 'inquiries'),
        where('authorId', '==', user.uid)
      );
      const unsubscribeInq = onSnapshot(qInq, (snap) => {
        const list: Inquiry[] = [];
        snap.forEach(d => list.push(d.data() as Inquiry));
        
        // Robust sorting that handles Firestore Timestamps, JS Dates, and null safely
        const getInquiryTime = (inq: any) => {
          if (!inq.createdAt) return 0;
          if (typeof inq.createdAt.toDate === 'function') {
            return inq.createdAt.toDate().getTime();
          }
          if (inq.createdAt.seconds) {
            return inq.createdAt.seconds * 1000;
          }
          if (inq.createdAt instanceof Date) {
            return inq.createdAt.getTime();
          }
          if (typeof inq.createdAt === 'string') {
            return new Date(inq.createdAt).getTime();
          }
          return 0;
        };

        setUserInquiries(list.sort((a, b) => getInquiryTime(b) - getInquiryTime(a)));
      });
      return () => {
        unsubscribeNotices();
        unsubscribePartners();
        unsubscribeInsights();
        unsubscribeInq();
      };
    }

    return () => {
      unsubscribeNotices();
      unsubscribePartners();
      unsubscribeInsights();
    };
  }, [isOpen, user?.uid]);

  // Process message parsing for markdown and custom interactive card triggers
  const parseTriggerTags = (text: string) => {
    let cleanText = text;
    let autofillForm: any = undefined;
    let partnerCard: any = undefined;

    // Helper to cleanse any markdown formatting (asterisks, codeblocks) before parsing
    const sanitizeAndParseJson = (str: string) => {
      let clean = str.trim();
      // Strip markdown code block markers
      if (clean.startsWith('```')) {
        clean = clean.replace(/^```[a-zA-Z]*\s*/, '').replace(/\s*```$/, '').trim();
      }
      // Strip markdown bold markers (e.g., **) or other trailing asterisks
      clean = clean.replace(/^\*+/, '').replace(/\*+$/, '').trim();
      return JSON.parse(clean);
    };

    // 1. Parse AUTOFILL_TRIGGER
    const autofillRegex = /\[AUTOFILL_TRIGGER_START\]\s*([\s\S]*?)\s*\[AUTOFILL_TRIGGER_END\]/;
    const autofillMatch = cleanText.match(autofillRegex);
    if (autofillMatch && autofillMatch[1]) {
      try {
        autofillForm = sanitizeAndParseJson(autofillMatch[1]);
        cleanText = cleanText.replace(autofillRegex, '').trim();
      } catch (err) {
        console.error("Failed to parse AI autofill trigger:", err);
      }
    }

    // 2. Parse PARTNER_CARD_TRIGGER
    const partnerRegex = /\[PARTNER_CARD_TRIGGER_START\]\s*([\s\S]*?)\s*\[PARTNER_CARD_TRIGGER_END\]/;
    const partnerMatch = cleanText.match(partnerRegex);
    if (partnerMatch && partnerMatch[1]) {
      try {
        partnerCard = sanitizeAndParseJson(partnerMatch[1]);
        cleanText = cleanText.replace(partnerRegex, '').trim();
      } catch (err) {
        console.error("Failed to parse AI partner card trigger:", err);
      }
    }

    // 3. Parse SOURCES_TRIGGER (Grounding Source Citation)
    let sources: GroundingSource[] = [];
    const sourcesRegex = /\[SOURCES_TRIGGER_START\]\s*([\s\S]*?)\s*\[SOURCES_TRIGGER_END\]/;
    const sourcesMatch = cleanText.match(sourcesRegex);
    if (sourcesMatch && sourcesMatch[1]) {
      try {
        const parsedSources = sanitizeAndParseJson(sourcesMatch[1]);
        if (Array.isArray(parsedSources)) {
          sources = parsedSources.filter((s: any) => s && s.docId && s.title);
        }
        cleanText = cleanText.replace(sourcesRegex, '').trim();
      } catch (err) {
        console.error("Failed to parse AI sources trigger:", err);
      }
    }

    // 4. Parse PODCAST_TRIGGER (2-Person Conversational Podcast Script)
    let podcastScript: any[] = [];
    const podcastRegex = /\[PODCAST_TRIGGER_START\]\s*([\s\S]*?)\s*\[PODCAST_TRIGGER_END\]/;
    const podcastMatch = cleanText.match(podcastRegex);
    if (podcastMatch && podcastMatch[1]) {
      try {
        const parsedPodcast = sanitizeAndParseJson(podcastMatch[1]);
        if (Array.isArray(parsedPodcast)) {
          podcastScript = parsedPodcast.filter((p: any) => p && p.speaker && p.text);
        }
        cleanText = cleanText.replace(podcastRegex, '').trim();
      } catch (err) {
        console.error("Failed to parse AI podcast trigger:", err);
      }
    }

    // Fallback enrichment: verify and match against active DB items mentioned in text
    const existingDocIds = new Set(sources.map(s => String(s.docId)));

    partners.forEach(p => {
      if (p.name && (cleanText.includes(p.name) || (partnerCard && partnerCard.name === p.name))) {
        const docId = p.id || p.name;
        if (!existingDocIds.has(String(docId))) {
          sources.push({
            collection: 'partners',
            collectionName: '안심제휴처',
            docId: String(docId),
            title: p.name,
            snippet: p.avgResponse || p.intro || '공식 제휴 파트너'
          });
          existingDocIds.add(String(docId));
        }
      }
    });

    insights.forEach(i => {
      if (i.title && (cleanText.includes(i.title) || (i.lawBasis && cleanText.includes(i.lawBasis)))) {
        const docId = i.id || 'insight_ref';
        if (!existingDocIds.has(String(docId))) {
          sources.push({
            collection: 'consumer_insights',
            collectionName: '소비자법률상식',
            docId: String(docId),
            title: i.title,
            snippet: i.lawBasis || '소비자기본법 근거'
          });
          existingDocIds.add(String(docId));
        }
      }
    });

    notices.forEach(n => {
      if (n.title && cleanText.includes(n.title.slice(0, 7))) {
        const docId = n.id || 'alert_ref';
        if (!existingDocIds.has(String(docId))) {
          sources.push({
            collection: 'public_alerts',
            collectionName: '모두의알림',
            docId: String(docId),
            title: n.title,
            snippet: n.institution || '공공 필수 고지'
          });
          existingDocIds.add(String(docId));
        }
      }
    });

    userInquiries.forEach(inq => {
      if (inq.id && (cleanText.includes(inq.id) || (inq.title && cleanText.includes(inq.title.slice(0, 7))))) {
        if (!existingDocIds.has(String(inq.id))) {
          sources.push({
            collection: 'inquiries',
            collectionName: '나의문의내역',
            docId: String(inq.id),
            title: inq.title,
            snippet: inq.status === 'replied' ? '답변완료' : '진행중'
          });
          existingDocIds.add(String(inq.id));
        }
      }
    });

    return { cleanText, autofillForm, partnerCard, sources, podcastScript };
  };

  // Toggle voice recognition
  const toggleListening = () => {
    if (!recognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 혹은 Safari 모바일 브라우저를 이용해 주세요.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
      
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Speak assistant messages with Voice Synthesis (TTS) - Supports Dual Speaker Conversational Podcasts
  const speakMessage = (msgId: string, text: string, customPodcastScript?: any[]) => {
    if (!('speechSynthesis' in window)) {
      alert("이 브라우저는 음성 합성(TTS)을 지원하지 않습니다.");
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      setActivePodcastMsgId(null);
      setCurrentPodcastLineIdx(-1);
    } else {
      window.speechSynthesis.cancel();
      
      const scriptToPlay = customPodcastScript && customPodcastScript.length > 0 
        ? customPodcastScript 
        : null;

      if (scriptToPlay) {
        setSpeakingMsgId(msgId);
        setActivePodcastMsgId(msgId);
        setCurrentPodcastLineIdx(0);
        
        const voices = window.speechSynthesis.getVoices();
        const koVoices = voices.filter(v => v.lang.startsWith('ko'));
        let playIdx = 0;

        const playNextLine = () => {
          if (playIdx >= scriptToPlay.length) {
            setSpeakingMsgId(null);
            setActivePodcastMsgId(null);
            setCurrentPodcastLineIdx(-1);
            if (isContinuousVoiceMode) {
              setTimeout(() => {
                toggleListening();
              }, 800);
            }
            return;
          }

          setCurrentPodcastLineIdx(playIdx);
          const currentLine = scriptToPlay[playIdx];
          const utterance = new SpeechSynthesisUtterance(currentLine.text);
          utterance.lang = 'ko-KR';

          // Assign alternating pitches and rates to differentiate Host A (Minwoo) vs Host B (Jiwon)
          if (currentLine.speaker === '민우' || currentLine.speaker === 'Host A' || currentLine.speaker === 'A') {
            // Male characteristics: lower pitch, slightly slower rate
            utterance.pitch = 0.8;
            utterance.rate = 0.95;
            const maleVoice = koVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('minsu'));
            if (maleVoice) utterance.voice = maleVoice;
          } else {
            // Female characteristics: higher pitch, slightly faster rate
            utterance.pitch = 1.25;
            utterance.rate = 1.05;
            const femaleVoice = koVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('yumi') || v.name.toLowerCase().includes('google'));
            if (femaleVoice) utterance.voice = femaleVoice;
          }

          utterance.onend = () => {
            playIdx++;
            playNextLine();
          };

          utterance.onerror = () => {
            playIdx++;
            playNextLine();
          };

          window.speechSynthesis.speak(utterance);
        };

        playNextLine();

      } else {
        // Stop any currently playing audio
        if (currentAudioRef.current) {
          try {
            currentAudioRef.current.pause();
          } catch {}
          currentAudioRef.current = null;
        }

        setGeneratingTtsMsgId(msgId);
        
        fetch('/api/assistant/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        })
        .then(res => res.json())
        .then(data => {
          setGeneratingTtsMsgId(null);
          if (data.success && data.audioData) {
            setSpeakingMsgId(msgId);
            const audioUri = `data:${data.mimeType || 'audio/mp3'};base64,${data.audioData}`;
            const audio = new Audio(audioUri);
            currentAudioRef.current = audio;
            
            audio.play().catch(err => {
              console.error("Failed to play main bubble Gemini TTS audio:", err);
              setSpeakingMsgId(null);
            });

            audio.onended = () => {
              setSpeakingMsgId(null);
              currentAudioRef.current = null;
              if (isContinuousVoiceMode) {
                setTimeout(() => {
                  toggleListening();
                }, 800);
              }
            };
          } else {
            throw new Error("Failed to load Gemini TTS");
          }
        })
        .catch(err => {
          console.error(err);
          setGeneratingTtsMsgId(null);
          // Graceful fallback to browser speech synthesis on server connection error
          const cleanSpeechText = text
            .replace(/\*\*/g, '')
            .replace(/🔮/g, '')
            .replace(/💡/g, '')
            .replace(/🎉/g, '')
            .replace(/⭐/g, '')
            .replace(/- \*"|"\*/g, '');

          const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
          utterance.lang = 'ko-KR';
          utterance.onend = () => {
            setSpeakingMsgId(null);
            if (isContinuousVoiceMode) {
              setTimeout(() => {
                toggleListening();
              }, 800);
            }
          };
          utterance.onerror = () => {
            setSpeakingMsgId(null);
          };
          setSpeakingMsgId(msgId);
          window.speechSynthesis.speak(utterance);
        });
      }
    }
  };

  // Play the 2-Person Podcast with actual alternating voice synthesis and real-time line highlighting
  const playPodcastWithAudio = (msgId: string, script: any[]) => {
    // Cancel any standard synthesis just in case
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    // Stop any existing audio
    if (currentAudioRef.current) {
      try {
        currentAudioRef.current.pause();
      } catch {}
      currentAudioRef.current = null;
    }

    setSpeakingMsgId(msgId);
    setActivePodcastMsgId(msgId);
    setCurrentPodcastLineIdx(0);

    let playIdx = 0;

    const playNextLine = () => {
      // Check if we are still active
      if (activePodcastMsgId !== msgId) {
        if (currentAudioRef.current) {
          try {
            currentAudioRef.current.pause();
          } catch {}
          currentAudioRef.current = null;
        }
        return;
      }

      if (playIdx >= script.length) {
        setSpeakingMsgId(null);
        setActivePodcastMsgId(null);
        setCurrentPodcastLineIdx(-1);
        if (isContinuousVoiceMode) {
          setTimeout(() => {
            toggleListening();
          }, 800);
        }
        return;
      }

      setCurrentPodcastLineIdx(playIdx);
      const currentLine = script[playIdx];

      if (currentLine.audioData) {
        // Play the real premium Gemini prebuilt voice stream!
        const audioUri = `data:${currentLine.mimeType || 'audio/mp3'};base64,${currentLine.audioData}`;
        const audio = new Audio(audioUri);
        
        // Differentiate speaker pitch/speed natively (Minwoo: slightly slower/deeper, Jiwon: slightly faster/livelier)
        const isMale = currentLine.speaker === '민우' || currentLine.speaker === 'Host A' || currentLine.speaker === 'A';
        audio.playbackRate = isMale ? 0.90 : 1.08;

        currentAudioRef.current = audio;

        audio.play().catch(err => {
          console.error("Gemini premium audio playback error, falling back to browser TTS:", err);
          fallbackToBrowserTts(currentLine.text, () => {
            playIdx++;
            playNextLine();
          });
        });

        audio.onended = () => {
          currentAudioRef.current = null;
          playIdx++;
          setTimeout(() => {
            playNextLine();
          }, 500);
        };
      } else {
        // Fallback to standard reading just in case
        fallbackToBrowserTts(currentLine.text, () => {
          playIdx++;
          playNextLine();
        });
      }
    };

    const fallbackToBrowserTts = (textToSpeak: string, callback: () => void) => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ko-KR';
      utterance.onend = () => callback();
      utterance.onerror = () => callback();
      window.speechSynthesis.speak(utterance);
    };

    playNextLine();
  };

  // Generate 2-Person Podcast Script and call Premium Gemini TTS Synthesis on-demand
  const handleGenerateOnDemandPodcast = async (msgId: string, text: string, existingScript?: any[]) => {
    // If currently playing, stop it!
    if (speakingMsgId === msgId && activePodcastMsgId === msgId) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (currentAudioRef.current) {
        try {
          currentAudioRef.current.pause();
        } catch {}
        currentAudioRef.current = null;
      }
      setSpeakingMsgId(null);
      setActivePodcastMsgId(null);
      setCurrentPodcastLineIdx(-1);
      return;
    }

    // If we already have the script with audioData, play it!
    if (existingScript && existingScript.length > 0 && existingScript[0].audioData) {
      playPodcastWithAudio(msgId, existingScript);
      return;
    }

    // Otherwise, we do the full on-demand Gemini generation AND premium TTS synthesis!
    setGeneratingPodcastMsgId(msgId);
    let targetScript = existingScript;

    // Step 1: Generate dialogue script if not present
    if (!targetScript || targetScript.length === 0) {
      setGenerationStep("📡 제미나이 3.5 모델 연결 및 2인조 팟캐스트 방송 대본 분석 설계 중...");
      try {
        const response = await fetch('/api/assistant/podcast/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        const data = await response.json();
        if (data.success && data.podcastScript) {
          targetScript = data.podcastScript;
        } else {
          throw new Error("Failed to generate dialogue script");
        }
      } catch (err) {
        console.error(err);
        setGeneratingPodcastMsgId(null);
        alert("제미나이 팟캐스트 대본 설계 중 일시 정체가 발생했습니다. 잠시 후 다시 시도해 주세요!");
        return;
      }
    }

    // Step 2: Synthesize premium prebuilt neural voices (Aoede & Puck) from Gemini for this script!
    setGenerationStep("🎙️ 최신 Gemini 특화 성우 엔진(Aoede & Puck)으로 고음질 오디오 스트림 추출 및 마스터링 중...");
    try {
      const response = await fetch('/api/assistant/podcast/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: targetScript })
      });
      const data = await response.json();

      if (data.success && data.script) {
        // Save the premium audio-enriched script in state so it displays
        setMessages(prev => prev.map(m => {
          if (m.id === msgId) {
            return { ...m, podcastScript: data.script };
          }
          return m;
        }));

        setTimeout(() => {
          setGeneratingPodcastMsgId(null);
          playPodcastWithAudio(msgId, data.script);
        }, 1200);
      } else {
        throw new Error("Failed to synthesize premium audio");
      }
    } catch (err) {
      console.error(err);
      setGeneratingPodcastMsgId(null);
      alert("최신 Gemini TTS 연동 중 음성 품질 보정 정체가 발생했습니다. 잠시 후 다시 시도해 주세요!");
    }
  };

  // Chat Submission Handler
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || isSending) return;

    if (!textToSend) setInputText('');

    const newUserMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: rawText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsSending(true);

    // INTERCEPT INTERACTIVE BUILDER FLOWS
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.sender === 'assistant' && lastMsg.documentBuilderType) {
      const bType = lastMsg.documentBuilderType;
      const bStep = lastMsg.documentBuilderStep || 1;
      const bData = lastMsg.documentBuilderData || {};

      setTimeout(() => {
        const newMsgId = `builder_ai_${Date.now()}`;
        if (bType === 'content-certification') {
          if (bStep === 1) {
            // User just provided Recipient Name
            const opponentName = rawText.trim();
            setMessages(prev => [...prev, {
              id: newMsgId,
              sender: 'assistant',
              text: `🎯 수신인 **"${opponentName}"**이 저장되었습니다.
              
**2단계: 약정 위약금, 보증금 또는 피해 발생액(금액)과 거래 일자는 어떻게 되시나요?**
(예: 60만원, 2026년 9월 12일 결제)`,
              timestamp: new Date(),
              documentBuilderType: 'content-certification',
              documentBuilderStep: 2,
              documentBuilderData: { opponentName }
            }]);
          } else if (bStep === 2) {
            // User provided amount & date
            const amountAndDate = rawText.trim();
            setMessages(prev => [...prev, {
              id: newMsgId,
              sender: 'assistant',
              text: `💰 거래정보 **"${amountAndDate}"**이 저장되었습니다.
              
**3단계: 구체적인 계약 위반 내용이나 피해 사실을 가볍게 알려주세요.**
(예: 개인사정으로 이틀 만에 계약해지 요구했으나 특약 서명 이유로 환불 전면 거절당함)`,
              timestamp: new Date(),
              documentBuilderType: 'content-certification',
              documentBuilderStep: 3,
              documentBuilderData: { ...bData, amountAndDate }
            }]);
          } else if (bStep === 3) {
            // User provided description -> Generate Document!
            const details = rawText.trim();
            const opponentName = bData.opponentName || '수신 업체';
            const amountAndDate = bData.amountAndDate || '해당 금액';
            
            const docContent = `[내용증명서]
■ 발신인: 박성배 님
■ 수신인: ${opponentName} 대표귀하
■ 관련 거래 금액 및 일자: ${amountAndDate}
■ 원인 사실: ${details}

■ 제목: 계약 중도 해지에 따른 잔여금 즉시 반환 독촉의 건

본 발신인(소비자)은 귀사(${opponentName})와 체결한 이용 약관에 관하여, 방문판매법 제31조 및 약관규제법 제6조에 근거하여 즉각적인 해지 및 잔여 금액 정산을 다음과 같이 통보합니다.

1. 본인은 정당한 철회 권리를 행사하여 환불을 요청하였으나, 수신인은 임의 특약을 기재하였다는 사유로 반환을 원천 거절하고 있습니다. 이는 소비자 분쟁해결기준 및 관련법상 무효인 약관에 해당합니다.
2. 따라서 본 통지서를 수령한 날로부터 7일 이내에 실제 결제금액 기준 위약금 10%를 초과하는 공제 없이 전액 일할 계산하여 반환해 줄 것을 강력히 촉구합니다.
3. 만일 본 요구를 이행하지 않을 경우, 한국소비자원(1372) 공식 분쟁 조정 신청, 관할 구청 행정 제재 요청 및 신용카드사 차지백 분쟁 중재 제기를 엄중히 경고합니다.`;

            setMessages(prev => [...prev, {
              id: newMsgId,
              sender: 'assistant',
              text: `🎉 **국가대표급 정밀 내용증명 초안이 완성되었습니다!**
              
성배님이 구술해 주신 내용을 기반으로 관련 행정 특별법을 정합하여 최적의 서식 대항 문구를 완비했습니다. 아래 대리 접수 카드를 승인해 우체국 e-그린우편 및 소비자원 이송망을 즉각 대행 처리할 수 있습니다!`,
              timestamp: new Date(),
              autofillForm: {
                title: `[내용증명 공식 대리 발송] ${opponentName} 반환 촉구`,
                parentCategory: 'other',
                subCategory: '내용증명 송무',
                content: docContent
              }
            }]);
          }
        } else if (bType === 'phone-cancel') {
          if (bStep === 1) {
            // User provided Carrier
            const carrier = rawText.trim();
            setMessages(prev => [...prev, {
              id: newMsgId,
              sender: 'assistant',
              text: `📞 가입 통신사 **"${carrier}"**가 확인되었습니다.
              
**2단계: 해지 처리 대행을 수행할 본인 명의의 휴대폰 번호를 남겨주세요.**
(예: 010-1234-5678)`,
              timestamp: new Date(),
              documentBuilderType: 'phone-cancel',
              documentBuilderStep: 2,
              documentBuilderData: { carrier }
            }]);
          } else if (bStep === 2) {
            // User provided Phone Number
            const phoneNum = rawText.trim();
            setMessages(prev => [...prev, {
              id: newMsgId,
              sender: 'assistant',
              text: `📱 대상 번호 **"${phoneNum}"**이 확인되었습니다.
              
**3단계: 해지 신청 사유를 간단히 입력해 주세요.**
(예: 알뜰폰 이동, 약정 만료, 군입대 등)`,
              timestamp: new Date(),
              documentBuilderType: 'phone-cancel',
              documentBuilderStep: 3,
              documentBuilderData: { ...bData, phoneNum }
            }]);
          } else if (bStep === 3) {
            // User provided cancel reason -> Generate Document!
            const reason = rawText.trim();
            const carrier = bData.carrier || '이동통신사';
            const phoneNum = bData.phoneNum || '대상 번호';

            const cancelDoc = `[이동전화 서비스 해지 신청서]
■ 신청인: 박성배 님
■ 가입 통신사: ${carrier} 본사 센터귀중
■ 해지 번호: ${phoneNum}
■ 신청 사유: ${reason}

위 가입인(박성배)은 본 해지 신청원의 송달 및 팩스 수신 즉시, 당해 가입 서비스의 즉각 해지 및 최종 약정 할인 위약금 정산 고지를 청구합니다. 대리점의 실적 목적 고의 지연 시 전파 통신법 기준 민원 소지가 있음을 고지합니다.`;

            setMessages(prev => [...prev, {
              id: newMsgId,
              sender: 'assistant',
              text: `🎉 **본사 다이렉트 해지 신청 공문 초안이 완비되었습니다!**
              
가장 확실한 처리를 위해 하단 카드를 확인하시어 본사 해지 팩스망 및 114 중재 채널로 일괄 대리 접수를 승인해 주세요.`,
              timestamp: new Date(),
              autofillForm: {
                title: `[본사 해지 핫라인 대리 신청] ${carrier} (${phoneNum})`,
                parentCategory: 'other',
                subCategory: '통신해지 대행',
                content: cancelDoc
              }
            }]);
          }
        }
        setIsSending(false);
      }, 1000);
      return;
    }

    try {
      // Build context for grounding
      const context = {
        notices: notices.slice(0, 15), // top 15 notices
        partners: partners.slice(0, 15), // top 15 partner brands
        insights: insights.slice(0, 10), // top 10 legal insights
        inquiries: userInquiries.slice(0, 10) // top 10 user inquiries
      };

      const historyForAPI = messages.concat(newUserMessage).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForAPI,
          context,
          userProfile: {
            email: user?.email,
            displayName: userProfile?.displayName || user?.displayName || '박성배'
          },
          isContinuousVoiceMode
        })
      });

      if (!res.ok) throw new Error("Assistant response error");
      const data = await res.json();

      if (data.success) {
        const parsed = parseTriggerTags(data.reply);
        const newMsgId = `ai_${Date.now()}`;
        setMessages(prev => [...prev, {
          id: newMsgId,
          sender: 'assistant',
          text: parsed.cleanText,
          timestamp: new Date(),
          autofillForm: parsed.autofillForm,
          partnerCard: parsed.partnerCard,
          sources: parsed.sources,
          podcastScript: parsed.podcastScript
        }]);

        // Auto TTS in continuous voice mode
        if (isContinuousVoiceMode) {
          setTimeout(() => {
            speakMessage(newMsgId, parsed.cleanText, parsed.podcastScript);
          }, 300);
        }
      } else {
        throw new Error(data.error || "Failed");
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: "죄송합니다, 잠시 대량 전산 연동 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
        timestamp: new Date()
      }]);
    } finally {
      setIsSending(false);
    }
  };

  // Submit formal 1:1 Inquiry automatically via the Autofilled Proxy Card
  const handleAutoSubmitInquiry = async (msgId: string, form: any) => {
    if (isSubmittingInquiry) return;
    setIsSubmittingInquiry(msgId);

    try {
      const docRef = doc(collection(db, 'inquiries'));
      
      // Match partner matching the parent category
      let assignedPartnerId = '';
      let assignedPartnerName = '';
      let autoAssigned = false;

      const matchingPartners = partners.filter(p => 
        p.partnerCategory === form.parentCategory || p.partnerCategory === 'all'
      );
      if (matchingPartners.length > 0) {
        assignedPartnerId = matchingPartners[0].uid;
        assignedPartnerName = matchingPartners[0].displayName || '공식 제휴사';
        autoAssigned = true;
      }

      // Default AI analysis setup for rich detail
      const defaultAnalysis = {
        sentiment: 'neutral',
        summarizedNeed: `${form.title} 수립 및 즉시 중재 조율`,
        suggestedResponse: `안녕하세요, 소비자 권익 지원 포털입니다. 회원님께서 모두의비서를 통해 간편 접수하신 건([${form.title}])이 안전하게 승인 처리되어 관련 제휴사망에 실시간 인서트되었습니다. 담당 제휴 파트너가 상세 검토 후 실시간으로 조치를 취할 예정입니다.`
      };

      const newInquiry = {
        id: docRef.id,
        parentCategory: form.parentCategory || 'other',
        subCategory: form.subCategory || '지능형 자동 매핑',
        title: form.title.trim(),
        content: form.content.trim(),
        authorId: user?.uid || '',
        authorName: userProfile?.displayName || user?.displayName || '박성배',
        authorEmail: user?.email || '',
        status: autoAssigned ? 'routing' : 'pending',
        assignedPartnerId: assignedPartnerId || null,
        assignedPartnerName: assignedPartnerName || null,
        assignedAt: autoAssigned ? new Date() : null,
        autoAssigned: autoAssigned,
        attachments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        aiAnalysis: defaultAnalysis
      };

      await setDoc(docRef, newInquiry);
      setSubmitSuccessId(msgId);

      // Refresh parent inquiries if callback provided
      if (onRefreshParentInquiries) {
        onRefreshParentInquiries();
      }

      // Append success chat message
      setMessages(prev => [...prev, {
        id: `submit_success_${Date.now()}`,
        sender: 'assistant',
        text: `🎉 **1:1 안심 문의 공식 접수 완료!**
        
방금 말씀하신 내용으로 **[${form.title}]** 건이 소비자 권익구제 시스템에 성공적으로 공식 자동 접수되었습니다. 
${autoAssigned ? `현재 담당 제휴사인 **'${assignedPartnerName}'** 측으로 즉각 이송(routing) 처리되었으며, 대시보드 및 문의 추적실을 통해 실시간 조치 과정을 확인하실 수 있습니다.` : '플랫폼 전문 해결 마스터가 배정을 조율하는 즉시 진행됩니다.'}`,
        timestamp: new Date()
      }]);

    } catch (err) {
      console.error("Auto submit inquiry error:", err);
    } finally {
      setIsSubmittingInquiry(null);
    }
  };

  const handleGovWalletSubmit = (fileName: string, walletName: string) => {
    const userMsgId = `gov_user_${Date.now()}`;
    const aiMsgId = `gov_ai_${Date.now()}`;
    
    // Add User and AI replies to state
    setMessages(prev => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: `📲 ${walletName} 연동 완료: "${fileName}" 제출`,
        timestamp: new Date()
      },
      {
        id: aiMsgId,
        sender: 'assistant',
        text: `✅ **${fileName}**이(가) **${walletName}** 보안 터널을 거쳐 성공적으로 '모두의비서'로 이송 접수되었습니다!
        
귀하의 민원 분쟁을 정부24 및 각 소관 지자체 위생과/계속거래과 CS 핫라인으로 무상 대리 이송 처리를 가동할 준비가 끝났습니다. 아래 [즉시 공식 접수 승인] 단추를 누르시면 팩스 및 공공 이송 처리가 실시간 진행됩니다!`,
        timestamp: new Date(),
        autofillForm: {
          title: `[행정 서류 공공 접수] ${fileName} 연동 중재`,
          parentCategory: 'other',
          subCategory: '민원서류 이송',
          content: `정부24 및 ${walletName} 전자지갑 API 연동을 통해 입수한 필수 행정서류(${fileName})에 의거하여 당사 모두의비서실이 전임 행정사 매칭 및 중재를 청구함.`
        }
      }
    ]);
  };

  // Handle custom window events to trigger specialized builder modes
  useEffect(() => {
    const handleOpenAssistant = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (!customEvent.detail) return;
      
      const { action, topic } = customEvent.detail;
      if (action === 'start-document-builder') {
        setCurrentTab('chat');
        const welcomeId = `builder_init_${Date.now()}`;
        if (topic === 'content-certification') {
          setMessages(prev => [
            ...prev,
            {
              id: welcomeId,
              sender: 'assistant',
              text: `📝 **실시간 내용증명 마스터 서식 빌더**가 시작되었습니다!
              
환불 거부, 약정 위반, 미수금 청구 등 상대방에게 공식 등기를 발송하기 위해 필요한 **정밀 내용증명 문서**를 대화를 통해 10분 만에 기획해 드립니다.

먼저, 내용을 채우기 위해 **몇 가지 사항**을 차례로 입력해 주시면 비서가 즉석에서 합법적인 서식 초안을 출력합니다!

**1단계: 이 내용증명을 받아야 하는 수신인(상대 회사 또는 업주명)은 누구인가요?**`,
              timestamp: new Date(),
              documentBuilderType: 'content-certification',
              documentBuilderStep: 1
            }
          ]);
        } else if (topic === 'gov-wallet') {
          setMessages(prev => [
            ...prev,
            {
              id: welcomeId,
              sender: 'assistant',
              text: `📑 **모바일 정부24 & 전자서류 연동 센터**가 활성화되었습니다!
              
상위 관공서 및 소송 구제를 위해 필요한 주민등록초본, 건축물대장, 사업자등록증 등의 필수 제출 서류를 스마트폰의 카카오/네이버 전자지갑에서 선택하여 안전하게 '모두의비서'로 접수하실 수 있습니다.

**아래의 연동 서류 제출 수단 중 원하시는 전자문서 방식을 탭해 주세요:**`,
              timestamp: new Date(),
              documentBuilderType: 'gov-wallet',
              documentBuilderStep: 1
            }
          ]);
        } else if (topic === 'phone-cancel') {
          setMessages(prev => [
            ...prev,
            {
              id: welcomeId,
              sender: 'assistant',
              text: `📱 **핸드폰 통신사 위약금 제로(0원) 해지 신청서 빌더**가 시작되었습니다!
              
대리점의 중도 해지 거부나 고의 지연을 돌파하고 본사 해지 센터에 직송하기 위한 대표 해지 신청 가이드와 신분증 사본 첨부 양식을 세팅해 드립니다.

**1단계: 가입하신 이동통신사는 어디인가요? (예: SKT, KT, LGU+, 알뜰폰 등)**`,
              timestamp: new Date(),
              documentBuilderType: 'phone-cancel',
              documentBuilderStep: 1
            }
          ]);
        }
      }
    };

    window.addEventListener('open-modu-assistant', handleOpenAssistant);
    return () => window.removeEventListener('open-modu-assistant', handleOpenAssistant);
  }, []);

  // Quick Chips Actions
  const handleChipClick = (actionText: string) => {
    handleSendMessage(actionText);
  };

  // Format Date cleanly
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Convert rich text bold (**text**) to standard bolding safely
  const renderMessageText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-end transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Sliding Main Panel */}
      <div className={`relative w-full sm:w-[480px] bg-white h-screen flex flex-col shadow-2xl border-l border-slate-100 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header (Premium Gradient Back-panel) */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 text-white px-5 py-4.5 flex flex-col space-y-3 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-white/10 rounded-xl border border-white/15 shadow-inner">
                <Sparkles className="h-5 w-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight flex items-center gap-1.5">
                  모두의비서 <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full font-bold">LIVE AGENT</span>
                </h3>
                <p className="text-[11px] text-indigo-100 font-medium">실시간 통합 지식 그라운딩 서비스</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Sub Tab Switcher: Chat vs Tracker */}
          <div className="flex bg-black/15 p-1 rounded-xl">
            <button
              onClick={() => setCurrentTab('chat')}
              className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentTab === 'chat' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-100 hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 inline mr-1.5" />
              AI 비서 대화방
            </button>
            <button
              onClick={() => setCurrentTab('tracker')}
              className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer relative ${
                currentTab === 'tracker' ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-100 hover:text-white'
              }`}
            >
              <Clock className="h-3.5 w-3.5 inline mr-1.5" />
              내 실시간 문의 추적
              {userInquiries.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-black text-[9px] h-4 w-4 flex items-center justify-center rounded-full animate-bounce">
                  {userInquiries.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content 1: Chat Interface */}
        {currentTab === 'chat' && (
          <>
            {/* Messages Flow Area */}
            <div className="flex-grow overflow-y-auto px-5 py-6 space-y-5 bg-slate-50/50">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    
                    {/* Bot Avatar */}
                    {msg.sender === 'assistant' && (
                      <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 border border-indigo-200">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-sm'
                    }`}>
                      <div className="whitespace-pre-line relative group">
                        {msg.sender === 'assistant' && (
                          <button
                            onClick={() => {
                              if (generatingTtsMsgId === msg.id) return;
                              speakMessage(msg.id, msg.text, msg.podcastScript);
                            }}
                            className={`absolute -top-1.5 -right-1.5 p-1 rounded-lg border transition-all cursor-pointer ${
                              speakingMsgId === msg.id 
                                ? 'bg-red-50 border-red-200 text-red-500 animate-pulse' 
                                : generatingTtsMsgId === msg.id
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-500'
                                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                            }`}
                            disabled={generatingTtsMsgId === msg.id}
                            title="음성 읽기 (Gemini TTS)"
                          >
                            {generatingTtsMsgId === msg.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            ) : speakingMsgId === msg.id ? (
                              <VolumeX className="h-3.5 w-3.5" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                        <div className={msg.sender === 'assistant' ? "pr-6" : ""}>
                          {renderMessageText(msg.text)}
                        </div>

                        {/* 🎙️ 2인조 AI 미니 팟캐스트 대본 카드 시각화 (온디맨드 제미나이 호출 및 로딩 스피너 포함) */}
                        {msg.sender === 'assistant' && (
                          <div className="mt-3">
                            {generatingPodcastMsgId === msg.id ? (
                              /* 1. 로딩 / 생성 진행률 상태 */
                              <div className="p-4 bg-indigo-50/50 border border-indigo-150 rounded-xl space-y-3 text-center animate-pulse">
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                  <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                                    Gemini 3.5 팟캐스트 합성 및 이퀄라이저 구성 중...
                                  </span>
                                </div>
                                <div className="text-[9px] font-bold text-indigo-500/90 font-mono bg-white px-2 py-1.5 rounded border border-indigo-100 shadow-3xs">
                                  {generationStep}
                                </div>
                              </div>
                            ) : msg.podcastScript && msg.podcastScript.length > 0 ? (
                              /* 2. 대본 완성 상태 (재생/정지 이퀄라이저 제어) */
                              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2.5 text-left animate-in fade-in">
                                <div className="flex items-center justify-between border-b border-indigo-100/50 pb-2">
                                  <div className="flex items-center space-x-1 text-[10px] font-black text-indigo-700 uppercase">
                                    <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                                    <span>2인조 AI 실시간 팟캐스트</span>
                                  </div>
                                  <button
                                    onClick={() => handleGenerateOnDemandPodcast(msg.id, msg.text, msg.podcastScript)}
                                    className={`px-2.5 py-1 rounded-lg font-black text-[10px] flex items-center gap-1 transition-all shadow-xs border cursor-pointer shrink-0 ${
                                      speakingMsgId === msg.id && activePodcastMsgId === msg.id
                                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                        : 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white hover:from-indigo-700 hover:to-purple-700'
                                    }`}
                                  >
                                    {speakingMsgId === msg.id && activePodcastMsgId === msg.id ? (
                                      <>
                                        <VolumeX className="h-3 w-3 shrink-0" />
                                        <span>방송 일시정지</span>
                                      </>
                                    ) : (
                                      <>
                                        <Volume2 className="h-3 w-3 shrink-0" />
                                        <span>고음질 오디오 재생</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* Glowing Audio Waves Equalizer / Visualizer */}
                                {speakingMsgId === msg.id && activePodcastMsgId === msg.id && (
                                  <div className="flex items-center space-x-1 justify-center h-6 my-2 bg-indigo-50/40 rounded-lg py-1 px-3 border border-indigo-150">
                                    <span className="text-[8px] font-black text-indigo-500 animate-pulse uppercase mr-2 tracking-wider">🎙️ LIVE SHOW</span>
                                    {[...Array(12)].map((_, idx) => (
                                      <div
                                        key={idx}
                                        className="w-1 bg-gradient-to-t from-indigo-500 to-purple-600 rounded-full animate-pulse"
                                        style={{
                                          animationDelay: `${idx * 0.08}s`,
                                          animationDuration: `${0.45 + Math.random() * 0.6}s`,
                                          height: '100%',
                                          maxHeight: '14px'
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}

                                <div className="space-y-1.5 pt-1.5">
                                  {msg.podcastScript.map((line, lIdx) => {
                                    const isMinwoo = line.speaker === '민우' || line.speaker === 'Host A' || line.speaker === 'A';
                                    const isActive = activePodcastMsgId === msg.id && currentPodcastLineIdx === lIdx;
                                    return (
                                      <div 
                                        key={lIdx} 
                                        className={`text-[10px] leading-relaxed transition-all duration-300 ${
                                          isActive 
                                            ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-l-2 border-indigo-600 px-2.5 py-1.5 shadow-sm font-bold text-slate-900 rounded-r-lg scale-[1.01]' 
                                            : 'opacity-70 px-2 py-0.5'
                                        }`}
                                      >
                                        <strong className={`font-black mr-1 ${isMinwoo ? 'text-blue-700' : 'text-purple-700'}`}>
                                          [{line.speaker}]
                                        </strong>
                                        <span className="text-slate-700 font-medium">{line.text}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              /* 3. 대본 미작성 / 온디맨드 팟캐스트 유도 상태 */
                              <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2 text-left animate-in fade-in">
                                <div className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                  📢 법령과 안내글이 너무 기시죠? 제미나이를 즉석 호출해 **15초 요약 2인조 팟캐스트**로 한눈에 감상해 보세요!
                                </div>
                                <div className="flex justify-end pt-1">
                                  <button
                                    onClick={() => handleGenerateOnDemandPodcast(msg.id, msg.text)}
                                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border border-indigo-500 hover:from-indigo-700 hover:to-indigo-800 font-black text-[10px] flex items-center gap-1 cursor-pointer transition-all shadow-2xs hover:shadow-xs active:scale-95 shrink-0"
                                  >
                                    <Sparkles className="h-3 w-3 shrink-0 animate-pulse text-indigo-200" />
                                    <span>2인조 팟캐스트 즉석 생성</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 📲 Render Interactive Gov Wallet Integration buttons if triggered */}
                      {msg.documentBuilderType === 'gov-wallet' && (
                        <div className="mt-3.5 border border-indigo-150 bg-indigo-50/20 p-4 rounded-2xl shadow-3xs space-y-3 max-w-[95%] text-left animate-in fade-in zoom-in-95">
                          <div className="text-[11px] font-black text-slate-800 flex items-center space-x-1.5">
                            <Database className="h-4 w-4 text-indigo-600 animate-pulse" />
                            <span className="font-extrabold text-indigo-950">정부24 전자정부 문서지갑 연동</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                            <button 
                              type="button"
                              onClick={() => handleGovWalletSubmit('주민등록초본.pdf', '네이버 전자문서지갑')}
                              className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all cursor-pointer text-left space-y-1 block shadow-3xs"
                            >
                              <span className="font-black text-emerald-600 block">🟢 네이버 전자문서지갑 연동</span>
                              <span className="text-[10px] text-slate-400 font-medium leading-relaxed block">주민등록초본 및 입증서 즉시 발송</span>
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleGovWalletSubmit('건축물대장.pdf', '카카오 전자문서지갑')}
                              className="p-3 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-xl transition-all cursor-pointer text-left space-y-1 block shadow-3xs"
                            >
                              <span className="font-black text-amber-600 block">🟡 카카오 전자문서지갑 연동</span>
                              <span className="text-[10px] text-slate-400 font-medium leading-relaxed block">건축물대장 민원 공고서 즉시 발송</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 🚀 Render Grounding Sources (근거 출처 표시) */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100/90 space-y-1.5">
                          <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-500">
                            <div className="flex items-center gap-1">
                              <Database className="h-3 w-3 text-indigo-500 shrink-0" />
                              <span className="text-slate-600">답변 근거 데이터 출처</span>
                              <span className="bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.2 rounded text-[9px] border border-indigo-100">
                                {msg.sources.length}건
                              </span>
                            </div>
                            <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                              <CheckCircle2 className="h-2.5 w-2.5" /> 실시간 DB 검증
                            </span>
                          </div>

                          <div className="space-y-1">
                            {msg.sources.map((src, sIdx) => {
                              const isPartner = src.collection === 'partners';
                              const isInsight = src.collection === 'consumer_insights';
                              const isAlert = src.collection === 'public_alerts';
                              return (
                                <div 
                                  key={sIdx}
                                  className="bg-slate-50/80 hover:bg-indigo-50/40 border border-slate-200/60 rounded-lg p-1.5 text-[10px] flex items-center justify-between gap-2 transition-colors"
                                  title={`문서 식별자: ${src.docId}`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <span className={`shrink-0 px-1.5 py-0.2 rounded font-black text-[8px] border uppercase ${
                                      isPartner 
                                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                        : isInsight 
                                        ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                        : isAlert 
                                        ? 'bg-red-50 text-red-700 border-red-200' 
                                        : 'bg-purple-50 text-purple-700 border-purple-200'
                                    }`}>
                                      {src.collectionName || (isPartner ? '안심제휴처' : isInsight ? '법률상식' : isAlert ? '모두의알림' : '나의문의')}
                                    </span>
                                    <span className="font-semibold text-slate-800 truncate">
                                      {src.title}
                                    </span>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-1 font-mono text-[9px] text-slate-500 bg-white px-1.5 py-0.2 rounded border border-slate-200 shadow-2xs">
                                    <span className="text-slate-400 font-sans text-[8px]">ID:</span>
                                    <span className="font-bold text-slate-700 select-all">
                                      {src.docId}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className={`text-[9px] mt-1.5 text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* 🚀 Render INTERACTIVE PARTNER CARD if triggered */}
                  {msg.partnerCard && (
                    <div className="ml-8 border border-slate-100 bg-white p-4.5 rounded-2xl shadow-xs space-y-3 max-w-[85%] animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs">{msg.partnerCard.name}</span>
                            <span className="text-[10px] text-slate-400 block">{msg.partnerCard.category === 'restaurant' ? '외식/다이닝' : msg.partnerCard.category === 'shopping' ? '쇼핑/이커머스' : '서비스제휴'}</span>
                          </div>
                        </div>
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
                          공식 안심제휴망
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[11px]">
                        <div className="flex items-center space-x-1.5 text-slate-500">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{msg.partnerCard.phone}</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-500 justify-end">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{msg.partnerCard.avgResponse}</span>
                        </div>
                      </div>

                      <a 
                        href={`tel:${msg.partnerCard.phone}`}
                        className="w-full flex items-center justify-center space-x-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>핫라인 직통 통화 걸기</span>
                      </a>
                    </div>
                  )}

                  {/* 🚀 Render INTERACTIVE AUTOFILL PREVIEW FORM CARD if triggered */}
                  {msg.autofillForm && (
                    <div className="ml-8 border-2 border-indigo-200 bg-indigo-50/50 p-4.5 rounded-2xl shadow-sm space-y-3.5 max-w-[85%] animate-fade-in relative overflow-hidden">
                      {/* Badge decorative */}
                      <div className="absolute top-0 right-0 bg-indigo-600 text-white font-black text-[8px] px-2 py-0.8 rounded-bl-lg">
                        AI 신속 자동 작성
                      </div>

                      <div className="flex items-center space-x-1.5 pb-2 border-b border-indigo-100">
                        <FileText className="h-4 w-4 text-indigo-600" />
                        <span className="font-extrabold text-xs text-indigo-900">1:1 공식 민원 분쟁 대리접수 신청서</span>
                      </div>

                      {/* Preview fields */}
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] text-indigo-500 block font-semibold uppercase">분류 추천</span>
                          <span className="font-bold text-slate-800">
                            [{CATEGORY_MAP[msg.autofillForm.parentCategory]?.label || '기타'}] {msg.autofillForm.subCategory}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-500 block font-semibold uppercase">추천 문의 제목</span>
                          <span className="font-bold text-slate-900">{msg.autofillForm.title}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-indigo-500 block font-semibold uppercase">구조화된 피해 요약</span>
                          <p className="text-slate-600 bg-white p-2 rounded-lg border border-indigo-100 text-[11px] leading-relaxed max-h-[140px] overflow-y-auto">
                            {msg.autofillForm.content}
                          </p>
                        </div>
                      </div>

                      {/* Submit Action */}
                      {submitSuccessId === msg.id ? (
                        <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-lg border border-emerald-200 flex items-center justify-center space-x-1.5 text-xs font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>소비자 안심망 공식 접수 승인 완료!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAutoSubmitInquiry(msg.id, msg.autofillForm)}
                          disabled={isSubmittingInquiry === msg.id}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                        >
                          {isSubmittingInquiry === msg.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin" />
                              <span>접수 보안 채널 인서트 중...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              <span>이 내용으로 즉시 공식 접수 승인</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex items-start space-x-2.5 animate-pulse">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg border border-indigo-200">
                    <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
                    <span className="text-xs text-slate-400 font-medium">모두의비서가 DB 지식을 실시간 융합 중입니다...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Smart Recommendation Chips Panel */}
            <div className="px-5 py-3 border-t border-slate-100 bg-white flex flex-wrap gap-2 overflow-x-auto select-none">
              <button 
                onClick={() => handleChipClick("배달음식 파손/이물질 분쟁 시 제휴사 핫라인 번호가 어떻게 돼?")}
                className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-full border border-slate-200/50 transition-colors cursor-pointer"
              >
                🛵 제휴망 대처 가이드
              </button>
              <button 
                onClick={() => handleChipClick("소비자기본법 기반 최신 헬스장 위약금 환불 상식 알려줘")}
                className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-full border border-slate-200/50 transition-colors cursor-pointer"
              >
                🏋️ 위약금 환불 수칙
              </button>
              <button 
                onClick={() => handleChipClick("최근 정부나 지자체에서 배포한 긴급 고지 경보 보여줘")}
                className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-full border border-slate-200/50 transition-colors cursor-pointer"
              >
                ⚠️ 최근 피해 주의보
              </button>
              <button 
                onClick={() => handleChipClick("내가 보낸 민원들의 진행 상태를 전체적으로 분석 요약해줘")}
                className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-full border border-slate-200/50 transition-colors cursor-pointer"
              >
                📑 내 문의 상태 요약
              </button>
            </div>

            {/* Toast Notification Banner inside drawer */}
            {toastMessage && (
              <div className="mx-5 my-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 text-[10px] font-bold border border-slate-800 animate-in fade-in slide-in-from-bottom-2 shrink-0">
                <Zap className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            {/* Chat Input Bar */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-3 shrink-0">
              
              {isMicBlocked && (
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between text-[11px] text-amber-950 animate-in fade-in slide-in-from-bottom-2">
                  <span className="flex items-center space-x-1.5 font-semibold">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>샌드박스 보안 차단으로 마이크 음성 인식이 제한됩니다. 키보드 타이핑을 이용해 주세요!</span>
                  </span>
                  <button 
                    onClick={() => setIsMicBlocked(false)}
                    className="p-0.5 hover:bg-amber-150 rounded text-amber-700 cursor-pointer shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              
              {/* Voice Interaction Status & Continuous Switch */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                  <span className={`h-2 w-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : speakingMsgId ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`} />
                  <span className="text-[10px] font-bold text-slate-500">
                    {isListening 
                      ? '🎙️ 실시간 내 목소리 감지 중...' 
                      : speakingMsgId 
                      ? '🔊 모두의비서 음성 안내 중...'
                      : isSending 
                      ? '🔮 비서가 해결책 생각 중...' 
                      : '👋 대기 중 (음성인식 마이크 준비)'}
                  </span>
                </div>

                <label className="flex items-center space-x-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isContinuousVoiceMode}
                    onChange={(e) => {
                      setIsContinuousVoiceMode(e.target.checked);
                      if (!e.target.checked) {
                        if ('speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                        setSpeakingMsgId(null);
                      } else {
                        showToast("🔊 양방향 실시간 핸즈프리 보이스 대화 모드가 활성화되었습니다!");
                      }
                    }}
                    className="accent-indigo-600 h-3 w-3 rounded cursor-pointer"
                  />
                  <span className="text-[10px] font-black text-indigo-600 flex items-center gap-0.5">
                    🔊 양방향 실시간 보이스
                  </span>
                </label>
              </div>

              <div className="flex items-center space-x-2">
                {/* Voice Record Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-3 rounded-xl transition-all shadow-xs cursor-pointer border shrink-0 ${
                    isListening 
                      ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' 
                      : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                  }`}
                  title={isListening ? "음성 인식 중지" : "음성 인식 시작"}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={isListening ? "말씀해 주시면 자동으로 텍스트 변환됩니다..." : "비서에게 무엇이든 친절하게 질문하세요..."}
                  className={`flex-grow bg-slate-100 text-xs rounded-xl px-4 py-3 border-none focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-800 font-medium ${
                    isListening ? 'placeholder-red-400 font-bold bg-red-50/20' : ''
                  }`}
                  disabled={isListening}
                />
                
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending || isListening}
                  className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl transition-all shadow-sm cursor-pointer shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Tab Content 2: Real-time Inquiry Tracker */}
        {currentTab === 'tracker' && (
          <div className="flex-grow overflow-y-auto px-5 py-6 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-500 uppercase">내 문의 해결 현황 ({userInquiries.length}건)</span>
              <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">실시간 DB 추적</span>
            </div>

            {userInquiries.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
                <h4 className="text-xs font-extrabold text-slate-800">아직 접수하신 문의 내역이 없습니다.</h4>
                <p className="text-[10px] text-slate-400">비서 대화방에 불편사항을 하소연해 주시면 제가 대리접수해 드립니다!</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {userInquiries.map((inq) => {
                  const hasReply = inq.status === 'replied';
                  return (
                    <div 
                      key={inq.id} 
                      className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-lg">
                          {CATEGORY_MAP[inq.parentCategory]?.label || '기타'}
                        </span>
                        
                        {/* Status styling */}
                        {inq.status === 'replied' ? (
                          <span className="text-[10px] text-emerald-700 font-black bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="h-3 w-3" /> 해결 완료 (답변완료)
                          </span>
                        ) : inq.status === 'routing' ? (
                          <span className="text-[10px] text-blue-700 font-black bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            <RefreshCw className="h-3 w-3 animate-spin" /> 제휴사 이송 중
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-700 font-black bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                            접수 대기 중
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-1">{inq.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">접수번호: {inq.id}</p>
                      </div>

                      {/* Real-time details or assignee */}
                      {inq.assignedPartnerName && (
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>지정 해결점: <strong>{inq.assignedPartnerName}</strong> (핫라인 파트너)</span>
                        </div>
                      )}

                      {/* Reply preview if answered */}
                      {hasReply && inq.reply && (
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/60 space-y-1.5 text-[11px]">
                          <span className="font-bold text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 제휴 답변 피드백:
                          </span>
                          <p className="text-slate-700 leading-relaxed max-h-[80px] overflow-y-auto whitespace-pre-line italic">
                            "{inq.reply.content}"
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
