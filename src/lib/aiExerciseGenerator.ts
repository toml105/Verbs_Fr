/**
 * AI-Powered Exercise Generator
 * Generates targeted exercises using Ollama AI or a local fallback.
 */

import type { WeaknessReport } from '../types';
import type { OllamaMessage } from './ollama';
import { SYSTEM_PROMPTS } from './aiPrompts';
import { verbs } from '../data/verbs';
import { conjugations } from '../data/conjugations';
import { TENSES } from '../data/tenses';

export interface AIExercise {
  id: string;
  type: 'fill-blank' | 'translation' | 'error-correction' | 'multiple-choice';
  prompt: string;
  correctAnswer: string;
  options?: string[];
  hint?: string;
  explanation?: string;
}

/**
 * Generate exercises targeting the user's weak areas.
 * Uses AI (Ollama) when available, falls back to local generation.
 */
export async function generateExercises(
  weaknesses: WeaknessReport,
  chatFn?: (messages: OllamaMessage[]) => Promise<string>
): Promise<AIExercise[]> {
  // Prepare weak areas summary for AI
  const weakAreas: string[] = [];
  for (const wt of weaknesses.weakTenses.slice(0, 3)) {
    const tenseInfo = TENSES.find((t) => t.key === wt.tense);
    if (tenseInfo) {
      weakAreas.push(tenseInfo.frenchName);
    }
  }
  for (const wv of weaknesses.weakVerbs.filter((v) => v.attempts > 0).slice(0, 3)) {
    weakAreas.push(`verb "${wv.verbId}"`);
  }
  if (weakAreas.length === 0) {
    weakAreas.push('present tense', 'common verbs');
  }

  // Try AI generation first
  if (chatFn) {
    try {
      const exercises = await generateWithAI(chatFn, weakAreas, weaknesses.overallLevel);
      if (exercises.length > 0) return exercises;
    } catch {
      // AI failed, fall through to local generation
    }
  }

  // Fallback: generate locally
  return generateLocalExercises(weaknesses);
}

/**
 * Generate exercises using the Ollama AI.
 */
async function generateWithAI(
  chatFn: (messages: OllamaMessage[]) => Promise<string>,
  weakAreas: string[],
  level: string
): Promise<AIExercise[]> {
  const systemPrompt = SYSTEM_PROMPTS.exerciseGenerator(weakAreas, level);

  const messages: OllamaMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate 5 exercises targeting these areas: ${weakAreas.join(', ')}` },
  ];

  const response = await chatFn(messages);

  // Parse the JSON from the AI response
  return parseAIResponse(response);
}

/**
 * Parse the AI JSON response into AIExercise objects.
 */
function parseAIResponse(response: string): AIExercise[] {
  try {
    // Try to find JSON in the response (AI might wrap it in markdown code blocks)
    let jsonStr = response;
    const jsonMatch = response.match(/\{[\s\S]*"exercises"[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr) as {
      exercises: Array<{
        type: string;
        prompt: string;
        correctAnswer: string;
        options?: string[];
        hint?: string;
        explanation?: string;
      }>;
    };

    if (!parsed.exercises || !Array.isArray(parsed.exercises)) {
      return [];
    }

    return parsed.exercises.map((ex, index) => ({
      id: `ai-${Date.now()}-${index}`,
      type: validateExerciseType(ex.type),
      prompt: ex.prompt || '',
      correctAnswer: ex.correctAnswer || '',
      options: ex.options,
      hint: ex.hint,
      explanation: ex.explanation,
    }));
  } catch {
    return [];
  }
}

/**
 * Validate and normalize exercise type strings.
 */
function validateExerciseType(type: string): AIExercise['type'] {
  const validTypes: AIExercise['type'][] = ['fill-blank', 'translation', 'error-correction', 'multiple-choice'];
  if (validTypes.includes(type as AIExercise['type'])) {
    return type as AIExercise['type'];
  }
  return 'fill-blank';
}

// ============================================================
// Local Fallback Exercise Generation
// ============================================================

const PRONOUNS = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'] as const;

/**
 * Generate exercises locally using verb and conjugation data.
 * Targets the user's weak verbs and tenses.
 */
function generateLocalExercises(weaknesses: WeaknessReport): AIExercise[] {
  const exercises: AIExercise[] = [];

  // Gather target verbs and tenses
  const targetVerbIds = getTargetVerbs(weaknesses);
  const targetTenseKeys = getTargetTenses(weaknesses);

  // Generate a mix of exercise types
  const generators = [
    generateFillBlank,
    generateMultipleChoice,
    generateTranslation,
    generateErrorCorrection,
  ];

  let exerciseCount = 0;
  const maxExercises = 5;

  for (let i = 0; exerciseCount < maxExercises; i++) {
    const verbId = targetVerbIds[i % targetVerbIds.length];
    const tenseKey = targetTenseKeys[i % targetTenseKeys.length];
    const generator = generators[exerciseCount % generators.length];

    const verb = verbs.find((v) => v.id === verbId);
    if (!verb) continue;

    const conj = conjugations[verbId];
    if (!conj || !conj[tenseKey]) continue;

    const exercise = generator(verb.id, verb.infinitive, verb.english, tenseKey, conj[tenseKey], exerciseCount);
    if (exercise) {
      exercises.push(exercise);
      exerciseCount++;
    }

    // Safety: avoid infinite loop
    if (i > maxExercises * 4) break;
  }

  return exercises;
}

/**
 * Get target verbs for exercises, prioritizing weak ones.
 */
function getTargetVerbs(weaknesses: WeaknessReport): string[] {
  const target: string[] = [];

  // Weak verbs with attempts first (real weaknesses)
  for (const wv of weaknesses.weakVerbs.filter((v) => v.attempts > 0).slice(0, 3)) {
    target.push(wv.verbId);
  }

  // Add some common verbs if not enough
  const commonVerbs = ['être', 'avoir', 'faire', 'aller', 'pouvoir', 'vouloir', 'prendre', 'dire', 'manger', 'parler'];
  for (const v of commonVerbs) {
    if (!target.includes(v) && target.length < 5) {
      target.push(v);
    }
  }

  return target.length > 0 ? target : commonVerbs.slice(0, 5);
}

/**
 * Get target tenses for exercises, prioritizing weak ones.
 */
function getTargetTenses(weaknesses: WeaknessReport): string[] {
  const target: string[] = [];

  for (const wt of weaknesses.weakTenses.filter((t) => t.attempts > 0).slice(0, 3)) {
    target.push(wt.tense);
  }

  // Add common tenses if not enough
  const commonTenses = ['PRESENT', 'PASSE_COMPOSE', 'IMPARFAIT', 'FUTUR', 'CONDITIONNEL_PRESENT'];
  for (const t of commonTenses) {
    if (!target.includes(t) && target.length < 3) {
      target.push(t);
    }
  }

  return target.length > 0 ? target : commonTenses.slice(0, 3);
}

/**
 * Generate a fill-in-the-blank exercise.
 */
function generateFillBlank(
  verbId: string,
  infinitive: string,
  english: string,
  tenseKey: string,
  forms: string[],
  index: number
): AIExercise | null {
  const personIdx = index % 6;
  const correctForm = forms[personIdx];
  if (!correctForm) return null;

  const tenseInfo = TENSES.find((t) => t.key === tenseKey);
  const tenseName = tenseInfo?.frenchName ?? tenseKey;
  const pronoun = PRONOUNS[personIdx];

  return {
    id: `local-fb-${Date.now()}-${index}`,
    type: 'fill-blank',
    prompt: `Complete with ${infinitive} (${tenseName}): ${pronoun} ___ `,
    correctAnswer: correctForm,
    hint: `${tenseName} of ${infinitive}`,
    explanation: `The ${tenseName} form of "${infinitive}" (${english}) for ${pronoun} is "${correctForm}".`,
  };
}

/**
 * Generate a multiple-choice exercise.
 */
function generateMultipleChoice(
  verbId: string,
  infinitive: string,
  english: string,
  tenseKey: string,
  forms: string[],
  index: number
): AIExercise | null {
  const personIdx = index % 6;
  const correctForm = forms[personIdx];
  if (!correctForm) return null;

  const tenseInfo = TENSES.find((t) => t.key === tenseKey);
  const tenseName = tenseInfo?.frenchName ?? tenseKey;
  const pronoun = PRONOUNS[personIdx];

  // Create distractors from other person forms and other tenses
  const distractors = new Set<string>();

  // Add forms from other persons of the same tense
  for (let p = 0; p < 6; p++) {
    if (p !== personIdx && forms[p]) {
      distractors.add(forms[p]);
    }
  }

  // Add forms from other tenses if we need more
  const otherTenses = ['PRESENT', 'IMPARFAIT', 'FUTUR', 'CONDITIONNEL_PRESENT'];
  for (const ot of otherTenses) {
    if (ot !== tenseKey && conjugations[verbId]?.[ot]?.[personIdx]) {
      distractors.add(conjugations[verbId][ot][personIdx]);
    }
  }

  // Remove the correct answer from distractors
  distractors.delete(correctForm);

  // Pick 3 distractors
  const distractorArr = Array.from(distractors).slice(0, 3);
  while (distractorArr.length < 3) {
    distractorArr.push(infinitive); // fallback distractor
  }

  // Shuffle options
  const options = [correctForm, ...distractorArr].sort(() => Math.random() - 0.5);

  return {
    id: `local-mc-${Date.now()}-${index}`,
    type: 'multiple-choice',
    prompt: `What is the ${tenseName} form of "${infinitive}" for ${pronoun}?`,
    correctAnswer: correctForm,
    options,
    hint: `Think about the ${tenseName} endings`,
    explanation: `The correct ${tenseName} form of "${infinitive}" (${english}) for ${pronoun} is "${correctForm}".`,
  };
}

/**
 * Generate a translation exercise.
 */
function generateTranslation(
  verbId: string,
  infinitive: string,
  english: string,
  tenseKey: string,
  forms: string[],
  index: number
): AIExercise | null {
  const personIdx = index % 6;
  const correctForm = forms[personIdx];
  if (!correctForm) return null;

  const tenseInfo = TENSES.find((t) => t.key === tenseKey);
  const tenseName = tenseInfo?.frenchName ?? tenseKey;
  const pronoun = PRONOUNS[personIdx];

  const englishPronoun = ['I', 'you', 'he/she', 'we', 'you (plural)', 'they'][personIdx];

  return {
    id: `local-tr-${Date.now()}-${index}`,
    type: 'translation',
    prompt: `Translate to French (${tenseName}): "${englishPronoun} ${english.replace(/^to /, '')}"`,
    correctAnswer: `${pronoun === "je" && startsWithVowelOrH(correctForm) ? "j'" : pronoun + " "}${correctForm}`,
    hint: `Use ${infinitive} in the ${tenseName}`,
    explanation: `"${englishPronoun} ${english.replace(/^to /, '')}" in ${tenseName} is "${pronoun} ${correctForm}".`,
  };
}

/**
 * Generate an error-correction exercise.
 */
function generateErrorCorrection(
  verbId: string,
  infinitive: string,
  english: string,
  tenseKey: string,
  forms: string[],
  index: number
): AIExercise | null {
  const personIdx = index % 6;
  const correctForm = forms[personIdx];
  if (!correctForm) return null;

  const tenseInfo = TENSES.find((t) => t.key === tenseKey);
  const tenseName = tenseInfo?.frenchName ?? tenseKey;
  const pronoun = PRONOUNS[personIdx];

  // Create a wrong form by using a different person's conjugation
  const wrongPersonIdx = (personIdx + 1) % 6;
  const wrongForm = forms[wrongPersonIdx] || correctForm + 's';

  // Only create if the wrong form is actually different
  if (wrongForm === correctForm) return null;

  return {
    id: `local-ec-${Date.now()}-${index}`,
    type: 'error-correction',
    prompt: `Find and fix the error (${tenseName}): "${pronoun} ${wrongForm}"`,
    correctAnswer: `${pronoun} ${correctForm}`,
    hint: `Check the ${tenseName} conjugation for ${pronoun}`,
    explanation: `The correct ${tenseName} form of "${infinitive}" for ${pronoun} is "${correctForm}", not "${wrongForm}".`,
  };
}

function startsWithVowelOrH(word: string): boolean {
  return /^[aeiouhàâäéèêëïîôùûüÿœæ]/i.test(word);
}
