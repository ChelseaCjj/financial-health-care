import React, { useState, useRef, useEffect } from 'react';
import { AnalysisData, FileData, HealthStatus, ChatMessage, Language } from './types';
import FileUpload from './components/FileUpload';
import TrafficLight from './components/TrafficLight';
import { analyzeFinancialReport, createFinancialChat } from './services/geminiService';
import { Chat } from '@google/genai';

function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [file, setFile] = useState<FileData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Translation Dictionary
  const translations = {
    en: {
      appName: "Dr. Meow",
      appSubtitle: "Financial Checkup",
      startOver: "Check Another",
      heroTitle: "Is your company healthy?",
      heroDesc: "Dr. Meow will sniff out the risks! Upload your PDF financial report for a purr-fessional diagnosis.",
      steps: {
        upload: "Feed PDF",
        status: "Diagnosis",
        ask: "Ask Dr. Meow"
      },
      analyzingTitle: "Sniffing the numbers...",
      analyzingDesc: "Dr. Meow is checking the kibble reserves (Cash Flow) and mouse catch rate (Profit).",
      statusHealthy: "Purr-fectly Healthy!",
      statusUnhealthy: "Hisss! High Risk",
      statusCaution: "Caution needed",
      statusUnknown: "Meow? Unknown",
      analysisComplete: "Diagnosis Ready",
      keyIndicators: "Dr. Meow's Key Findings",
      chatHeader: "Chat with Dr. Meow",
      aiBadge: "AI Expert",
      chatWelcome: "👋 Meow! I've studied the report.",
      chatWelcomeSub: "Ask me anything about the money situation!",
      chatError: "Sorry, I got distracted by a laser pointer. Try again?",
      placeholder: "Ask about profit, debt, etc...",
      footer: "Made with 🐟 by Gemini AI",
      alertError: "Hisss! I couldn't read that file. Try a cleaner PDF.",
      colHeaderTerm: "Professional Term",
      colHeaderMeta: "Dr. Meow's Explanation"
    },
    zh: {
      appName: "喵博士",
      appSubtitle: "企业财务体检",
      startOver: "重新体检",
      heroTitle: "你的企业健康吗？",
      heroDesc: "把财报交给喵博士！我会帮你嗅出风险，用猫咪都能听懂的话为你分析。",
      steps: {
        upload: "投喂财报",
        status: "获取诊断",
        ask: "咨询喵博士"
      },
      analyzingTitle: "正在嗅探数据...",
      analyzingDesc: "喵博士正在检查猫粮储备（现金流）和捕鼠效率（利润）...",
      statusHealthy: "健康得像只小老虎！",
      statusUnhealthy: "哈气！有危险",
      statusCaution: "需要小心",
      statusUnknown: "喵？未知状态",
      analysisComplete: "诊断报告",
      keyIndicators: "喵博士的关键发现",
      chatHeader: "咨询喵博士",
      aiBadge: "AI 专家",
      chatWelcome: "👋 喵！报告看完了！",
      chatWelcomeSub: "关于钱的事，尽管问我！",
      chatError: "抱歉，我刚刚去抓蝴蝶了。请再试一次？",
      placeholder: "输入您的问题...",
      footer: "Made with 🐟 by Gemini AI",
      alertError: "嘶——！文件看不清，请换个清晰的 PDF 试试。",
      colHeaderTerm: "专业指标",
      colHeaderMeta: "喵言喵语解读"
    }
  };

  const t = translations[language];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (uploadedFile: FileData) => {
    setFile(uploadedFile);
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setMessages([]);

    try {
      const result = await analyzeFinancialReport(uploadedFile.base64, uploadedFile.mimeType, language);
      setAnalysisResult(result);
      const session = createFinancialChat(uploadedFile.base64, uploadedFile.mimeType, language);
      setChatSession(session);
    } catch (error) {
      console.error("Analysis failed", error);
      alert(t.alertError);
      setFile(null); 
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !chatSession) return;

    const userMsg: ChatMessage = { role: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatSending(true);

    try {
      const result = await chatSession.sendMessage({ message: userMsg.text });
      const botResponseText = result.text || "Meow?";
      setMessages(prev => [...prev, { role: 'model', text: botResponseText }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages(prev => [...prev, { role: 'model', text: t.chatError }]);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetApp = () => {
    setFile(null);
    setAnalysisResult(null);
    setChatSession(null);
    setMessages([]);
  };

  const getStatusColor = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.HEALTHY: return 'text-green-700 bg-green-100 border-green-200';
      case HealthStatus.UNHEALTHY: return 'text-red-700 bg-red-100 border-red-200';
      case HealthStatus.CAUTION: return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getMetricStatusIcon = (status: string) => {
      const s = status.toLowerCase();
      if (s === 'good') return '✅';
      if (s === 'bad') return '⚠️';
      return 'ℹ️';
  }

  const getStatusTitle = (status: HealthStatus) => {
    switch (status) {
        case HealthStatus.HEALTHY: return t.statusHealthy;
        case HealthStatus.UNHEALTHY: return t.statusUnhealthy;
        case HealthStatus.CAUTION: return t.statusCaution;
        default: return t.statusUnknown;
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-slate-800 font-sans selection:bg-orange-200">
      
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
          <div className="absolute top-10 left-10 text-6xl rotate-12 opacity-20">🐱</div>
          <div className="absolute top-40 right-20 text-4xl -rotate-12 opacity-20">🐟</div>
          <div className="absolute bottom-20 left-40 text-8xl rotate-45 opacity-10">🐾</div>
          <div className="absolute bottom-10 right-10 text-6xl -rotate-6 opacity-20">🧶</div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-12 bg-white/60 backdrop-blur-sm p-4 rounded-full border border-orange-100 sticky top-4 shadow-sm z-50">
          <div className="flex items-center gap-3 pl-2">
            <div className="bg-orange-500 p-2 rounded-full shadow-md text-white">
               <span className="text-2xl">😺</span>
            </div>
            <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800 leading-none">
                {t.appName}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-orange-600/80">{t.appSubtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 rounded-full p-1 flex">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('zh')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'zh' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                中文
              </button>
            </div>

            {analysisResult && (
              <button 
                onClick={resetApp}
                className="hidden sm:block text-sm font-bold text-slate-500 hover:text-orange-600 hover:underline transition px-3"
              >
                {t.startOver}
              </button>
            )}
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center w-full">
          
          {/* State 1: Upload Hero */}
          {!file && !isAnalyzing && (
            <div className="w-full flex flex-col items-center animate-fade-in-up my-auto">
               <div className="relative mb-8">
                   <div className="w-40 h-40 bg-orange-100 rounded-full flex items-center justify-center text-8xl shadow-inner border-4 border-white">
                       😼
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-100 text-sm font-bold text-slate-700 animate-bounce">
                       {language === 'zh' ? "准备好了吗？" : "Ready?"}
                   </div>
               </div>
              <h2 className="text-4xl sm:text-5xl font-black text-slate-800 text-center mb-6 tracking-tight">{t.heroTitle}</h2>
              <p className="text-lg sm:text-xl text-slate-500 text-center mb-12 max-w-lg font-medium">
                {t.heroDesc}
              </p>
              
              <FileUpload onFileSelect={handleFileSelect} lang={language} />
              
              <div className="mt-16 flex gap-8 sm:gap-16 opacity-60">
                  <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-2 border border-slate-100">1</div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.steps.upload}</span>
                  </div>
                  <div className="w-16 border-t-2 border-dashed border-slate-300 mt-6 hidden sm:block"></div>
                  <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-2 border border-slate-100">2</div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.steps.status}</span>
                  </div>
                  <div className="w-16 border-t-2 border-dashed border-slate-300 mt-6 hidden sm:block"></div>
                  <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-2 border border-slate-100">3</div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">{t.steps.ask}</span>
                  </div>
              </div>
            </div>
          )}

          {/* State 2: Loading Analysis */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="relative">
                  <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_-10px_rgba(251,146,60,0.3)] mb-8 border-8 border-orange-50 animate-pulse">
                      <span className="text-8xl animate-bounce">🐈</span>
                  </div>
                  <span className="absolute bottom-10 right-0 text-4xl animate-spin">🔎</span>
              </div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">{t.analyzingTitle}</h2>
              <p className="text-slate-500 font-medium text-lg text-center max-w-md">{t.analyzingDesc}</p>
            </div>
          )}

          {/* State 3: Result Dashboard */}
          {analysisResult && !isAnalyzing && (
            <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-8 animate-fade-in pb-10">
              
              {/* Left Column: Result Details */}
              <div className="xl:col-span-7 flex flex-col gap-8">
                
                {/* 1. Hero Card with Traffic Light */}
                <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 shadow-xl border border-slate-100 relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-8 group hover:shadow-2xl transition-all">
                  
                  {/* Traffic Light Component */}
                  <div className="shrink-0 mt-2">
                    <TrafficLight status={analysisResult.status} />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1 text-center sm:text-left z-10">
                     <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 border ${getStatusColor(analysisResult.status)}`}>
                        <span>🩺</span> {t.analysisComplete}
                     </div>
                     <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4 leading-tight">
                        {getStatusTitle(analysisResult.status)}
                     </h2>
                     <div className="bg-slate-50 p-6 rounded-3xl rounded-tl-none border border-slate-100 relative">
                        <span className="absolute -top-3 -left-3 text-4xl transform -scale-x-100">😸</span>
                        <p className="text-slate-600 leading-relaxed font-medium text-lg italic">
                            "{analysisResult.summary}"
                        </p>
                     </div>
                  </div>
                </div>

                {/* 2. Detailed Metrics Cards */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-2xl font-black text-slate-800 px-2 flex items-center gap-3">
                        <span className="bg-orange-100 p-2 rounded-lg text-xl">📋</span> {t.keyIndicators}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {analysisResult.metrics.map((metric, index) => (
                             <div key={index} className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 hover:border-orange-200 transition-colors flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{metric.category}</span>
                                    <span className="text-lg">{getMetricStatusIcon(metric.status)}</span>
                                </div>
                                
                                <div>
                                    <h4 className="font-black text-slate-700 text-lg">{metric.term}</h4>
                                    <p className="text-orange-500 font-bold font-mono text-sm">{metric.value}</p>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-dashed border-slate-100">
                                    <div className="flex gap-2">
                                        <span className="text-2xl">🐱</span>
                                        <p className="text-sm text-slate-600 font-medium leading-snug bg-orange-50 p-3 rounded-xl rounded-tl-none">
                                            {metric.metaphor}
                                        </p>
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                </div>

              </div>

              {/* Right Column: Chat */}
              <div className="xl:col-span-5 h-[600px] xl:h-[800px] flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden sticky top-24">
                  {/* Chat Header */}
                  <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex items-center justify-between z-10">
                      <div className="flex items-center gap-3">
                          <div className="relative">
                             <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm">
                                 😽
                             </div>
                             <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-800 text-lg leading-tight">{t.chatHeader}</h3>
                              <p className="text-xs font-bold text-slate-400">{t.aiBadge}</p>
                          </div>
                      </div>
                  </div>
                  
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide bg-[#F8FAFC]">
                      {messages.length === 0 && (
                          <div className="text-center text-slate-400 mt-20 p-8">
                              <span className="text-6xl mb-4 block opacity-50">💭</span>
                              <p className="font-bold text-lg text-slate-600 mb-2">{t.chatWelcome}</p>
                              <p className="text-sm font-medium">{t.chatWelcomeSub}</p>
                          </div>
                      )}
                      {messages.map((msg, idx) => (
                          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                              {msg.role === 'model' && (
                                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm mr-2 mt-auto mb-1 shrink-0">😺</div>
                              )}
                              <div className={`
                                  max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm
                                  ${msg.role === 'user' 
                                      ? 'bg-slate-800 text-white rounded-br-none' 
                                      : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}
                              `}>
                                  {msg.text}
                              </div>
                          </div>
                      ))}
                      {isChatSending && (
                           <div className="flex justify-start">
                               <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm mr-2 mt-auto mb-1 shrink-0">😺</div>
                               <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 flex gap-2 shadow-sm">
                                   <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                                   <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-75"></div>
                                   <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce delay-150"></div>
                               </div>
                           </div>
                      )}
                      <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-white border-t border-slate-100">
                      <div className="flex gap-2 bg-slate-100 p-1 rounded-[1.5rem] pl-4 transition-all focus-within:ring-2 focus-within:ring-orange-200 focus-within:bg-white">
                          <input
                              type="text"
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyDown={handleKeyPress}
                              placeholder={t.placeholder}
                              className="flex-1 bg-transparent border-none text-slate-700 focus:outline-none placeholder-slate-400 font-medium"
                          />
                          <button 
                              onClick={handleSendMessage}
                              disabled={isChatSending || !inputMessage.trim()}
                              className="bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-90"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5 -translate-y-0.5">
                                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                              </svg>
                          </button>
                      </div>
                  </div>
              </div>

            </div>
          )}

        </main>
        
        {/* Footer */}
        <footer className="py-8 text-center opacity-60">
             <p className="text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
                 {t.footer}
             </p>
        </footer>

      </div>
    </div>
  );
}

export default App;