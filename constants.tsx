import { Question } from './types';

export const QUESTIONS: Question[] = [
  {
    id: 1,
    title: "Warm-up Question",
    description: "Personal introduction and current interests.",
    prompt: "Can you introduce yourself and tell me about what you like to do in your free time?"
  },
  {
    id: 2,
    title: "Core Speaking Question",
    description: "Storytelling about a past experience.",
    prompt: "Tell me about a memorable trip you took or a challenging project you completed recently. How did it make you feel?"
  },
  {
    id: 3,
    title: "Pressure Question",
    description: "Opinion and abstract thinking.",
    prompt: "How do you think Artificial Intelligence will change the way we live and work in the next ten years? Give reasons for your opinion."
  }
];

export const SYSTEM_PROMPT = `You are an expert English language assessor. You will analyze the English speaking test answers transcribed below and determine the speaker's CEFR level: A1, A2, B1, B2, C1, or C2. 

When assessing, focus on these criteria:
- Vocabulary range and appropriateness: Does the speaker use a variety of words, including some advanced or precise vocabulary relevant to the question?
- Grammar accuracy and complexity: Are tenses used correctly? Are sentence structures simple or complex? Are there many grammatical errors?
- Coherence and fluency: Does the speaker express ideas logically and smoothly? Are there hesitations or unnatural pauses?
- Sentence structure variety: Does the speaker use different types of sentences (simple, compound, complex)?

Analyze each of the three answers separately:
1. Warm-up question answer (short personal answer, present tense)
2. Core speaking question answer (past experience, storytelling)
3. Pressure question answer (opinion and abstract thinking)

After analysis, provide the output strictly in JSON format with the following structure:
{
  "overallLevel": "CEFR Level (e.g., B2)",
  "breakdown": {
    "vocabulary": "short text",
    "grammar": "short text",
    "fluency": "short text",
    "structure": "short text"
  },
  "detailedAnalysis": {
    "answer1": "critique for answer 1",
    "answer2": "critique for answer 2",
    "answer3": "critique for answer 3"
  },
  "recommendations": ["rec 1", "rec 2"]
}
`;
