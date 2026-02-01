import { useState } from "react";

type QuestionState = {
  id: number;
  status: "idle" | "recording" | "completed";
  text: string;
};

const QUESTIONS = [
  { id: 1, title: "Warm-up", prompt: "Tell me about yourself." },
  { id: 2, title: "Experience", prompt: "Describe a memorable experience." },
  { id: 3, title: "Opinion", prompt: "Do you agree or disagree with online education?" }
];

export default function App() {
  const [states, setStates] = useState<QuestionState[]>(
    QUESTIONS.map(q => ({
      id: q.id,
      status: "idle",
      text: ""
    }))
  );

  const updateState = (id: number, updates: Partial<QuestionState>) => {
    setStates(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold text-indigo-400 mb-2">
        LinguistAI CEFR Assessor
      </h1>
      <p className="text-slate-400 mb-10">
        UI + state logic çalışıyor ✔
      </p>

      <div className="space-y-6 max-w-2xl">
        {QUESTIONS.map(q => {
          const state = states.find(s => s.id === q.id)!;

          return (
            <div
              key={q.id}
              className="border border-slate-700 rounded-xl p-6 bg-slate-900"
            >
              <h2 className="text-xl font-semibold mb-1">
                {q.id}. {q.title}
              </h2>
              <p className="text-slate-400 italic mb-4">
                “{q.prompt}”
              </p>

              {state.status === "idle" && (
                <button
                  onClick={() =>
                    updateState(q.id, {
                      status: "completed",
                      text: "Dummy transcript (audio next step)"
                    })
                  }
                  className="px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
                >
                  🎤 Simulate Recording
                </button>
              )}

              {state.status === "completed" && (
                <div className="mt-4 bg-slate-800 p-3 rounded">
                  <p className="text-sm text-slate-300">
                    {state.text}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
