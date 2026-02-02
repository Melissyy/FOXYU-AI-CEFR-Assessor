import React, { useState, useRef } from 'react';
import { QUESTIONS, SYSTEM_PROMPT } from './constants';
import { TranscriptionState, AssessmentResult } from './types';
import { transcribeAudio, assessEnglishLevel } from './services/gemini';
import { Mic, Square, CheckCircle, RefreshCcw, Loader2, Sparkles, MessageSquare, BookOpen, BrainCircuit } from 'lucide-react';

const App: React.FC = () => {
  const [states, setStates] = useState<TranscriptionState[]>(
    QUESTIONS.map(q => ({
      id: q.id,
      text: '',
      isRecording: false,
      audioBlob: null,
      status: 'idle'
    }))
  );
  
  const [currentStep, setCurrentStep] = useState(0);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async (id: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        updateState(id, { audioBlob: blob, status: 'transcribing', isRecording: false });
        
        try {
          const text = await transcribeAudio(blob);
          updateState(id, { text, status: 'completed' });
        } catch (error) {
          console.error("Transcription error", error);
          updateState(id, { status: 'idle' });
          alert("Transcription failed. Please try again.");
        }
      };

      mediaRecorder.start();
      updateState(id, { isRecording: true, status: 'recording' });
    } catch (err) {
      console.error("Error accessing microphone", err);
      alert("Please allow microphone access to record your answers.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const updateState = (id: number, updates: Partial<TranscriptionState>) => {
    setStates(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const resetState = (id: number) => {
    updateState(id, { text: '', isRecording: false, audioBlob: null, status: 'idle' });
  };

  const handleAssess = async () => {
    setIsAnalyzing(true);
    const transcripts = states.reduce((acc, s) => ({ ...acc, [s.id]: s.text }), {});
    
    try {
      const result = await assessEnglishLevel(transcripts, SYSTEM_PROMPT);
      setAssessment(result);
    } catch (err) {
      console.error(err);
      alert("Assessment failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const allCompleted = states.every(s => s.status === 'completed');

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-5xl mx-auto">
      {/* Header */}
      <header className="w-full text-center mb-12">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Sparkles className="text-indigo-400 w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Linguist<span className="text-indigo-400">AI</span>
          </h1>
        </div>
        <p className="text-slate-400 max-w-2xl mx-auto">
          An automated CEFR-based English assessment tool. 
          Record three distinct answers to find your proficiency level using Gemini's native multimodal intelligence.
        </p>
      </header>

      {/* Main Content */}
      <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Questions and Recording */}
        <div className="lg:col-span-7 space-y-6">
          {!assessment ? (
            QUESTIONS.map((q, idx) => {
              const state = states.find(s => s.id === q.id)!;
              const isActive = currentStep === idx;
              
              return (
                <div 
                  key={q.id}
                  className={`relative overflow-hidden transition-all duration-300 border rounded-2xl p-6 ${
                    isActive 
                      ? 'border-indigo-500/50 bg-slate-800/50 shadow-lg shadow-indigo-500/10 scale-[1.02]' 
                      : 'border-slate-700 bg-slate-900/30 opacity-60 cursor-pointer hover:opacity-80'
                  }`}
                  onClick={() => !assessment && setCurrentStep(idx)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        state.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {state.status === 'completed' ? <CheckCircle className="w-5 h-5" /> : q.id}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{q.title}</h3>
                        <p className="text-sm text-slate-400">{q.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 mb-6 italic text-slate-300 leading-relaxed">
                    "{q.prompt}"
                  </div>

                  {isActive && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        {state.status === 'idle' && (
                          <button
                            onClick={() => startRecording(q.id)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-all"
                          >
                            <Mic className="w-5 h-5" /> Start Recording
                          </button>
                        )}
                        {state.status === 'recording' && (
                          <button
                            onClick={stopRecording}
                            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-lg font-medium animate-pulse"
                          >
                            <Square className="w-5 h-5" /> Stop Recording
                          </button>
                        )}
                        {state.status === 'transcribing' && (
                          <div className="flex items-center gap-3 text-indigo-400 px-6 py-3 border border-indigo-500/30 rounded-lg">
                            <Loader2 className="w-5 h-5 animate-spin" /> Transcribing...
                          </div>
                        )}
                        {state.status === 'completed' && (
                          <button
                            onClick={() => resetState(q.id)}
                            className="flex items-center gap-2 border border-slate-600 hover:bg-slate-800 text-slate-300 px-6 py-3 rounded-lg font-medium transition-all"
                          >
                            <RefreshCcw className="w-4 h-4" /> Record Again
                          </button>
                        )}
                      </div>

                      {state.text && (
                        <div className="mt-4 p-4 bg-slate-900 border border-slate-800 rounded-lg">
                          <h4 className="text-xs uppercase font-bold text-slate-500 mb-2">Transcription</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{state.text}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="space-y-6">
               <button 
                onClick={() => { setAssessment(null); setCurrentStep(0); }}
                className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 transition-colors"
              >
                ← Take Test Again
              </button>
              
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <BrainCircuit className="text-indigo-400" />
                  Detailed Assessment
                </h2>
                
                <div className="space-y-8">
                  <AssessmentSection 
                    title="Warm-up Critique" 
                    content={assessment.detailedAnalysis.answer1} 
                    icon={<MessageSquare className="w-5 h-5 text-indigo-400" />}
                  />
                  <AssessmentSection 
                    title="Experience Analysis" 
                    content={assessment.detailedAnalysis.answer2} 
                    icon={<BookOpen className="w-5 h-5 text-emerald-400" />}
                  />
                  <AssessmentSection 
                    title="Abstract Reasoning" 
                    content={assessment.detailedAnalysis.answer3} 
                    icon={<Sparkles className="w-5 h-5 text-amber-400" />}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Status and Results */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 space-y-6">
            {!assessment ? (
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-white">Test Status</h2>
                <div className="space-y-4 mb-8">
                  {states.map(s => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Part {s.id}: {QUESTIONS.find(q => q.id === s.id)?.title}</span>
                      <span className={s.status === 'completed' ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                        {s.status === 'completed' ? 'READY' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  disabled={!allCompleted || isAnalyzing}
                  onClick={handleAssess}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${
                    allCompleted 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing Performance...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Generate Assessment
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-indigo-600 border border-indigo-400/30 rounded-2xl p-8 text-white shadow-2xl shadow-indigo-500/20">
                <h2 className="text-sm uppercase tracking-widest font-bold text-indigo-200 mb-2">Estimated Level</h2>
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-7xl font-black">{assessment.overallLevel}</span>
                  <span className="text-lg font-medium text-indigo-200">Proficiency</span>
                </div>

                <div className="space-y-4 mb-8 border-t border-indigo-400/30 pt-6">
                  <Stat label="Vocabulary" value={assessment.breakdown.vocabulary} />
                  <Stat label="Grammar" value={assessment.breakdown.grammar} />
                  <Stat label="Fluency" value={assessment.breakdown.fluency} />
                  <Stat label="Sentence Diversity" value={assessment.breakdown.structure} />
                </div>

                <div className="bg-indigo-800/50 rounded-xl p-4 border border-indigo-400/20">
                  <h3 className="text-xs uppercase font-bold text-indigo-200 mb-3 tracking-wider">Recommendations</h3>
                  <ul className="space-y-2">
                    {assessment.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">How it works</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                As a developer, think of this like a linter for your speech. 
                <br /><br />
                We use <strong>Gemini 3</strong> to capture your audio streams, convert them to raw text data, 
                and then apply a heuristic evaluation based on <strong>CEFR linguistic standards</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-8 border-t border-slate-800 w-full text-center text-slate-600 text-sm">
        Built with Google Gemini API & React • No data is stored permanently.
      </footer>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <h4 className="text-xs font-bold text-indigo-200 uppercase mb-1">{label}</h4>
    <p className="text-sm text-white leading-tight">{value}</p>
  </div>
);

const AssessmentSection: React.FC<{ title: string; content: string; icon: React.ReactNode }> = ({ title, content, icon }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      {icon}
      <h4 className="font-bold text-white tracking-wide">{title}</h4>
    </div>
    <p className="text-slate-400 text-sm leading-relaxed pl-7">
      {content}
    </p>
  </div>
);

export default App;
