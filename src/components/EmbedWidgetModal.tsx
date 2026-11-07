import React, { useState } from 'react';
import { Code, Check, Copy, X, Terminal, ArrowRight } from 'lucide-react';

interface EmbedWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedWidgetModal: React.FC<EmbedWidgetModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const scriptCode = `<!-- 모두의문의 Universal Widget -->
<script 
  src="https://moduinquire.io/widget.js" 
  data-key="YOUR_MODUINQUIRE_API_KEY" 
  data-theme="light" 
  defer>
</script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-lg">모두의문의 1초 연동 가이드 (B2B)</h3>
              <p className="text-xs text-slate-500">당신의 웹사이트에 즉각 작동하는 실시간 문의 수집 폼을 추가하세요</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Step description */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-800">연동 방법</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                <div className="font-semibold text-indigo-600">Step 1</div>
                <div>HTML 파일의 &lt;head&gt; 혹은 &lt;body&gt; 하단에 아래 스크립트를 삽입합니다.</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                <div className="font-semibold text-indigo-600">Step 2</div>
                <div>발급된 고유 API 키가 담긴 data-key 속성을 채워넣습니다.</div>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg space-y-1">
                <div className="font-semibold text-indigo-600">Step 3</div>
                <div>자사몰 고객이 입력한 문의가 모두의문의 DB로 실시간 전송됩니다!</div>
              </div>
            </div>
          </div>

          {/* Code display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Terminal className="h-3.5 w-3.5 text-indigo-500" />
                <span>임베드 전용 스크립트 코드</span>
              </span>
              <button 
                onClick={copyToClipboard}
                className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-600">복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>코드 복사하기</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 rounded-lg text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 shadow-inner">
              <code>{scriptCode}</code>
            </pre>
          </div>

          {/* Benefits */}
          <div className="bg-indigo-50/50 rounded-lg p-4 text-xs text-indigo-900 space-y-2 border border-indigo-100/50">
            <span className="font-semibold text-indigo-950 block">💡 연동 완료 시 제공되는 독점 기능</span>
            <ul className="list-disc pl-4 space-y-1">
              <li>제휴 사이트로 유입된 질문을 감지해 전용 대시보드로 자동 분배 및 라우팅</li>
              <li>인공지능(AI)이 질문의 감정을 자동 진단하여 불만/불안 고객의 질문 우선순위 격상</li>
              <li>상대방 답변 완료 시 즉각적인 푸시 이메일 발송 자동화</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center border-t border-slate-100 px-6 py-4 bg-slate-50 space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg bg-white cursor-pointer"
          >
            닫기
          </button>
          <button 
            onClick={() => {
              alert('데모 제휴사 연동 가이드북 다운로드가 시작되었습니다 (가상).');
            }}
            className="flex items-center space-x-1 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
          >
            <span>상세 API 가이드북 (PDF)</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
