
import React, { useState } from 'react';
import { AppState, AnswerPair } from './types';
import { QUESTIONS } from './constants';
import { getCompatibilityAnalysis, getInstantFeedback } from './geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<AppState>(AppState.START);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerPair[]>([]);
  const [currentMattiaAnswer, setCurrentMattiaAnswer] = useState('');
  const [currentAmaliaAnswer, setCurrentAmaliaAnswer] = useState('');
  
  const [isShowingInstantFeedback, setIsShowingInstantFeedback] = useState(false);
  const [instantFeedbackText, setInstantFeedbackText] = useState('');
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // --- Quiz Logic ---
  const nextOnboarding = () => setOnboardingStep(prev => prev + 1);
  const startQuiz = () => setGameState(AppState.QUIZ);

  const handleShowFeedback = async () => {
    setIsLoadingFeedback(true);
    setIsShowingInstantFeedback(true);
    const feedback = await getInstantFeedback(
      QUESTIONS[currentQuestionIndex].text.replace(/<[^>]*>?/gm, ''),
      currentMattiaAnswer,
      currentAmaliaAnswer
    );
    setInstantFeedbackText(feedback);
    setIsLoadingFeedback(false);
  };

  const handleConfirmNext = () => {
    const newAnswer: AnswerPair = {
      questionId: QUESTIONS[currentQuestionIndex].id,
      userAnswer: currentMattiaAnswer,
      amaliaAnswer: currentAmaliaAnswer,
    };

    setAnswers([...answers, newAnswer]);
    setCurrentMattiaAnswer('');
    setCurrentAmaliaAnswer('');
    setIsShowingInstantFeedback(false);
    setInstantFeedbackText('');

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState(AppState.RESULTS);
    }
  };

  const generateAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setGameState(AppState.ANALYSIS);
    const result = await getCompatibilityAnalysis(answers, QUESTIONS);
    setAnalysisResult(result);
    setIsLoadingAnalysis(false);
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex) / QUESTIONS.length) * 100;

  const getCategoryConfig = (category: string) => {
    const iconBase = "w-4 h-4";
    switch(category) {
      case 'Passion': return { 
        theme: 'bg-orange-50 text-orange-600 border-orange-100', 
        icon: <svg className={iconBase} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.45 4.96L20 7.71l-4.36 4.25L16.64 18 12 15.27 7.36 18l1-6.04L4 7.71l5.55-.75L12 2z"/></svg> 
      };
      case 'Sentimental': return { 
        theme: 'bg-rose-50 text-rose-600 border-rose-100', 
        icon: <svg className={iconBase} fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg> 
      };
      case 'Future': return { 
        theme: 'bg-indigo-50 text-indigo-600 border-indigo-100', 
        icon: <svg className={iconBase} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg> 
      };
      default: return { 
        theme: 'bg-blue-50 text-blue-600 border-blue-100', 
        icon: <svg className={iconBase} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> 
      };
    }
  };

  const categoryConfig = getCategoryConfig(currentQuestion.category);

  return (
    <div className="min-h-screen flex flex-col items-center selection:bg-rose-100 px-4">
      {/* Dynamic Background Ornament */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] md:w-[50%] h-[70%] bg-rose-100/40 rounded-full blur-[80px] md:blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] md:w-[50%] h-[70%] bg-indigo-100/30 rounded-full blur-[80px] md:blur-[120px]"></div>
      </div>

      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center py-6 md:py-10">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-premium border border-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-rose-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 leading-none">Resonance</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 font-bold mt-1">Curated by Mattia</p>
          </div>
        </div>

        {gameState === AppState.QUIZ && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{currentQuestionIndex + 1}/{QUESTIONS.length}</span>
            <div className="w-24 md:w-36 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-400 transition-all duration-1000 cubic-bezier(0.23, 1, 0.32, 1)"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </header>

      <main className="w-full max-w-4xl flex-1 flex flex-col justify-start pb-10">
        {gameState === AppState.START && (
          <div className="glass-card rounded-[32px] md:rounded-[48px] p-8 md:p-16 text-center animate-fade-in max-w-2xl mx-auto mt-4 shadow-premium">
            {onboardingStep === 0 ? (
              <div className="space-y-6 md:space-y-8 animate-fade-in">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-[1.2] tracking-tight">
                  Hi Amalia, I have a <span className="accent-font text-rose-500/80">surprise</span> for you.
                </h2>
                <p className="text-base md:text-lg text-gray-500 leading-relaxed font-light">
                  I built this entire application in just <span className="font-semibold text-gray-800">5 minutes</span> using my custom software. I wanted to create something beautiful for us.
                </p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={nextOnboarding}
                    className="premium-button w-full md:w-auto px-10 py-4 md:px-14 md:py-5 bg-gray-900 text-white rounded-2xl font-bold shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-3 mx-auto"
                  >
                    See what it's for
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8 animate-fade-in">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Our Connection Experiment</h2>
                <p className="text-base md:text-lg text-gray-500 leading-relaxed font-light">
                  This site is designed to help us understand each other better. We will answer 20 questions together, exploring our passions and our future.
                </p>
                <p className="text-sm md:text-md text-gray-400 italic">
                  Let's see how our hearts align, step by step.
                </p>
                <button 
                  onClick={startQuiz}
                  className="premium-button w-full md:w-auto px-10 py-4 md:px-14 md:py-5 bg-rose-500 text-white rounded-2xl font-bold shadow-2xl hover:bg-rose-600 transition-all flex items-center justify-center gap-3 mx-auto"
                >
                  Start the Journey
                </button>
              </div>
            )}
          </div>
        )}

        {gameState === AppState.QUIZ && (
          <div className="animate-fade-in space-y-6 md:space-y-10 mt-2">
            <div className={`glass-card rounded-[32px] md:rounded-[48px] p-6 md:p-16 transition-all duration-700 ${isShowingInstantFeedback ? 'ring-2 ring-rose-100' : 'shadow-premium'}`}>
              {!isShowingInstantFeedback ? (
                <>
                  <div className="flex flex-col items-center mb-8 md:mb-14">
                    <span className={`category-pill px-5 py-2 rounded-full text-[10px] md:text-[11px] font-medium uppercase border mb-6 md:mb-8 transition-all flex items-center gap-2 tracking-wider ${categoryConfig.theme}`}>
                      {categoryConfig.icon}
                      {currentQuestion.category}
                    </span>
                    <h3 
                      className="text-2xl md:text-5xl font-bold text-center text-gray-900 leading-[1.25] md:leading-[1.15] max-w-3xl tracking-tight"
                      dangerouslySetInnerHTML={{ __html: currentQuestion.text }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-3 md:space-y-5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mattia</label>
                      </div>
                      <textarea 
                        value={currentMattiaAnswer}
                        onChange={(e) => setCurrentMattiaAnswer(e.target.value)}
                        placeholder="My reflection..."
                        className="input-stationery w-full h-32 md:h-44 p-5 md:p-7 rounded-[24px] md:rounded-[32px] focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all resize-none text-gray-800 placeholder-gray-300 leading-relaxed text-base md:text-lg font-medium"
                      />
                    </div>
                    <div className="space-y-3 md:space-y-5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amalia</label>
                      </div>
                      <textarea 
                        value={currentAmaliaAnswer}
                        onChange={(e) => setCurrentAmaliaAnswer(e.target.value)}
                        placeholder="Amalia's voice..."
                        className="input-stationery w-full h-32 md:h-44 p-5 md:p-7 rounded-[24px] md:rounded-[32px] focus:ring-4 focus:ring-rose-50 focus:border-rose-200 outline-none transition-all resize-none text-gray-800 placeholder-gray-300 leading-relaxed text-base md:text-lg font-medium"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-fade-in flex flex-col items-center py-6 md:py-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-50 rounded-2xl md:rounded-3xl flex items-center justify-center mb-8 md:mb-12 pulse-heart shadow-sm border border-rose-100">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-rose-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                  </div>

                  {isLoadingFeedback ? (
                    <div className="flex flex-col items-center space-y-6 md:space-y-8">
                      <div className="flex space-x-3">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                      </div>
                      <p className="text-gray-400 text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-black text-center px-4">AI Harmony Synthesis</p>
                    </div>
                  ) : (
                    <div className="text-center max-w-2xl space-y-8 md:space-y-10 px-2 md:px-4">
                      <h4 className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-black text-rose-400 mb-2">Resonance Feedback</h4>
                      <p className="text-xl md:text-4xl font-bold text-gray-900 italic leading-[1.4] tracking-tight">
                        "{instantFeedbackText}"
                      </p>
                      <div className="w-16 md:w-24 h-0.5 bg-gradient-to-r from-transparent via-rose-200 to-transparent mx-auto"></div>
                      <p className="text-gray-400 font-light text-sm md:text-base tracking-wide">Another layer of understanding discovered.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-center pt-2">
              {!isShowingInstantFeedback ? (
                <button 
                  disabled={!currentMattiaAnswer || !currentAmaliaAnswer}
                  onClick={handleShowFeedback}
                  className={`premium-button w-full md:w-auto px-10 py-5 md:px-16 md:py-6 rounded-[20px] md:rounded-[24px] font-bold text-lg md:text-xl shadow-premium transition-all flex items-center justify-center gap-3
                    ${(!currentMattiaAnswer || !currentAmaliaAnswer) 
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                      : 'bg-rose-500 text-white hover:bg-rose-600 active:scale-[0.98]'
                    }`}
                >
                  Verify Connection
                </button>
              ) : (
                <button 
                  disabled={isLoadingFeedback}
                  onClick={handleConfirmNext}
                  className="premium-button w-full md:w-auto px-10 py-5 md:px-16 md:py-6 bg-gray-900 text-white rounded-[20px] md:rounded-[24px] font-bold text-lg md:text-xl shadow-premium hover:bg-black transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                >
                  {currentQuestionIndex === QUESTIONS.length - 1 ? 'Reveal Our Story' : 'Continue Journey'}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {gameState === AppState.RESULTS && (
          <div className="glass-card rounded-[32px] md:rounded-[56px] p-8 md:p-24 text-center animate-fade-in max-w-3xl mx-auto mt-4 shadow-premium">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 md:mb-12 shadow-sm border border-green-100/50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-12 md:w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 md:mb-8 text-gray-900 tracking-tight">A Shared Masterpiece</h2>
            <p className="text-gray-500 mb-10 md:mb-14 leading-relaxed text-base md:text-xl font-light max-w-xl mx-auto">
              Mattia and Amalia, you've completed the full journey. Let's synthesize your connection into a beautiful analysis.
            </p>
            <div className="flex flex-col gap-4 items-center w-full max-w-sm mx-auto">
              <button 
                onClick={generateAnalysis}
                className="premium-button w-full px-8 py-4 md:px-12 md:py-6 bg-rose-500 text-white rounded-2xl md:rounded-3xl font-bold shadow-2xl hover:bg-rose-600 transition-all text-lg md:text-xl"
              >
                Synthesize Connection
              </button>
              <button 
                onClick={() => {
                  setAnswers([]);
                  setCurrentQuestionIndex(0);
                  setGameState(AppState.START);
                  setOnboardingStep(0);
                }}
                className="text-gray-400 text-xs hover:text-gray-700 font-bold uppercase tracking-[0.2em] transition-colors mt-2"
              >
                Restart Experience
              </button>
            </div>
          </div>
        )}

        {gameState === AppState.ANALYSIS && (
          <div className="animate-fade-in w-full mt-2">
            <div className="glass-card rounded-[32px] md:rounded-[56px] p-6 md:p-20 min-h-[500px] shadow-premium">
              {isLoadingAnalysis ? (
                <div className="flex flex-col items-center justify-center h-96 space-y-8">
                  <div className="relative w-16 h-16 md:w-24 md:h-24">
                    <div className="absolute inset-0 border-[2px] md:border-[3px] border-rose-50 rounded-full"></div>
                    <div className="absolute inset-0 border-[2px] md:border-[3px] border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-rose-500 font-black uppercase tracking-[0.4em] text-[9px] md:text-[10px] mb-2">Harmonizing Shared Values</p>
                    <p className="text-gray-400 font-light italic text-base md:text-lg tracking-wide px-4">Weaving Mattia and Amalia's story...</p>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in max-w-none">
                  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-6 md:gap-10">
                    <div className="space-y-3">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-[0.5em] font-black text-rose-500/60 block">Private Connection Dossier</span>
                      <h2 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tighter">Mattia <span className="accent-font text-rose-200">&</span> Amalia</h2>
                    </div>
                    <div className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] border-l-2 border-rose-100 pl-4 md:pl-6 pb-1">
                      {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent mb-10 md:mb-16"></div>

                  <div className="prose-custom text-gray-800 leading-[1.7] md:leading-[1.8] whitespace-pre-wrap text-lg md:text-xl font-light">
                    {analysisResult}
                  </div>

                  <div className="mt-16 md:mt-24 pt-10 md:pt-12 border-t border-gray-50 flex flex-col items-center gap-6 md:gap-10">
                    <button 
                      onClick={() => window.print()}
                      className="premium-button w-full md:w-auto px-10 py-4 md:px-12 md:py-5 bg-white text-gray-900 border border-gray-100 rounded-2xl font-bold text-sm shadow-premium flex items-center justify-center gap-3 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Preserve this Moment
                    </button>
                    <button 
                      onClick={() => setGameState(AppState.RESULTS)}
                      className="text-gray-300 text-[9px] md:text-[10px] hover:text-gray-600 transition-all uppercase tracking-[0.3em] font-black"
                    >
                      Back to Gallery
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-10 md:py-14 text-center">
        <p className="text-sm md:text-lg text-gray-400 font-light tracking-wide opacity-80 italic px-4">
          made by Mattia CEO of <a href="https://vibecodeapp.com" target="_blank" rel="noopener noreferrer" className="hover:text-rose-400 transition-colors underline decoration-rose-200">Vibecodeapp.com</a>
        </p>
      </footer>
    </div>
  );
};

export default App;
