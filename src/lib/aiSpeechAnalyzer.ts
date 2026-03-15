import { SYSTEM_PROMPTS } from './aiPrompts';
import type { GrammarCorrection } from '../types';
import type { ChatMessage } from './aiClient';
import { normalizeFrench } from './speechRecognition';

export interface SpeechFeedback {
  overallScore: number;
  grammarCorrect: boolean;
  pronunciationTips: string[];
  corrections: GrammarCorrection[];
  encouragement: string;
}

/**
 * Analyze speech using AI for detailed pronunciation and grammar feedback.
 * Falls back to basic similarity-based scoring if AI response can't be parsed.
 */
export async function analyzeSpeech(
  transcript: string,
  expected: string,
  chatFn: (messages: ChatMessage[]) => Promise<string>
): Promise<SpeechFeedback> {
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_PROMPTS.pronunciationCoach },
      {
        role: 'user',
        content: `Student said: "${transcript}"\nExpected text: "${expected}"\n\nPlease analyze the differences and provide feedback as JSON.`,
      },
    ];

    const response = await chatFn(messages);

    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return buildFallbackFeedback(transcript, expected);
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      overallScore?: number;
      grammarCorrect?: boolean;
      pronunciationTips?: string[];
      corrections?: { original: string; corrected: string; explanation: string; rule?: string }[];
      encouragement?: string;
    };

    return {
      overallScore: Math.min(100, Math.max(0, parsed.overallScore ?? 50)),
      grammarCorrect: parsed.grammarCorrect ?? false,
      pronunciationTips: Array.isArray(parsed.pronunciationTips)
        ? parsed.pronunciationTips.slice(0, 5)
        : [],
      corrections: Array.isArray(parsed.corrections)
        ? parsed.corrections.map(c => ({
            original: c.original ?? '',
            corrected: c.corrected ?? '',
            explanation: c.explanation ?? '',
            rule: c.rule,
          }))
        : [],
      encouragement: parsed.encouragement ?? 'Continue de pratiquer !',
    };
  } catch {
    return buildFallbackFeedback(transcript, expected);
  }
}

/**
 * Build a basic feedback object using string similarity
 * when AI is unavailable or response parsing fails.
 */
function buildFallbackFeedback(transcript: string, expected: string): SpeechFeedback {
  const normalTranscript = normalizeFrench(transcript);
  const normalExpected = normalizeFrench(expected);

  const similarity = computeSimilarity(normalTranscript, normalExpected);
  const score = Math.round(similarity * 100);

  return {
    overallScore: score,
    grammarCorrect: similarity >= 0.75,
    pronunciationTips: score < 70
      ? ['Try speaking more slowly and clearly', 'Listen to the correct pronunciation and repeat']
      : [],
    corrections: normalTranscript !== normalExpected
      ? [{
          original: transcript,
          corrected: expected,
          explanation: 'Your speech did not match the expected text.',
        }]
      : [],
    encouragement: score >= 80
      ? 'Tres bien ! Continue comme ca !'
      : score >= 50
      ? 'Pas mal ! Essaie encore une fois.'
      : 'Continue de pratiquer, tu vas y arriver !',
  };
}

function computeSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = levenshtein(a, b);
  return 1 - distance / maxLen;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  return dp[m][n];
}
