import React, { useState, useRef } from 'react';
import {
  Mic,
  Square,
  RefreshCcw,
  Loader2,
  Sparkles
} from 'lucide-react';

type Status = 'idle' | 'recording' | 'transcribing' | 'completed';

interface QuestionState {
  id: number;
  text: string;
  status: Status;
  audioBlob: Blob | null;
}

const QUESTIONS = [
  { id: 1, title: 'Warm-up', prompt: 'Tell me about yourself.' },
  { id: 2, title: 'Experience', prompt: 'Describe a challenge you solved.' },
  { id: 3, title: 'Opinion', prompt: 'Is technology more helpful or harmful?' }
];

const App: React.FC = () => {
  const [states, setStates] = useState<QuestionState[]>(
    QUESTIONS.map(q => ({
      id: q.id,
      text: '',
      status: 'idle',
      audioBlob: null
    }))
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const updateState = (id: number, updates: Partial<QuestionState>) => {
    setStates(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const startRecording = async (id: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        updateState(id, {
          audioBlob: blob,
          status: 'completed',
          text: '🎧 Audio recorded successfully'
        });
        recorder.stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      updateState(id, { status: 'recording' });
    } catch {
      alert('Microphone permission required');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const reset = (id: number) => {
    updateState(id, {
      text: '',
      audioBlob: null,
      status: 'idle'
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 flex items-center gap-2">
        <Sparkles className="text-indigo-400" />
        LinguistAI – CEFR Assessor
      </h1>

      <div className="space-y-6">
        {QUESTIONS.map(q => {
          const state = states.find(s => s.id === q.id)!;

          return (
            <div
              key={q.id}
              className="border border-slate-700 rounded-xl p-6 bg-slate-800"
            >
              <h2 className="text-xl font-semibold mb-2">
                {q.id}. {q.title}
              </h2>
              <p className="text-slate-400 mb-4">“{q.prompt}”</p>

              <div className="flex gap-3 mb-4">
                {state.status === 'idle' && (
                  <button
                    onClick={() => startRecording(q.id)}
                    className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-lg"
                  >
                    <Mic size={18} /> Record
                  </button>
                )}

                {state.status === 'recording' && (
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 bg-rose-600 px-4 py-2 rounded-lg animate-pulse"
                  >
                    <Square size={18} /> Stop
                  </button>
                )}

                {state.status === 'completed' && (
                  <button
                    onClick={() => reset(q.id)}
                    className="flex items-center gap-2 border border-slate-500 px-4 py-2 rounded-lg"
                  >
                    <RefreshCcw size={16} /> Re-record
                  </button>
                )}

                {state.status === 'transcribing' && (
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Loader2 className="animate-spin" /> Processing…
                  </div>
                )}
              </div>

              {state.text && (
                <p className="text-sm text-emerald-400">{state.text}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
